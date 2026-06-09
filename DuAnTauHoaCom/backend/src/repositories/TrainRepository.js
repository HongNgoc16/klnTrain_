const { Op } = require('sequelize')
const { sequelize } = require('../config/database')
const {
  Tau, LichChay, ChuyenTau, GaTau,
  CauHinhToa, ToaChuyen, LoaiToa, LoaiGhe, CauHinhGhe,
  LichTrinhChuyen, TamGiuGhe, Ve, GheChuyen, GheChang,
} = require('../models')

const VN_NOW = `DATEADD(HOUR, 7, GETUTCDATE())`

// ─── Helper: lấy thu_tu_dung + offset_phut của một ga trong lịch chạy ───
const getStopInfo = async (idLichChay, idGa) => {
  const [row] = await sequelize.query(
    `SELECT thu_tu_dung, offset_phut, khoang_cach_km, gio_den, gio_di
     FROM LichTrinhChuyen WHERE id_lich_chay = :lc AND id_ga = :ga`,
    { replacements: { lc: idLichChay, ga: idGa }, type: sequelize.QueryTypes.SELECT }
  )
  return row || null
}

// ─── Helper: lấy id_loai_toa của toa trong chuyến (ưu tiên ToaChuyen, fallback CauHinhToa) ───
const getLoaiToaChuyen = async (idChuyen, idTau, soToaThuTu) => {
  const tc = await ToaChuyen.findOne({
    where: { id_chuyen: idChuyen, so_toa_thu_tu: soToaThuTu },
    attributes: ['id_loai_toa', 'so_ghe_toi_da'],
  })
  if (tc) return { id_loai_toa: tc.id_loai_toa, so_ghe_toi_da: tc.so_ghe_toi_da }

  const cht = await CauHinhToa.findOne({
    where: { id_tau: idTau, so_toa_thu_tu: soToaThuTu },
    include: [{ model: LoaiToa, attributes: ['id_loai_toa', 'so_cho_toi_da'] }],
  })
  if (!cht) return null
  return { id_loai_toa: cht.id_loai_toa, so_ghe_toi_da: cht.LoaiToa?.so_cho_toi_da }
}

// ─── Tìm chuyến tàu qua LichTrinhChuyen (hỗ trợ ga trung gian) ──────────
const searchChuyen = async (idGaDi, idGaDen, ngayChay) => {
  // Tìm tất cả lịch chạy có cả hai ga theo đúng thứ tự
  // Case 1: Có LichTrinhChuyen → check intermediate stops
  // Case 2: Fallback → dùng LichChay.id_ga_di / id_ga_den trực tiếp
  //         (cho các lịch chưa có LichTrinhChuyen nhưng vẫn đúng tuyến)
  const lichChayList = await sequelize.query(
    `SELECT DISTINCT lc.id_lich_chay
     FROM LichChay lc
     WHERE
       -- Case 1: Có dữ liệu LichTrinhChuyen cho cả hai ga, đúng thứ tự
       EXISTS (
           SELECT 1 FROM LichTrinhChuyen ltc_di
           JOIN  LichTrinhChuyen ltc_den
             ON  ltc_den.id_lich_chay = lc.id_lich_chay AND ltc_den.id_ga = :idGaDen
           WHERE ltc_di.id_lich_chay = lc.id_lich_chay AND ltc_di.id_ga = :idGaDi
             AND ltc_di.thu_tu_dung < ltc_den.thu_tu_dung
       )
       OR
       -- Case 2: Không có LichTrinhChuyen nhưng LichChay khớp ga đầu/cuối tuyến
       (
           NOT EXISTS (SELECT 1 FROM LichTrinhChuyen WHERE id_lich_chay = lc.id_lich_chay)
           AND lc.id_ga_di  = :idGaDi
           AND lc.id_ga_den = :idGaDen
       )`,
    { replacements: { idGaDi, idGaDen }, type: sequelize.QueryTypes.SELECT }
  )
  if (!lichChayList.length) return []
  const ids = lichChayList.map(r => r.id_lich_chay)

  return ChuyenTau.findAll({
    where: {
      ngay_chay: ngayChay,
      // Hiển thị tất cả trạng thái kể cả da_chay — frontend sẽ disable nút chọn chỗ
      // Chỉ lọc bỏ 'huy' (chuyến đã bị hủy hoàn toàn)
      trang_thai: { [Op.notIn]: ['huy'] },
    },
    include: [
      {
        model: LichChay,
        required: true,
        where: { id_lich_chay: { [Op.in]: ids } },
        include: [
          { model: Tau, attributes: ['id_tau', 'so_hieu', 'ten_tau', 'so_toa'] },
          { model: GaTau, as: 'GaDi',  attributes: ['id_ga', 'ten_ga', 'ma_ga_viet_tat'] },
          { model: GaTau, as: 'GaDen', attributes: ['id_ga', 'ten_ga', 'ma_ga_viet_tat'] },
        ],
      },
    ],
    order: [[LichChay, 'gio_khoi_hanh', 'ASC']],
  })
}

