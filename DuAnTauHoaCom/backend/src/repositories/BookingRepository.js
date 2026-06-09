const { Op } = require('sequelize')
const { sequelize } = require('../config/database')
const {
  DonDatVe, Ve, HanhKhach, ThanhToan, HoaDon,
  ChuyenTau, LichChay, Tau, GaTau, TamGiuGhe, KhuyenMai,
  GheChuyen, GheChang, CauHinhToa, ToaChuyen, CauHinhGhe, LoaiGhe,
} = require('../models')

const VN_OFFSET = 7 * 60 * 60 * 1000
const fmtDt = (d) =>
  sequelize.literal(`'${new Date(new Date(d).getTime() + VN_OFFSET).toISOString().replace('T', ' ').slice(0, 23)}'`)
const VN_NOW = `DATEADD(HOUR, 7, GETUTCDATE())`

// ─── Helper: lấy id_lich_chay + thu_tu_dung cho một ga ───────────────
const getLichChayId = async (idChuyen) => {
  const [row] = await sequelize.query(
    'SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen = :id',
    { replacements: { id: idChuyen }, type: sequelize.QueryTypes.SELECT }
  )
  return row?.id_lich_chay || null
}

const getThuTu = async (idLichChay, idGa) => {
  if (!idLichChay || !idGa) return null
  const [row] = await sequelize.query(
    'SELECT thu_tu_dung FROM LichTrinhChuyen WHERE id_lich_chay = :lc AND id_ga = :ga',
    { replacements: { lc: idLichChay, ga: idGa }, type: sequelize.QueryTypes.SELECT }
  )
  return row?.thu_tu_dung ?? null
}

// ─── Đảm bảo GheChuyen đã được populate cho chuyến ──────────────────
// Gọi SP sp_EnsureGheChuyen (hoặc tự tạo trong JS nếu SP chưa có)
const ensureGheChuyen = async (idChuyen) => {
  try {
    await sequelize.query('EXEC sp_EnsureGheChuyen :id', {
      replacements: { id: idChuyen },
    })
  } catch {
    // Fallback JS nếu SP chưa tồn tại
    const count = await GheChuyen.count({ where: { id_chuyen: idChuyen } })
    if (count > 0) return

    const chuyen = await ChuyenTau.findByPk(idChuyen, {
      include: [{ model: LichChay, attributes: ['id_tau'] }],
    })
    if (!chuyen) return
    const idTau = chuyen.LichChay.id_tau

    const toaList = await (async () => {
      const tc = await ToaChuyen.findAll({ where: { id_chuyen: idChuyen } })
      if (tc.length > 0) return tc.map(t => ({ so_toa_thu_tu: t.so_toa_thu_tu, id_loai_toa: t.id_loai_toa }))
      const cht = await CauHinhToa.findAll({ where: { id_tau: idTau } })
      return cht.map(c => ({ so_toa_thu_tu: c.so_toa_thu_tu, id_loai_toa: c.id_loai_toa }))
    })()

    for (const toa of toaList) {
      const ghes = await CauHinhGhe.findAll({ where: { id_loai_toa: toa.id_loai_toa } })
      const records = ghes.map(g => ({
        id_chuyen: idChuyen, so_toa_thu_tu: toa.so_toa_thu_tu,
        so_ghe_trong_toa: g.so_ghe_trong_toa, id_loai_ghe: g.id_loai_ghe,
      }))
      if (records.length) await GheChuyen.bulkCreate(records, { ignoreDuplicates: true })
    }
  }
}

// ─── Lấy id_ghe_chuyen cho danh sách ghế ─────────────────────────────
const getGheChuyenIds = async (idChuyen, soToaThuTu, soGheList) => {
  const rows = await GheChuyen.findAll({
    where: {
      id_chuyen: idChuyen,
      so_toa_thu_tu: soToaThuTu,
      so_ghe_trong_toa: { [Op.in]: soGheList },
    },
    attributes: ['id_ghe_chuyen', 'so_ghe_trong_toa'],
  })
  return rows
}

// ─── Kiểm tra segment overlap qua GheChang (CORE LOGIC) ─────────────
// Overlap: thu_tu_tu_cũ < thuTuDen_mới AND thu_tu_den_cũ > thuTuTu_mới
// Với [1,8) và [8,28): 1<28=TRUE but 8>8=FALSE → KHÔNG overlap → cho đặt
const checkGheChangOverlap = async (gheChuyenIds, thuTuTu, thuTuDen, excludeSessionId = null) => {
  const ids = gheChuyenIds.map(g => (typeof g === 'object' ? g.id_ghe_chuyen : g))
  if (!ids.length) return 0

  const idList     = ids.join(',')
  const excludeSQL = excludeSessionId
    ? `AND gc.session_id <> '${excludeSessionId.replace(/'/g, "''")}'`
    : ''

  const [row] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM GheChang gc
     WHERE gc.id_ghe_chuyen IN (${idList})
       AND gc.trang_thai IN ('dang_giu','da_dat')
       AND gc.thu_tu_tu < ${thuTuDen}
       AND gc.thu_tu_den > ${thuTuTu}
       AND (gc.thoi_gian_het_han IS NULL
            OR gc.thoi_gian_het_han > DATEADD(HOUR, 7, GETUTCDATE()))
       ${excludeSQL}`,
    { type: sequelize.QueryTypes.SELECT }
  )
  return parseInt(row?.cnt ?? 0)
}

// ─── Queries cho lookup (không thay đổi) ─────────────────────────────
const findByMaDon = (maDon) =>
  DonDatVe.findOne({
    where: { ma_don: maDon },
    include: [
      { model: Ve, include: [{ model: HanhKhach }, { model: ChuyenTau, include: [{ model: LichChay, include: [{ model: Tau }, { model: GaTau, as: 'GaDi' }, { model: GaTau, as: 'GaDen' }] }] }, { model: GaTau, as: 'GaLen' }, { model: GaTau, as: 'GaXuong' }] },
      { model: ThanhToan }, { model: KhuyenMai },
    ],
  })

const findByMaDatCho = (maDatCho) =>
  DonDatVe.findOne({
    where: { ma_dat_cho: maDatCho.toUpperCase().trim() },
    include: [
      { model: Ve, include: [{ model: HanhKhach }, { model: ChuyenTau, include: [{ model: LichChay, include: [Tau, { model: GaTau, as: 'GaDi' }, { model: GaTau, as: 'GaDen' }] }] }, { model: GaTau, as: 'GaLen' }, { model: GaTau, as: 'GaXuong' }] },
      { model: ThanhToan },
    ],
  })

const findByTaiKhoan = (idTaiKhoan) =>
  DonDatVe.findAll({
    where: { id_tai_khoan: idTaiKhoan },
    include: [
      { model: Ve, include: [{ model: HanhKhach }, { model: ChuyenTau, include: [{ model: LichChay, include: [Tau, { model: GaTau, as: 'GaDi' }, { model: GaTau, as: 'GaDen' }] }] }, { model: GaTau, as: 'GaLen' }, { model: GaTau, as: 'GaXuong' }] },
      { model: ThanhToan },
    ],
    order: [['thoi_gian_dat', 'DESC']],
  })

// ─── Dọn dẹp TamGiuGhe + Ve + GheChang hết hạn ──────────────────────
const cleanupExpiredForSeats = async (idChuyen, soToaThuTu, soGheList) => {
  const gheListStr = soGheList.map(Number).join(',')
  const ic = parseInt(idChuyen), st = parseInt(soToaThuTu)

  // 1. Tìm đơn đã hết hạn qua raw SQL (tránh Sequelize literal datetime issue)
  const expiredHolds = await sequelize.query(
    `SELECT DISTINCT id_don_dat_ve FROM TamGiuGhe
     WHERE id_chuyen = ${ic} AND so_toa_thu_tu = ${st}
       AND so_ghe_trong_toa IN (${gheListStr})
       AND id_don_dat_ve IS NOT NULL
       AND thoi_gian_het_han <= DATEADD(HOUR, 7, GETUTCDATE())`,
    { type: sequelize.QueryTypes.SELECT }
  )
  const donIds = [...new Set(expiredHolds.map(h => h.id_don_dat_ve).filter(Boolean))]
  if (donIds.length > 0) {
    const donList = donIds.join(',')
    await sequelize.query(
      `UPDATE Ve SET trang_thai='da_huy' WHERE id_don_dat_ve IN (${donList}) AND trang_thai='cho_xac_nhan'`
    )
    await sequelize.query(
      `UPDATE DonDatVe SET trang_thai='het_han' WHERE id_don_dat_ve IN (${donList}) AND trang_thai='cho_thanh_toan'`
    )
  }

  // 2. Dọn GheChang hết hạn HOẶC unlinked (id_ve IS NULL) > 12 phút
  //    (giảm window cho abandoned sessions từ 15 → 12 phút)
  await sequelize.query(
    `UPDATE GheChang SET trang_thai='trong'
     WHERE trang_thai='dang_giu'
       AND id_ghe_chuyen IN (
           SELECT id_ghe_chuyen FROM GheChuyen
           WHERE id_chuyen=${ic} AND so_toa_thu_tu=${st}
             AND so_ghe_trong_toa IN (${gheListStr})
       )
       AND (
         thoi_gian_het_han <= DATEADD(HOUR, 7, GETUTCDATE())
         OR (id_ve IS NULL AND thoi_gian_het_han <= DATEADD(MINUTE, 3, DATEADD(HOUR, 7, GETUTCDATE())))
       )`
  )

  // 3. Dọn TamGiuGhe hết hạn
  await sequelize.query(
    `DELETE FROM TamGiuGhe
     WHERE id_chuyen=${ic} AND so_toa_thu_tu=${st}
       AND so_ghe_trong_toa IN (${gheListStr})
       AND trang_thai <> 'da_dat'
       AND (trang_thai IN ('da_giai_phong','het_han')
            OR thoi_gian_het_han <= DATEADD(HOUR, 7, GETUTCDATE()))`
  )
}

// ─── Giữ ghế: TamGiuGhe + GheChang(dang_giu) ────────────────────────
const holdSeats = async (idChuyen, soToaThuTu, soGheList, sessionId, idDonDatVe = null, idGaLen = null, idGaXuong = null) => {
  await cleanupExpiredForSeats(idChuyen, soToaThuTu, soGheList)
  await ensureGheChuyen(idChuyen)

  const now    = new Date()
  const hetHan = new Date(Date.now() + 15 * 60 * 1000)

  // Lấy thu_tu_dung nếu có ga info
  let thuTuTu = null, thuTuDen = null
  if (idGaLen && idGaXuong) {
    const idLichChay = await getLichChayId(idChuyen)
    if (idLichChay) {
      thuTuTu = await getThuTu(idLichChay, idGaLen)
      thuTuDen = await getThuTu(idLichChay, idGaXuong)
    }
  }

  const gheChuyenRows = await getGheChuyenIds(idChuyen, soToaThuTu, soGheList)
  const gheMap = Object.fromEntries(gheChuyenRows.map(g => [g.so_ghe_trong_toa, g.id_ghe_chuyen]))

  await Promise.all(soGheList.map(async (soGhe) => {
    await TamGiuGhe.create({
      id_chuyen: idChuyen, so_toa_thu_tu: soToaThuTu,
      so_ghe_trong_toa: soGhe,
      session_id: sessionId, id_don_dat_ve: idDonDatVe,
      id_ga_len: idGaLen, id_ga_xuong: idGaXuong,
      trang_thai: 'dang_giu',
      thoi_gian_giu: fmtDt(now), thoi_gian_het_han: fmtDt(hetHan),
    })
    // Tạo GheChang nếu có đủ thông tin chặng
    const idGheChuyen = gheMap[soGhe]
    if (idGheChuyen && thuTuTu !== null && thuTuDen !== null) {
      // Xóa GheChang cũ của session này trước
      await sequelize.query(
        `DELETE FROM GheChang WHERE id_ghe_chuyen=${parseInt(idGheChuyen)} AND session_id='${sessionId.replace(/'/g,"''")}'`
      )
      // Insert bằng raw SQL để tránh Sequelize datetime conversion issue
      await sequelize.query(
        `INSERT INTO GheChang(id_ghe_chuyen,thu_tu_tu,thu_tu_den,trang_thai,session_id,thoi_gian_het_han)
         VALUES(${parseInt(idGheChuyen)},${thuTuTu},${thuTuDen},'dang_giu',
                '${sessionId.replace(/'/g,"''")}',
                DATEADD(MINUTE,15,DATEADD(HOUR,7,GETUTCDATE())))`
      )
    }
  }))
}