// ─── Danh sách toa của chuyến (ưu tiên ToaChuyen runtime) ────────────────
const getCoachesByChuyen = async (idChuyen) => {
  const chuyen = await ChuyenTau.findByPk(idChuyen, {
    include: [{ model: LichChay, include: [{ model: Tau }] }],
  })
  if (!chuyen) return []

  const idTau = chuyen.LichChay.Tau.id_tau

  // Thử lấy ToaChuyen runtime trước
  const toaChuyens = await ToaChuyen.findAll({
    where: { id_chuyen: idChuyen },
    include: [{ model: LoaiToa }],
    order: [['so_toa_thu_tu', 'ASC']],
  })
  if (toaChuyens.length > 0) return toaChuyens

  // Fallback về template CauHinhToa
  return CauHinhToa.findAll({
    where: { id_tau: idTau },
    include: [{ model: LoaiToa }],
    order: [['so_toa_thu_tu', 'ASC']],
  })
}

// ─── Sơ đồ ghế với segment-aware availability ────────────────────────────
// idGaLen, idGaXuong: nếu cung cấp thì chỉ đánh dấu ghế bị chiếm cho đúng chặng đó
const getSeatMap = async (idChuyen, soToaThuTu, idGaLen = null, idGaXuong = null) => {
  const chuyen = await ChuyenTau.findByPk(idChuyen, {
    include: [{ model: LichChay, attributes: ['id_lich_chay', 'gio_khoi_hanh', 'id_tau'] }],
  })
  if (!chuyen) return null

  const idLichChay = chuyen.LichChay.id_lich_chay
  const idTau      = chuyen.LichChay.id_tau

  // Lấy loai_toa (ưu tiên ToaChuyen)
  const toaInfo = await getLoaiToaChuyen(idChuyen, idTau, soToaThuTu)
  if (!toaInfo) return null

  let cauHinhGhe = await CauHinhGhe.findAll({
    where:   { id_loai_toa: toaInfo.id_loai_toa },
    include: [{ model: LoaiGhe }],
    order:   [['so_ghe_trong_toa', 'ASC']],
  })

  // Fallback: nếu CauHinhGhe rỗng cho LoaiToa này
  // → tự sinh seat list từ so_ghe_toi_da (số ghế đơn giản, không có layout)
  if (cauHinhGhe.length === 0 && (toaInfo.so_ghe_toi_da || 0) > 0) {
    const maxGhe = toaInfo.so_ghe_toi_da
    const loaiGheDefault = await LoaiGhe.findOne({ where: { id_loai_toa: toaInfo.id_loai_toa } })
    cauHinhGhe = Array.from({ length: maxGhe }, (_, i) => ({
      so_ghe_trong_toa: i + 1,
      id_loai_toa:      toaInfo.id_loai_toa,
      vi_tri:           null,
      tang:             null,
      khoang_so:        Math.ceil((i + 1) / 4),
      ben:              ['A','B','C','D'][i % 4],
      LoaiGhe:          loaiGheDefault || null,
    }))
  }

  // Lấy trạng thái ghế từ GheChang (nguồn sự thật duy nhất)
  let soldSet = new Set()
  let heldSet = new Set()

  // Lấy tất cả GheChuyen của toa này
  const gheChuyenList = await GheChuyen.findAll({
    where: { id_chuyen: idChuyen, so_toa_thu_tu: soToaThuTu },
    attributes: ['id_ghe_chuyen', 'so_ghe_trong_toa'],
  })
  const gheMap = Object.fromEntries(gheChuyenList.map(g => [g.id_ghe_chuyen, g.so_ghe_trong_toa]))
  const gheIds = gheChuyenList.map(g => g.id_ghe_chuyen)

  if (gheIds.length > 0) {
    // Lấy thu_tu cho segment nếu có
    let thuTuTu = null, thuTuDen = null
    if (idGaLen && idGaXuong) {
      const stopLen = await getStopInfo(idLichChay, idGaLen)
      const stopXuo = await getStopInfo(idLichChay, idGaXuong)
      if (stopLen && stopXuo) {
        thuTuTu = stopLen.thu_tu_dung
        thuTuDen = stopXuo.thu_tu_dung
      }
    }

    // Nguồn 1: Ve table (vé đã đặt, segment-aware) → soldSet
    // Nguồn 2: GheChang holds chưa có Ve (id_ve IS NULL) → heldSet
    // Dùng 2 query riêng để phân biệt sold vs held trên seat map
    const gheIdList = gheIds.join(',')

    if (thuTuTu !== null && thuTuDen !== null) {
      const [veSold, gheHeld] = await Promise.all([
        sequelize.query(
          // Ve với ga_len/xuong đầy đủ: check segment overlap
          // Ve với ga_len/xuong NULL: coi là chiếm toàn tuyến → sold cho mọi chặng
          `SELECT v.so_ghe_trong_toa
           FROM Ve v
           LEFT JOIN LichTrinhChuyen len_ex
             ON len_ex.id_lich_chay = ${idLichChay} AND len_ex.id_ga = v.id_ga_len
           LEFT JOIN LichTrinhChuyen xuo_ex
             ON xuo_ex.id_lich_chay = ${idLichChay} AND xuo_ex.id_ga = v.id_ga_xuong
           WHERE v.id_chuyen = ${idChuyen}
             AND v.so_toa_thu_tu = ${soToaThuTu}
             AND v.trang_thai NOT IN ('da_huy','da_doi')
             AND (
               v.id_ga_len IS NULL OR v.id_ga_xuong IS NULL
               OR (len_ex.thu_tu_dung < ${thuTuDen} AND xuo_ex.thu_tu_dung > ${thuTuTu})
             )`,
          { type: sequelize.QueryTypes.SELECT }
        ),
        sequelize.query(
          `SELECT gc.so_ghe_trong_toa
           FROM GheChang gch
           JOIN GheChuyen gc ON gc.id_ghe_chuyen = gch.id_ghe_chuyen
           WHERE gc.id_ghe_chuyen IN (${gheIdList})
             AND gch.trang_thai = 'dang_giu'
             AND gch.id_ve IS NULL
             AND gch.thu_tu_tu < ${thuTuDen}
             AND gch.thu_tu_den > ${thuTuTu}
             AND gch.thoi_gian_het_han > DATEADD(HOUR,7,GETUTCDATE())`,
          { type: sequelize.QueryTypes.SELECT }
        ),
      ])
      veSold.forEach(r => soldSet.add(r.so_ghe_trong_toa))
      gheHeld.forEach(r => { if (!soldSet.has(r.so_ghe_trong_toa)) heldSet.add(r.so_ghe_trong_toa) })
    } else {
      // Fallback: không có LichTrinhChuyen → đánh dấu tất cả Ve active trên toa này
      const [veSold, gheHeld] = await Promise.all([
        sequelize.query(
          `SELECT v.so_ghe_trong_toa FROM Ve v
           WHERE v.id_chuyen = ${idChuyen}
             AND v.so_toa_thu_tu = ${soToaThuTu}
             AND v.trang_thai NOT IN ('da_huy','da_doi')`,
          { type: sequelize.QueryTypes.SELECT }
        ),
        sequelize.query(
          `SELECT gc.so_ghe_trong_toa
           FROM GheChang gch
           JOIN GheChuyen gc ON gc.id_ghe_chuyen = gch.id_ghe_chuyen
           WHERE gc.id_ghe_chuyen IN (${gheIdList})
             AND gch.trang_thai = 'dang_giu'
             AND gch.id_ve IS NULL
             AND gch.thoi_gian_het_han > DATEADD(HOUR,7,GETUTCDATE())`,
          { type: sequelize.QueryTypes.SELECT }
        ),
      ])
      veSold.forEach(r => soldSet.add(r.so_ghe_trong_toa))
      gheHeld.forEach(r => { if (!soldSet.has(r.so_ghe_trong_toa)) heldSet.add(r.so_ghe_trong_toa) })
    }
  }

  return {
    loaiToa:   { id_loai_toa: toaInfo.id_loai_toa, so_cho_toi_da: toaInfo.so_ghe_toi_da },
    soToaThuTu,
    seats: cauHinhGhe.map(g => ({
      soGhe:    g.so_ghe_trong_toa,
      loaiGhe:  g.LoaiGhe,
      viTri:    g.vi_tri,
      tang:     g.tang,
      khoangSo: g.khoang_so,
      ben:      g.ben,
      trangThai: soldSet.has(g.so_ghe_trong_toa)    ? 'sold'
               : heldSet.has(g.so_ghe_trong_toa)    ? 'held'
               : 'empty',
    })),
  }
}

// ─── Lấy thông tin lịch trình (dừng dọc đường) ────────────────────────
const getLichTrinh = async (idLichChay) =>
  LichTrinhChuyen.findAll({
    where:   { id_lich_chay: idLichChay },
    include: [{ model: GaTau }],
    order:   [['thu_tu_dung', 'ASC']],
  })

// ─── Danh sách ga đang hoạt động ─────────────────────────────────────
const getAllGa = async () =>
  GaTau.findAll({
    where: { trang_thai: 'hoat_dong' },
    order: [['do_uu_tien', 'DESC']],
  })

module.exports = { searchChuyen, getCoachesByChuyen, getSeatMap, getLichTrinh, getAllGa, getStopInfo }