// ─── Giải phóng ghế theo session ─────────────────────────────────────
const releaseHoldBySession = async (sessionId) => {
  const sid = sessionId.replace(/'/g, "''")
  await sequelize.query(
    `UPDATE GheChang SET trang_thai='trong' WHERE session_id='${sid}' AND trang_thai='dang_giu'`
  )
  await sequelize.query(
    `DELETE FROM TamGiuGhe WHERE session_id='${sid}' AND trang_thai='dang_giu' AND id_don_dat_ve IS NULL`
  )
}

// ─── Kiểm tra ghế còn trống theo chặng (dùng GheChang) ──────────────
const checkSeatsAvailable = async (idChuyen, soToaThuTu, soGheList, idGaLen = null, idGaXuong = null, excludeSessionId = null) => {
  await cleanupExpiredForSeats(idChuyen, soToaThuTu, soGheList)
  await ensureGheChuyen(idChuyen)

  const gheChuyenRows = await getGheChuyenIds(idChuyen, soToaThuTu, soGheList)
  if (!gheChuyenRows.length) return true

  const idLichChay = await getLichChayId(idChuyen)

  // Nếu không có idGaLen/idGaXuong → fallback lấy từ LichChay (endpoint của tuyến)
  let gaLen  = idGaLen
  let gaXuong = idGaXuong
  if ((!gaLen || !gaXuong) && idLichChay) {
    const [lc] = await sequelize.query(
      'SELECT id_ga_di, id_ga_den FROM LichChay WHERE id_lich_chay = :lc',
      { replacements: { lc: idLichChay }, type: sequelize.QueryTypes.SELECT }
    )
    if (lc) { gaLen = gaLen || lc.id_ga_di; gaXuong = gaXuong || lc.id_ga_den }
  }

  // Lấy thu_tu_dung cho segment check
  let thuTuTu = null, thuTuDen = null
  if (gaLen && gaXuong && idLichChay) {
    thuTuTu = await getThuTu(idLichChay, gaLen)
    thuTuDen = await getThuTu(idLichChay, gaXuong)
  }

  if (thuTuTu !== null && thuTuDen !== null) {
    // 1. GheChang segment check (confirmed + active holds)
    const overlapCount = await checkGheChangOverlap(gheChuyenRows, thuTuTu, thuTuDen, excludeSessionId)
    if (overlapCount > 0) return false

    // 2. Ve trực tiếp - fallback cho Ve cũ có id_ga_len/xuong NULL (toàn tuyến)
    //    hoặc Ve có segment overlap mà GheChang chưa được tạo
    const gheListStr2 = gheChuyenRows.map(g => g.so_ghe_trong_toa).join(',')
    if (gheListStr2) {
      const [veCheck] = await sequelize.query(
        `SELECT COUNT(*) AS cnt FROM Ve v
         LEFT JOIN LichTrinhChuyen len_ex
           ON len_ex.id_lich_chay = (SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen=${parseInt(idChuyen)})
              AND len_ex.id_ga = v.id_ga_len
         LEFT JOIN LichTrinhChuyen xuo_ex
           ON xuo_ex.id_lich_chay = (SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen=${parseInt(idChuyen)})
              AND xuo_ex.id_ga = v.id_ga_xuong
         WHERE v.id_chuyen = ${parseInt(idChuyen)}
           AND v.so_toa_thu_tu = ${parseInt(soToaThuTu)}
           AND v.so_ghe_trong_toa IN (${gheListStr2})
           AND v.trang_thai NOT IN ('da_huy','da_doi')
           AND (
             v.id_ga_len IS NULL OR v.id_ga_xuong IS NULL
             OR (len_ex.thu_tu_dung < ${thuTuDen} AND xuo_ex.thu_tu_dung > ${thuTuTu})
           )`,
        { type: sequelize.QueryTypes.SELECT }
      )
      if (parseInt(veCheck?.cnt ?? 0) > 0) return false
    }
    return true
  }

  // Fallback cuối: không có LichTrinhChuyen → kiểm tra toàn tuyến
  const idList    = gheChuyenRows.map(g => g.id_ghe_chuyen).join(',')
  const excl      = excludeSessionId ? `AND session_id <> '${excludeSessionId.replace(/'/g,"''")}'` : ''
  const [fallback] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM GheChang
     WHERE id_ghe_chuyen IN (${idList})
       AND trang_thai IN ('dang_giu','da_dat')
       AND (thoi_gian_het_han IS NULL OR thoi_gian_het_han > DATEADD(HOUR,7,GETUTCDATE()))
       ${excl}`,
    { type: sequelize.QueryTypes.SELECT }
  )
  return parseInt(fallback?.cnt ?? 0) === 0
}

// ─── Xác nhận GheChang sau khi thanh toán ────────────────────────────
// FIX DEADLOCK: phải dùng cùng transaction để tránh lock conflict với Ve.update
const confirmGheChang = async (idDonDatVe, transaction = null) => {
  // Dùng raw SQL để tránh double-query và đảm bảo transaction scope
  const tx = transaction ? `; SELECT 1` : ''  // dummy để không bị cache
  await sequelize.query(
    `UPDATE GheChang
     SET trang_thai='da_dat', thoi_gian_het_han=NULL, session_id=NULL
     WHERE trang_thai IN ('dang_giu', 'da_dat')
       AND id_ve IN (
           SELECT id_ve FROM Ve WHERE id_don_dat_ve = :idDon
       )`,
    {
      replacements: { idDon: idDonDatVe },
      ...(transaction ? { transaction } : {}),
    }
  )
}

// ─── Gắn id_ve vào GheChang khi tạo booking ─────────────────────────
// Sau khi holdSeats tạo GheChang('dang_giu', session_id),
// createBooking gọi hàm này để link id_ve vào GheChang nhưng GIỮ 'dang_giu'
// → chỉ 'da_dat' sau khi thanh toán (confirmGheChang)
const createGheChangForVe = async (ve, thuTuTu, thuTuDen, sessionId = null, transaction = null) => {
  const gheChuyen = await GheChuyen.findOne({
    where: { id_chuyen: ve.id_chuyen, so_toa_thu_tu: ve.so_toa_thu_tu, so_ghe_trong_toa: ve.so_ghe_trong_toa },
  })
  if (!gheChuyen) return null
  if (thuTuTu === null || thuTuDen === null) return null

  const gcId = parseInt(gheChuyen.id_ghe_chuyen)
  const veId = parseInt(ve.id_ve)

  // Nếu có sessionId → link id_ve vào GheChang 'dang_giu' (GIỮ trang_thai)
  if (sessionId) {
    const sid = sessionId.replace(/'/g, "''")
    const [result] = await sequelize.query(
      `UPDATE GheChang SET id_ve=${veId}
       WHERE id_ghe_chuyen=${gcId} AND session_id='${sid}' AND trang_thai='dang_giu'`,
      { ...(transaction ? { transaction } : {}), type: sequelize.QueryTypes.UPDATE }
    )
    if (result > 0) return
  }

  // Không qua holdSeats → tạo mới với raw SQL
  return sequelize.query(
    `INSERT INTO GheChang(id_ghe_chuyen,thu_tu_tu,thu_tu_den,trang_thai,id_ve,thoi_gian_het_han)
     VALUES(${gcId},${thuTuTu},${thuTuDen},'dang_giu',${veId},
            DATEADD(MINUTE,15,DATEADD(HOUR,7,GETUTCDATE())))`,
    { ...(transaction ? { transaction } : {}) }
  )
}

// ─── Giải phóng GheChang khi hủy vé ─────────────────────────────────
const freeGheChang = async (idVe, transaction = null) =>
  sequelize.query(
    `UPDATE GheChang SET trang_thai='trong', thoi_gian_het_han=NULL
     WHERE id_ve=${parseInt(idVe)} AND trang_thai IN ('dang_giu','da_dat')`,
    { ...(transaction ? { transaction } : {}) }
  )

module.exports = {
  findByMaDon, findByMaDatCho, findByTaiKhoan,
  holdSeats, releaseHoldBySession, checkSeatsAvailable,
  getLichChayId, getThuTu, ensureGheChuyen,
  getGheChuyenIds, checkGheChangOverlap,
  createGheChangForVe, freeGheChang, confirmGheChang,
}
