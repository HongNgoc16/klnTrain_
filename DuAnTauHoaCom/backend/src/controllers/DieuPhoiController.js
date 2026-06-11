const { Op } = require('sequelize')
const { sequelize } = require('../config/database')
const {
  ChuyenTau, LichChay, Tau, GaTau,
  ToaChuyen, LoaiToa, CauHinhToa, CauHinhGhe,
  DieuPhoi, LichTrinhThucTe, LichTrinhChuyen,
  Ve, GheChuyen,
} = require('../models')
const { ok, created, badRequest, notFound } = require('../utils/response')

// ─── Helper: tính ngày VN (UTC+7) ────────────────────────────────
const vnDate = (offsetDays = 0) => {
  const d = new Date(Date.now() + 7 * 3600 * 1000 + offsetDays * 86400000)
  return d.toISOString().slice(0, 10)  // 'YYYY-MM-DD'
}

// ─── Helper: dd/mm/yyyy từ 'YYYY-MM-DD' hoặc Date ────────────────
const fmtDateVN = (d) => {
  const s = String(d).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}` : s
}

// ─── Helper: giờ HH:mm từ Date (TIME column MSSQL trả về Date UTC) ─
const fmtTimeVN = (t) => {
  if (t instanceof Date) return `${String(t.getUTCHours()).padStart(2,'0')}:${String(t.getUTCMinutes()).padStart(2,'0')}`
  const m = String(t).match(/(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : '--:--'
}

// ─── Helper: quy đổi giờ (Date UTC hoặc 'HH:mm[:ss]') <-> số phút trong ngày ─
const timeToMinutes = (t) => {
  if (t instanceof Date) return t.getUTCHours() * 60 + t.getUTCMinutes()
  const m = String(t).match(/(\d{2}):(\d{2})/)
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0
}
const minutesToTimeStr = (mins) => {
  const total = ((mins % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}
const addMinutesToTime = (t, addMin) => minutesToTimeStr(timeToMinutes(t) + parseInt(addMin))

// ─── Helper: tính giờ xuất phát mới sau khi cộng số phút trễ ─────
const calcDelayedTime = (gioKhoiHanh, delayPhut) => {
  const orig = fmtTimeVN(gioKhoiHanh)
  const [h, m] = orig.split(':').map(Number)
  const total = (h * 60 + m + parseInt(delayPhut) + 1440) % 1440
  const adjusted = `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
  return { orig, adjusted }
}

// ─── Tạo ThongBao cho khách hàng có vé active trên 1 chuyến ──────
const notifyAffectedCustomers = async (idChuyen, { tieuDe, noiDung, loai }) => {
  const accounts = await sequelize.query(
    `SELECT DISTINCT ddv.id_tai_khoan
     FROM Ve v WITH (NOLOCK)
     JOIN DonDatVe ddv WITH (NOLOCK) ON ddv.id_don_dat_ve = v.id_don_dat_ve
     WHERE v.id_chuyen = ${parseInt(idChuyen)}
       AND v.trang_thai NOT IN ('da_huy','da_doi')
       AND ddv.id_tai_khoan IS NOT NULL`,
    { type: sequelize.QueryTypes.SELECT }
  ).catch(() => [])
  if (accounts.length === 0) return 0

  const tieuDeSafe = tieuDe.replace(/'/g, "''")
  const noiDungSafe = noiDung.replace(/'/g, "''")
  const vals = accounts.map(a =>
    `(${a.id_tai_khoan}, N'${tieuDeSafe}', N'${noiDungSafe}', '${loai}', 0, '/tra-cuu-don', GETDATE())`
  ).join(',')
  await sequelize.query(
    `INSERT INTO ThongBao (id_tai_khoan, tieu_de, noi_dung, loai, da_doc, lien_ket, thoi_gian_tao) VALUES ${vals}`
  ).catch(e => console.warn('[notifyAffectedCustomers]', e.message))
  return accounts.length
}

// ─── Dashboard ────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const today    = vnDate(0)
    const tomorrow = vnDate(1)

    // Dùng raw SQL cho DieuPhoi vì Op.gte: new Date() gây lỗi conversion MSSQL
    const [todayTrips, tomorrowRaw, recentEventsRaw] = await Promise.all([
      ChuyenTau.findAll({
        where: { ngay_chay: today },
        include: [{ model: LichChay, include: [
          { model: Tau, attributes: ['so_hieu', 'ten_tau'] },
          { model: GaTau, as: 'GaDi',  attributes: ['ten_ga'] },
          { model: GaTau, as: 'GaDen', attributes: ['ten_ga'] },
        ]}],
        order: [[LichChay, 'gio_khoi_hanh', 'ASC']],
      }),
      sequelize.query(
        `SELECT COUNT(*) AS cnt FROM ChuyenTau WHERE ngay_chay='${tomorrow}' AND trang_thai<>'huy'`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT dp.id_dieu_phoi, dp.id_chuyen, dp.loai_su_kien, dp.mo_ta,
                dp.delay_phut, dp.thoi_gian_tao,
                t.so_hieu AS ma_tau,
                ga.ten_ga AS ga_anh_huong
         FROM DieuPhoi dp
         LEFT JOIN ChuyenTau ct ON ct.id_chuyen = dp.id_chuyen
         LEFT JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
         LEFT JOIN Tau t         ON t.id_tau = lc.id_tau
         LEFT JOIN GaTau ga      ON ga.id_ga = dp.id_ga_anh_huong
         WHERE dp.thoi_gian_tao >= DATEADD(HOUR, -24, DATEADD(HOUR, 7, GETUTCDATE()))
         ORDER BY dp.thoi_gian_tao DESC
         OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ])

    const tomorrowCount = parseInt(tomorrowRaw[0]?.cnt ?? 0)

    const byStatus = {}
    todayTrips.forEach(c => { byStatus[c.trang_thai] = (byStatus[c.trang_thai] || 0) + 1 })

    const parseHHMM = (t) => {
      if (!t) return '--:--'
      if (t instanceof Date) return String(t.getUTCHours()).padStart(2,'0') + ':' + String(t.getUTCMinutes()).padStart(2,'0')
      const s = String(t)
      const m = s.match(/T(\d{2}):(\d{2})/)
      if (m) return `${m[1]}:${m[2]}`
      if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5)
      return '--:--'
    }

    ok(res, {
      today: {
        total: todayTrips.length,
        byStatus,
        trips: todayTrips.map(c => ({
          idChuyen:    c.id_chuyen,
          maTau:       c.LichChay?.Tau?.so_hieu,
          tenTau:      c.LichChay?.Tau?.ten_tau,
          gaDi:        c.LichChay?.GaDi?.ten_ga,
          gaDen:       c.LichChay?.GaDen?.ten_ga,
          gioKhoiHanh: parseHHMM(c.LichChay?.gio_khoi_hanh),
          trangThai:   c.trang_thai,
          ghiChu:      c.ghi_chu,
        })),
      },
      tomorrowCount,
      recentEvents: recentEventsRaw.map(e => ({
        id:         e.id_dieu_phoi,
        idChuyen:   e.id_chuyen,
        maTau:      e.ma_tau,
        loaiSuKien: e.loai_su_kien,
        moTa:       e.mo_ta,
        delayPhut:  e.delay_phut,
        gaAnhHuong: e.ga_anh_huong,
        thoiGian:   e.thoi_gian_tao,
      })),
    })
  } catch (err) { next(err) }
}

// ─── Danh sách chuyến ─────────────────────────────────────────────
const getChuyenTauList = async (req, res, next) => {
  try {
    const { ngay, ngayDen, trangThai, idTau, idLichChay, page = 1, limit = 20 } = req.query
    const pg = Math.max(1, parseInt(page) || 1)
    const lm = Math.min(100, Math.max(1, parseInt(limit) || 20))
    const offset = (pg - 1) * lm

    // Dùng raw SQL cho ngay_chay để tránh Sequelize MSSQL datetime conversion bug
    // Op.between với string dates đôi khi gây "Conversion failed"
    const dateCond = (() => {
      if (ngay && ngayDen && ngay === ngayDen) return `ct.ngay_chay = '${ngay}'`
      if (ngay && ngayDen) return `ct.ngay_chay BETWEEN '${ngay}' AND '${ngayDen}'`
      if (ngay) return `ct.ngay_chay >= '${ngay}'`
      return '1=1'
    })()
    const statusCond = trangThai ? `AND ct.trang_thai = '${trangThai.replace(/'/g,"''")}'` : ''
    const tauCond    = idTau     ? `AND lc.id_tau = ${parseInt(idTau)}`                     : ''
    const lichCond   = idLichChay? `AND ct.id_lich_chay = ${parseInt(idLichChay)}`           : ''

    const baseSql = `
      FROM ChuyenTau ct
      JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
      JOIN Tau tau       ON tau.id_tau = lc.id_tau
      JOIN GaTau gdi    ON gdi.id_ga = lc.id_ga_di
      JOIN GaTau gden   ON gden.id_ga = lc.id_ga_den
      WHERE ${dateCond} ${statusCond} ${tauCond} ${lichCond}
    `

    const [countRows] = await sequelize.query(`SELECT COUNT(*) AS cnt ${baseSql}`, { type: sequelize.QueryTypes.SELECT })
    const count = parseInt(countRows?.cnt ?? 0)

    const rows = await sequelize.query(
      `SELECT ct.id_chuyen, ct.id_lich_chay, ct.ngay_chay, ct.trang_thai, ct.ghi_chu,
              tau.id_tau, tau.so_hieu AS ma_tau, tau.ten_tau,
              gdi.id_ga AS id_ga_di, gdi.ten_ga AS ten_ga_di, gdi.ma_ga_viet_tat AS vt_ga_di,
              gden.id_ga AS id_ga_den, gden.ten_ga AS ten_ga_den, gden.ma_ga_viet_tat AS vt_ga_den,
              lc.gio_khoi_hanh, lc.gio_du_kien_den
       ${baseSql}
       ORDER BY ct.ngay_chay DESC, lc.gio_khoi_hanh ASC
       OFFSET ${offset} ROWS FETCH NEXT ${lm} ROWS ONLY`,
      { type: sequelize.QueryTypes.SELECT }
    )

    // Số vé đã bán
    const ids = rows.map(r => r.id_chuyen)
    let veMap = {}
    if (ids.length > 0) {
      const veCounts = await sequelize.query(
        `SELECT id_chuyen, COUNT(*) AS cnt FROM Ve WHERE id_chuyen IN (${ids.join(',')}) AND trang_thai NOT IN ('da_huy','da_doi') GROUP BY id_chuyen`,
        { type: sequelize.QueryTypes.SELECT }
      )
      veMap = Object.fromEntries(veCounts.map(v => [v.id_chuyen, parseInt(v.cnt)]))
    }

    // Sự kiện gần nhất mỗi chuyến — raw SQL để tránh lỗi datetime conversion
    let evMap = {}
    if (ids.length > 0) {
      const evRaw = await sequelize.query(
        `SELECT id_chuyen, loai_su_kien, delay_phut, thoi_gian_tao
         FROM DieuPhoi WHERE id_chuyen IN (${ids.join(',')})
           AND id_dieu_phoi IN (
             SELECT MAX(id_dieu_phoi) FROM DieuPhoi
             WHERE id_chuyen IN (${ids.join(',')}) GROUP BY id_chuyen
           )`,
        { type: sequelize.QueryTypes.SELECT }
      ).catch(() => [])
      evRaw.forEach(e => { evMap[e.id_chuyen] = e })
    }

    ok(res, {
      total: count,
      page:  pg,
      limit: lm,
      items: rows.map(c => ({
        idChuyen:      c.id_chuyen,
        idLichChay:    c.id_lich_chay,
        ngayChay:      c.ngay_chay,
        trangThai:     c.trang_thai,
        ghiChu:        c.ghi_chu,
        tau:           { id_tau: c.id_tau, so_hieu: c.ma_tau, ten_tau: c.ten_tau },
        gaDi:          { id_ga: c.id_ga_di,  ten_ga: c.ten_ga_di,  ma_ga_viet_tat: c.vt_ga_di  },
        gaDen:         { id_ga: c.id_ga_den, ten_ga: c.ten_ga_den, ma_ga_viet_tat: c.vt_ga_den },
        gioKhoiHanh:   c.gio_khoi_hanh,
        gioDuKienDen:  c.gio_du_kien_den,
        vesBan:        veMap[c.id_chuyen] || 0,
        suKienMoiNhat: evMap[c.id_chuyen] || null,
      })),
    })
  } catch (err) { next(err) }
}

// ─── Chi tiết chuyến ──────────────────────────────────────────────
const getChuyenTauDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    const idInt = parseInt(id)

    const chuyen = await ChuyenTau.findByPk(idInt, {
      include: [{ model: LichChay, include: [
        { model: Tau },
        { model: GaTau, as: 'GaDi' },
        { model: GaTau, as: 'GaDen' },
      ]}],
    })
    if (!chuyen) return notFound(res, 'Không tìm thấy chuyến tàu')

    // Thử gọi SP (nếu đã cài AMEND05). SP vừa migrate vừa trả về danh sách toa.
    // Nếu SP chưa tồn tại → fallback JS migration + query trực tiếp.
    let toaList
    try {
      toaList = await sequelize.query(
        `EXEC sp_DP_EnsureToaChuyen @id_chuyen = ${idInt}`,
        { type: sequelize.QueryTypes.SELECT }
      )
    } catch {
      // SP chưa được tạo — tự migrate từ CauHinhToa rồi query
      const idTau = chuyen.LichChay?.id_tau
      if (idTau) {
        const cauHinhToas = await CauHinhToa.findAll({
          where: { id_tau: idTau },
          include: [{ model: LoaiToa, attributes: ['so_cho_toi_da'] }],
          order: [['so_toa_thu_tu', 'ASC']],
        })
        if (cauHinhToas.length > 0) {
          const vals = cauHinhToas.map(cht =>
            `(${idInt}, ${cht.so_toa_thu_tu}, ${cht.id_loai_toa}, ${cht.LoaiToa?.so_cho_toi_da ?? 'NULL'}, 'hoat_dong')`
          ).join(',')
          await sequelize.query(
            `INSERT INTO ToaChuyen (id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai) VALUES ${vals}`
          ).catch(() => {})
        }
      }
      toaList = await sequelize.query(
        `SELECT tc.id_toa_chuyen, tc.so_toa_thu_tu, tc.id_loai_toa, tc.so_ghe_toi_da, tc.trang_thai,
                lt.ten_loai_toa, lt.so_cho_toi_da AS loai_so_cho_toi_da
         FROM ToaChuyen tc LEFT JOIN LoaiToa lt ON lt.id_loai_toa = tc.id_loai_toa
         WHERE tc.id_chuyen = ${idInt} ORDER BY tc.so_toa_thu_tu`,
        { type: sequelize.QueryTypes.SELECT }
      )
    }

    const events = await DieuPhoi.findAll({
      where: { id_chuyen: idInt },
      include: [{ model: GaTau, as: 'GaAnhHuong', attributes: ['ten_ga'], required: false }],
      order: [['thoi_gian_tao', 'DESC']],
    })

    // Đếm vé theo toa — NOLOCK tránh bị block bởi transaction booking đang xử lý
    const veStats = await sequelize.query(
      `SELECT so_toa_thu_tu, COUNT(*) AS ban
       FROM Ve WITH (NOLOCK)
       WHERE id_chuyen = ${idInt} AND trang_thai NOT IN ('da_huy','da_doi')
       GROUP BY so_toa_thu_tu`,
      { type: sequelize.QueryTypes.SELECT }
    )
    const banByToa = Object.fromEntries(veStats.map(r => [parseInt(r.so_toa_thu_tu), parseInt(r.ban)]))

    // Danh sách ga dừng theo lịch trình của chuyến (để chọn "ga ảnh hưởng" khi ghi sự kiện)
    const lichTrinh = chuyen.LichChay
      ? await LichTrinhChuyen.findAll({
          where: { id_lich_chay: chuyen.LichChay.id_lich_chay },
          include: [{ model: GaTau, attributes: ['id_ga', 'ten_ga', 'ma_ga_viet_tat'] }],
          order: [['thu_tu_dung', 'ASC']],
        })
      : []

    ok(res, {
      idChuyen:   chuyen.id_chuyen,
      ngayChay:   chuyen.ngay_chay,
      trangThai:  chuyen.trang_thai,
      ghiChu:     chuyen.ghi_chu,
      lichChay:   chuyen.LichChay,
      toaList: toaList.map(t => ({
        idToaChuyen: t.id_toa_chuyen,
        soToaThuTu:  parseInt(t.so_toa_thu_tu),
        idLoaiToa:   t.id_loai_toa,
        soGheToidDa: t.so_ghe_toi_da || t.loai_so_cho_toi_da,
        loaiToa:     { ten_loai_toa: t.ten_loai_toa, so_cho_toi_da: t.loai_so_cho_toi_da },
        vesBan:      banByToa[parseInt(t.so_toa_thu_tu)] || 0,
      })),
      events: events.map(e => ({
        id:         e.id_dieu_phoi,
        loaiSuKien: e.loai_su_kien,
        moTa:       e.mo_ta,
        delayPhut:  e.delay_phut,
        gaAnhHuong: e.GaAnhHuong?.ten_ga,
        trangThai:  e.trang_thai,
        thoiGian:   e.thoi_gian_tao,
      })),
      tongVeBan: Object.values(banByToa).reduce((s, v) => s + v, 0),
      lichTrinh: lichTrinh.map(s => ({
        idGa:      s.id_ga,
        tenGa:     s.GaTau?.ten_ga,
        maGa:      s.GaTau?.ma_ga_viet_tat,
        thuTuDung: s.thu_tu_dung,
        gioDen:    s.gio_den,
        gioDi:     s.gio_di,
      })),
    })
  } catch (err) { next(err) }
}

// ─── Đổi trạng thái chuyến ────────────────────────────────────────
const updateTrangThai = async (req, res, next) => {
  try {
    const { id } = req.params
    const { trangThai, ghiChu } = req.body
    const valid = ['dung_gio', 'da_chay', 'huy', 'dieu_chinh', 'sap_den']
    if (!valid.includes(trangThai)) return badRequest(res, 'Trạng thái không hợp lệ')
    const chuyen = await ChuyenTau.findByPk(id)
    if (!chuyen) return notFound(res, 'Không tìm thấy chuyến tàu')
    await chuyen.update({ trang_thai: trangThai, ghi_chu: ghiChu || chuyen.ghi_chu })
    if (trangThai === 'huy') {
      await DieuPhoi.create({
        id_chuyen: id, loai_su_kien: 'cancel',
        mo_ta: ghiChu || 'Hủy chuyến tàu',
        nguoi_tao: req.user.id,
      })
    }
    ok(res, { idChuyen: parseInt(id), trangThai }, 'Cập nhật trạng thái thành công')
  } catch (err) { next(err) }
}

// ─── Ghi nhận sự kiện (dùng sp_DP_GhiSuKien) ─────────────────────
const logSuKien = async (req, res, next) => {
  try {
    const { id } = req.params
    const { loaiSuKien, moTa, delayPhut, idGaAnhHuong, soToa } = req.body
    if (!loaiSuKien) return badRequest(res, 'Thiếu loại sự kiện')
    const moTaSafe = moTa ? String(moTa).replace(/'/g, "''") : null
    const [result] = await sequelize.query(
      `EXEC sp_DP_GhiSuKien
         @id_chuyen    = ${parseInt(id)},
         @loai_su_kien = '${loaiSuKien.replace(/'/g,"''")}',
         @mo_ta        = ${moTaSafe    ? `N'${moTaSafe}'` : 'NULL'},
         @delay_phut   = ${delayPhut   ? parseInt(delayPhut)    : 'NULL'},
         @id_ga        = ${idGaAnhHuong? parseInt(idGaAnhHuong) : 'NULL'},
         @so_toa       = ${soToa       ? parseInt(soToa)         : 'NULL'},
         @nguoi_tao    = ${req.user.id}`,
      { type: sequelize.QueryTypes.SELECT }
    )

    // Lấy thông tin chuyến đầy đủ để cập nhật lịch trình + soạn thông báo khách hàng
    const chuyen = await ChuyenTau.findByPk(id, {
      include: [{
        model: LichChay,
        attributes: ['id_ga_di', 'id_lich_chay', 'gio_khoi_hanh'],
        include: [
          { model: Tau,   attributes: ['so_hieu'] },
          { model: GaTau, as: 'GaDi', attributes: ['ten_ga'] },
        ],
      }],
    }).catch(() => null)
    const soHieuTau = chuyen?.LichChay?.Tau?.so_hieu || 'Chuyến tàu'
    const tenGaDi   = chuyen?.LichChay?.GaDi?.ten_ga || ''
    const ngayChay  = chuyen ? fmtDateVN(chuyen.ngay_chay) : ''

    // Khi có sự kiện trễ giờ → cập nhật LichTrinhThucTe (ga ảnh hưởng + các ga sau) + đổi trạng thái chuyến
    if (loaiSuKien === 'delay' && delayPhut && chuyen?.LichChay) {
      const idLichChay = chuyen.LichChay.id_lich_chay
      const idGaTarget = idGaAnhHuong ? parseInt(idGaAnhHuong) : chuyen.LichChay.id_ga_di
      const delayInt   = parseInt(delayPhut)
      const ghiChuSql  = moTaSafe ? `, ghi_chu = N'${moTaSafe}'` : ''
      const ghiChuIns  = moTaSafe ? `, N'${moTaSafe}'` : ', NULL'

      // Lấy toàn bộ ga dừng theo lịch trình, từ ga ảnh hưởng trở đi sẽ được dồn giờ theo số phút trễ
      const allStops = await LichTrinhChuyen.findAll({
        where: { id_lich_chay: idLichChay }, order: [['thu_tu_dung', 'ASC']],
      })
      const targetStop    = allStops.find(s => s.id_ga === idGaTarget)
      const tuThuTuDung   = targetStop?.thu_tu_dung ?? 1
      const affectedStops = allStops.filter(s => s.thu_tu_dung >= tuThuTuDung)

      if (affectedStops.length > 0) {
        const sqlBatch = affectedStops.map(s => {
          const gioDenDuKien = addMinutesToTime(s.gio_den, delayInt)
          const gioDiDuKien  = addMinutesToTime(s.gio_di, delayInt)
          return `
            MERGE LichTrinhThucTe AS tgt
            USING (VALUES(${parseInt(id)}, ${s.id_ga})) AS src(id_chuyen, id_ga)
              ON tgt.id_chuyen = src.id_chuyen AND tgt.id_ga = src.id_ga
            WHEN MATCHED THEN
              UPDATE SET gio_den_du_kien = '${gioDenDuKien}', gio_di_du_kien = '${gioDiDuKien}',
                         delay_den_phut = ${delayInt}, delay_di_phut = ${delayInt}, trang_thai = 'delay'${ghiChuSql}
            WHEN NOT MATCHED THEN
              INSERT (id_chuyen, id_ga, thu_tu_dung, gio_den_du_kien, gio_di_du_kien, delay_den_phut, delay_di_phut, trang_thai, ghi_chu)
              VALUES (${parseInt(id)}, ${s.id_ga}, ${s.thu_tu_dung}, '${gioDenDuKien}', '${gioDiDuKien}', ${delayInt}, ${delayInt}, 'delay'${ghiChuIns});
          `
        }).join('\n')
        await sequelize.query(sqlBatch).catch(() => {})
      }
      // Chuyển trạng thái chuyến thành 'dieu_chinh'
      await ChuyenTau.update({ trang_thai: 'dieu_chinh' }, { where: { id_chuyen: id } }).catch(() => {})
    }

    // Khi hủy chuyến → cập nhật trạng thái chuyến thành 'huy'
    if (loaiSuKien === 'cancel') {
      await ChuyenTau.update({ trang_thai: 'huy' }, { where: { id_chuyen: id } }).catch(() => {})
    }

    // ─── Soạn & gửi thông báo cho khách hàng có vé trên chuyến này ─────
    let tieuDe = null, noiDung = null
    if (loaiSuKien === 'delay' && delayPhut && chuyen?.LichChay) {
      const { orig, adjusted } = calcDelayedTime(chuyen.LichChay.gio_khoi_hanh, delayPhut)
      tieuDe  = `Chuyến ${soHieuTau} bị chậm giờ`
      noiDung = `Chuyến tàu ${soHieuTau} xuất phát ${orig} ngày ${ngayChay}`
        + (tenGaDi ? ` tại ga ${tenGaDi}` : '')
        + ` sẽ khởi hành muộn hơn dự kiến ${parseInt(delayPhut)} phút, dự kiến lúc ${adjusted}`
        + (moTa ? `. Lý do: ${moTa}` : '') + '.'
    } else if (loaiSuKien === 'cancel') {
      tieuDe  = `Chuyến ${soHieuTau} đã bị hủy`
      noiDung = `Chuyến tàu ${soHieuTau} xuất phát ngày ${ngayChay}`
        + (tenGaDi ? ` tại ga ${tenGaDi}` : '') + ' đã bị hủy'
        + (moTa ? `. Lý do: ${moTa}` : '') + '. Quý khách vui lòng liên hệ tổng đài để được hỗ trợ đổi/trả vé.'
    } else if (loaiSuKien === 'maintenance') {
      tieuDe  = `Chuyến ${soHieuTau} có thông báo bảo trì kỹ thuật`
      noiDung = `Chuyến tàu ${soHieuTau} ngày ${ngayChay} có thể bị ảnh hưởng do bảo trì kỹ thuật`
        + (moTa ? `: ${moTa}` : '') + '. Quý khách vui lòng theo dõi các thông báo tiếp theo.'
    } else if (loaiSuKien === 'info' && moTa) {
      tieuDe  = `Thông báo về chuyến ${soHieuTau}`
      noiDung = moTa
    }
    if (tieuDe && noiDung) {
      await notifyAffectedCustomers(id, { tieuDe, noiDung, loai: loaiSuKien }).catch(() => {})
    }

    created(res, { id: result?.id_dieu_phoi }, result?.message || 'Ghi nhận sự kiện thành công')
  } catch (err) { next(err) }
}

// ─── Quản lý toa ──────────────────────────────────────────────────
const addToaChuyen = async (req, res, next) => {
  try {
    const { id } = req.params
    const { soToaThuTu, idLoaiToa, soGheToidDa } = req.body
    if (!soToaThuTu || !idLoaiToa) return badRequest(res, 'Thiếu soToaThuTu hoặc idLoaiToa')

    const loaiToa = await LoaiToa.findByPk(idLoaiToa)
    if (!loaiToa) return notFound(res, 'Loại toa không tồn tại')

    await sequelize.query(`EXEC sp_DP_EnsureToaChuyen @id_chuyen = ${parseInt(id)}`).catch(() => {})

    // Kiểm tra trùng sau migrate
    const exists = await ToaChuyen.findOne({ where: { id_chuyen: id, so_toa_thu_tu: soToaThuTu } })
    if (exists) return badRequest(res, `Toa số ${soToaThuTu} đã tồn tại trong chuyến này`)

    const tc = await ToaChuyen.create({
      id_chuyen:     parseInt(id),
      so_toa_thu_tu: parseInt(soToaThuTu),
      id_loai_toa:   parseInt(idLoaiToa),
      so_ghe_toi_da: soGheToidDa ? parseInt(soGheToidDa) : loaiToa.so_cho_toi_da,
      trang_thai:    'hoat_dong',
    })

    // ── Tạo GheChuyen trực tiếp (không phụ thuộc SP) ─────────────────
    // 1. Lấy tất cả ToaChuyen của chuyến (bao gồm toa vừa thêm + toa gốc vừa migrate)
    const allToaList = await ToaChuyen.findAll({ where: { id_chuyen: parseInt(id) } })

    // Với mỗi toa, tạo GheChuyen nếu chưa có
    for (const toa of allToaList) {
      const ghes = await CauHinhGhe.findAll({ where: { id_loai_toa: toa.id_loai_toa } })
      if (ghes.length === 0) continue

      // Lấy GheChuyen đã có của toa này để tránh duplicate
      const existingGheNums = await sequelize.query(
        `SELECT so_ghe_trong_toa FROM GheChuyen WHERE id_chuyen=${parseInt(id)} AND so_toa_thu_tu=${toa.so_toa_thu_tu}`,
        { type: sequelize.QueryTypes.SELECT }
      )
      const existingSet = new Set(existingGheNums.map(g => g.so_ghe_trong_toa))

      const toCreate = ghes
        .filter(g => !existingSet.has(g.so_ghe_trong_toa))
        .map(g => ({
          id_chuyen:        parseInt(id),
          so_toa_thu_tu:    toa.so_toa_thu_tu,
          so_ghe_trong_toa: g.so_ghe_trong_toa,
          id_loai_ghe:      g.id_loai_ghe,
        }))

      if (toCreate.length > 0) {
        await sequelize.query(
          `INSERT INTO GheChuyen(id_chuyen,so_toa_thu_tu,so_ghe_trong_toa,id_loai_ghe) VALUES ${
            toCreate.map(r => `(${r.id_chuyen},${r.so_toa_thu_tu},${r.so_ghe_trong_toa},${r.id_loai_ghe})`).join(',')
          }`
        )
      }
    }

    created(res, { idToaChuyen: tc.id_toa_chuyen }, `Thêm toa ${soToaThuTu} thành công`)
  } catch (err) { next(err) }
}

const updateToaChuyen = async (req, res, next) => {
  try {
    const { toaId } = req.params
    const { soToaThuTu, idLoaiToa, soGheToidDa, idChuyen } = req.body

    // Tìm toa theo id_toa_chuyen trước
    let tc = await ToaChuyen.findByPk(toaId)

    // Fallback: nếu không tìm thấy → ensure ToaChuyen rồi tìm lại theo (idChuyen, soToaThuTu)
    if (!tc && idChuyen && soToaThuTu) {
      await sequelize.query(`EXEC sp_DP_EnsureToaChuyen @id_chuyen = ${parseInt(idChuyen)}`).catch(() => {})
      tc = await ToaChuyen.findOne({ where: { id_chuyen: parseInt(idChuyen), so_toa_thu_tu: parseInt(soToaThuTu) } })
    }

    if (!tc) return notFound(res, 'Không tìm thấy toa — vui lòng tải lại trang và thử lại')

    // Dùng NOLOCK để tránh timeout khi Ve table đang bị lock bởi transaction booking
    const [veCheck] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM Ve WITH (NOLOCK) WHERE id_chuyen=${tc.id_chuyen} AND so_toa_thu_tu=${tc.so_toa_thu_tu} AND trang_thai NOT IN ('da_huy','da_doi')`,
      { type: sequelize.QueryTypes.SELECT }
    )
    if (parseInt(veCheck?.cnt) > 0)
      return badRequest(res, `Không thể chỉnh sửa toa ${tc.so_toa_thu_tu} — đã có ${veCheck.cnt} vé đặt. Chỉ điều chỉnh toa ngay khi sinh chuyến (trước khi có vé).`)

    const newSoToa    = soToaThuTu ? parseInt(soToaThuTu) : tc.so_toa_thu_tu
    const newIdLoai   = idLoaiToa   ? parseInt(idLoaiToa)   : tc.id_loai_toa
    const newSoGhe    = soGheToidDa ? parseInt(soGheToidDa) : tc.so_ghe_toi_da
    const oldSoToa    = tc.so_toa_thu_tu

    if (newSoToa !== oldSoToa) {
      const dup = await ToaChuyen.findOne({ where: { id_chuyen: tc.id_chuyen, so_toa_thu_tu: newSoToa } })
      if (dup) {
        // Hoán đổi thứ tự 2 toa qua 3 bước để tránh UNIQUE constraint conflict:
        // bước 1: tc → -1 (giá trị tạm, không trùng với bất kỳ toa nào)
        // bước 2: dup → oldSoToa (số cũ của tc, vừa được giải phóng)
        // bước 3: tc → newSoToa (số cũ của dup, vừa được giải phóng)
        const [veCheckDup] = await sequelize.query(
          `SELECT COUNT(*) AS cnt FROM Ve WITH (NOLOCK)
           WHERE id_chuyen=${tc.id_chuyen} AND so_toa_thu_tu=${dup.so_toa_thu_tu}
             AND trang_thai NOT IN ('da_huy','da_doi')`,
          { type: sequelize.QueryTypes.SELECT }
        )
        if (parseInt(veCheckDup?.cnt) > 0)
          return badRequest(res, `Không thể hoán đổi — toa ${dup.so_toa_thu_tu} đã có ${veCheckDup.cnt} vé đặt`)

        await sequelize.transaction(async (t) => {
          await sequelize.query(`UPDATE ToaChuyen SET so_toa_thu_tu = -1    WHERE id_toa_chuyen = ${tc.id_toa_chuyen}`,  { transaction: t })
          await sequelize.query(`UPDATE ToaChuyen SET so_toa_thu_tu = ${oldSoToa} WHERE id_toa_chuyen = ${dup.id_toa_chuyen}`, { transaction: t })
          await sequelize.query(`UPDATE ToaChuyen SET so_toa_thu_tu = ${newSoToa} WHERE id_toa_chuyen = ${tc.id_toa_chuyen}`,  { transaction: t })
        })
        return ok(res, { swapped: true, toa1: oldSoToa, toa2: newSoToa }, `Hoán đổi thứ tự toa ${oldSoToa} ↔ ${newSoToa} thành công`)
      }
    }

    await tc.update({ so_toa_thu_tu: newSoToa, id_loai_toa: newIdLoai, so_ghe_toi_da: newSoGhe })
    ok(res, { idToaChuyen: tc.id_toa_chuyen }, 'Cập nhật toa thành công')
  } catch (err) { next(err) }
}

const removeToaChuyen = async (req, res, next) => {
  try {
    const { toaId } = req.params
    const tc = await ToaChuyen.findByPk(toaId)
    if (!tc) return notFound(res, 'Không tìm thấy toa')
    const [veCheck] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM Ve WITH (NOLOCK) WHERE id_chuyen=${tc.id_chuyen} AND so_toa_thu_tu=${tc.so_toa_thu_tu} AND trang_thai NOT IN ('da_huy','da_doi')`,
      { type: sequelize.QueryTypes.SELECT }
    )
    if (parseInt(veCheck?.cnt) > 0) return badRequest(res, `Không thể xóa toa ${tc.so_toa_thu_tu} vì đã có ${veCheck.cnt} vé đặt`)
    await tc.destroy()
    ok(res, null, 'Xóa toa thành công')
  } catch (err) { next(err) }
}

const reorderToa = async (req, res, next) => {
  try {
    const { id } = req.params
    const { order } = req.body // [{ idToaChuyen, soToaThuTu }]
    if (!Array.isArray(order) || order.length === 0) return badRequest(res, 'Danh sách sắp xếp không được rỗng')
    // Không cho phép sắp xếp lại khi chuyến đã có vé đặt
    const [veCheck] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM Ve WITH (NOLOCK) WHERE id_chuyen=${parseInt(id)} AND trang_thai NOT IN ('da_huy','da_doi')`,
      { type: sequelize.QueryTypes.SELECT }
    )
    if (parseInt(veCheck?.cnt) > 0)
      return badRequest(res, `Không thể sắp xếp lại toa — chuyến đã có ${veCheck.cnt} vé đặt. Chỉ điều chỉnh toa ngay khi sinh chuyến.`)
    await sequelize.transaction(async (t) => {
      for (const item of order) {
        await ToaChuyen.update(
          { so_toa_thu_tu: parseInt(item.soToaThuTu) },
          { where: { id_toa_chuyen: item.idToaChuyen, id_chuyen: parseInt(id) }, transaction: t }
        )
      }
    })
    ok(res, null, 'Sắp xếp lại toa thành công')
  } catch (err) { next(err) }
}

// ─── Lịch chạy ────────────────────────────────────────────────────
const getLichChayList = async (req, res, next) => {
  try {
    const { idTau } = req.query
    const where = idTau ? { id_tau: parseInt(idTau) } : {}
    const list = await LichChay.findAll({
      where,
      include: [
        { model: Tau, attributes: ['so_hieu', 'ten_tau'] },
        { model: GaTau, as: 'GaDi',  attributes: ['id_ga', 'ten_ga', 'ma_ga_viet_tat'] },
        { model: GaTau, as: 'GaDen', attributes: ['id_ga', 'ten_ga', 'ma_ga_viet_tat'] },
      ],
      order: [['gio_khoi_hanh', 'ASC']],
    })
    ok(res, list)
  } catch (err) { next(err) }
}

const createLichChay = async (req, res, next) => {
  try {
    const { idTau, idGaDi, idGaDen, gioKhoiHanh, gioDuKienDen, thuTrongTuan } = req.body
    if (!idTau || !idGaDi || !idGaDen || !gioKhoiHanh || !gioDuKienDen)
      return badRequest(res, 'Thiếu thông tin bắt buộc')
    const lc = await LichChay.create({
      id_tau: parseInt(idTau), id_ga_di: parseInt(idGaDi), id_ga_den: parseInt(idGaDen),
      gio_khoi_hanh: gioKhoiHanh, gio_du_kien_den: gioDuKienDen,
      thu_trong_tuan: thuTrongTuan || null,
    })
    created(res, { idLichChay: lc.id_lich_chay }, 'Tạo lịch chạy thành công')
  } catch (err) { next(err) }
}

const updateLichChay = async (req, res, next) => {
  try {
    const { id } = req.params
    const { gioKhoiHanh, gioDuKienDen, thuTrongTuan, idTau, idGaDi, idGaDen } = req.body
    const lc = await LichChay.findByPk(id)
    if (!lc) return notFound(res, 'Không tìm thấy lịch chạy')
    await lc.update({
      gio_khoi_hanh:   gioKhoiHanh   ?? lc.gio_khoi_hanh,
      gio_du_kien_den: gioDuKienDen  ?? lc.gio_du_kien_den,
      thu_trong_tuan:  thuTrongTuan  ?? lc.thu_trong_tuan,
      id_tau:   idTau  ? parseInt(idTau)  : lc.id_tau,
      id_ga_di: idGaDi ? parseInt(idGaDi) : lc.id_ga_di,
      id_ga_den:idGaDen? parseInt(idGaDen): lc.id_ga_den,
    })
    ok(res, null, 'Cập nhật lịch chạy thành công')
  } catch (err) { next(err) }
}

// ─── Xóa lịch chạy (chỉ khi chưa có chuyến tàu) ──────────────────
const deleteLichChay = async (req, res, next) => {
  try {
    const { id } = req.params
    const idLichChay = parseInt(id)
    const lc = await LichChay.findByPk(idLichChay)
    if (!lc) return notFound(res, 'Không tìm thấy lịch chạy')
    const soChuyen = await ChuyenTau.count({ where: { id_lich_chay: idLichChay } })
    if (soChuyen > 0) return badRequest(res, 'Không thể xóa lịch trình vì đã có chuyến tàu')
    await sequelize.transaction(async (t) => {
      await LichTrinhChuyen.destroy({ where: { id_lich_chay: idLichChay }, transaction: t })
      await lc.destroy({ transaction: t })
    })
    ok(res, null, 'Xóa lịch chạy thành công')
  } catch (err) { next(err) }
}

// ─── Ga dừng (chi tiết lịch trình) ───────────────────────────────
const getGaDungList = async (req, res, next) => {
  try {
    const { id } = req.params
    const list = await LichTrinhChuyen.findAll({
      where: { id_lich_chay: parseInt(id) },
      include: [{ model: GaTau, attributes: ['id_ga', 'ten_ga', 'ma_ga_viet_tat'] }],
      order: [['thu_tu_dung', 'ASC']],
    })
    ok(res, list.map(s => ({
      idLichTrinh:  s.id_lich_trinh,
      idLichChay:   s.id_lich_chay,
      thuTuDung:    s.thu_tu_dung,
      idGa:         s.id_ga,
      ga:           s.GaTau,
      gioDen:       s.gio_den,
      gioDi:        s.gio_di,
      khoangCachKm: s.khoang_cach_km,
      thoiGianDung: s.thoi_gian_dung,
    })))
  } catch (err) { next(err) }
}

// Kiểm tra: thứ tự dừng không trùng, giờ đến ≤ giờ đi, khoảng cách tăng dần theo thứ tự
const validateGaDung = (existing, { thuTuDung, gioDen, gioDi, khoangCachKm }) => {
  if (String(gioDen) > String(gioDi)) return 'Thời gian đến phải nhỏ hơn hoặc bằng thời gian đi'
  if (existing.some(s => s.thu_tu_dung === thuTuDung)) return `Thứ tự dừng ${thuTuDung} đã tồn tại`
  for (const s of existing) {
    const km = parseFloat(s.khoang_cach_km)
    if (s.thu_tu_dung < thuTuDung && km >= khoangCachKm) return 'Khoảng cách phải tăng dần theo thứ tự ga dừng'
    if (s.thu_tu_dung > thuTuDung && km <= khoangCachKm) return 'Khoảng cách phải tăng dần theo thứ tự ga dừng'
  }
  return null
}

const addGaDung = async (req, res, next) => {
  try {
    const { id } = req.params
    const idLichChay = parseInt(id)
    const { thuTuDung, idGa, gioDen, gioDi, khoangCachKm, thoiGianDung } = req.body
    if (!thuTuDung || !idGa || !gioDen || !gioDi || khoangCachKm == null || thoiGianDung == null)
      return badRequest(res, 'Vui lòng nhập đầy đủ thông tin ga dừng')

    const lc = await LichChay.findByPk(idLichChay)
    if (!lc) return notFound(res, 'Không tìm thấy lịch chạy')

    const existing = await LichTrinhChuyen.findAll({ where: { id_lich_chay: idLichChay } })
    const err = validateGaDung(existing, {
      thuTuDung: parseInt(thuTuDung), gioDen, gioDi, khoangCachKm: parseFloat(khoangCachKm),
    })
    if (err) return badRequest(res, err)

    const row = await LichTrinhChuyen.create({
      id_lich_chay:   idLichChay,
      id_ga:          parseInt(idGa),
      thu_tu_dung:    parseInt(thuTuDung),
      gio_den:        gioDen,
      gio_di:         gioDi,
      khoang_cach_km: parseFloat(khoangCachKm),
      thoi_gian_dung: parseInt(thoiGianDung),
    })
    created(res, { idLichTrinh: row.id_lich_trinh }, 'Thêm ga dừng thành công')
  } catch (err) { next(err) }
}

const updateGaDung = async (req, res, next) => {
  try {
    const { id } = req.params
    const row = await LichTrinhChuyen.findByPk(id)
    if (!row) return notFound(res, 'Không tìm thấy ga dừng')

    const { thuTuDung, idGa, gioDen, gioDi, khoangCachKm, thoiGianDung } = req.body
    if (!thuTuDung || !idGa || !gioDen || !gioDi || khoangCachKm == null || thoiGianDung == null)
      return badRequest(res, 'Vui lòng nhập đầy đủ thông tin ga dừng')

    const existing = await LichTrinhChuyen.findAll({
      where: { id_lich_chay: row.id_lich_chay, id_lich_trinh: { [Op.ne]: row.id_lich_trinh } },
    })
    const err = validateGaDung(existing, {
      thuTuDung: parseInt(thuTuDung), gioDen, gioDi, khoangCachKm: parseFloat(khoangCachKm),
    })
    if (err) return badRequest(res, err)

    // Độ lệch giờ đi so với trước khi sửa → dồn giờ đến/đi của các ga sau theo cùng độ lệch
    const deltaMin = timeToMinutes(gioDi) - timeToMinutes(row.gio_di)

    await sequelize.transaction(async (t) => {
      await row.update({
        id_ga:          parseInt(idGa),
        thu_tu_dung:    parseInt(thuTuDung),
        gio_den:        gioDen,
        gio_di:         gioDi,
        khoang_cach_km: parseFloat(khoangCachKm),
        thoi_gian_dung: parseInt(thoiGianDung),
      }, { transaction: t })

      if (deltaMin !== 0) {
        const subsequent = await LichTrinhChuyen.findAll({
          where: { id_lich_chay: row.id_lich_chay, thu_tu_dung: { [Op.gt]: parseInt(thuTuDung) } },
          transaction: t,
        })
        for (const s of subsequent) {
          await s.update({
            gio_den: addMinutesToTime(s.gio_den, deltaMin),
            gio_di:  addMinutesToTime(s.gio_di, deltaMin),
          }, { transaction: t })
        }
      }
    })

    ok(res, null, 'Cập nhật ga dừng thành công' + (deltaMin !== 0 ? ' (đã cập nhật giờ các ga sau)' : ''))
  } catch (err) { next(err) }
}

const removeGaDung = async (req, res, next) => {
  try {
    const { id } = req.params
    const row = await LichTrinhChuyen.findByPk(id)
    if (!row) return notFound(res, 'Không tìm thấy ga dừng')
    await row.destroy()
    ok(res, null, 'Xóa ga dừng thành công')
  } catch (err) { next(err) }
}

// ─── Sinh chuyến từ lịch chạy ─────────────────────────────────────
const sinhChuyenTau = async (req, res, next) => {
  try {
    const { idLichChay, tuNgay, denNgay } = req.body
    if (!idLichChay || !tuNgay || !denNgay) return badRequest(res, 'Thiếu thông tin bắt buộc')

    const lichChay = await LichChay.findByPk(idLichChay)
    if (!lichChay) return badRequest(res, 'Lịch chạy không tồn tại')

    const start = new Date(tuNgay)
    const end = new Date(denNgay)
    if (isNaN(start) || isNaN(end) || start > end) return badRequest(res, 'Khoảng ngày không hợp lệ')

    const diffDays = Math.round((end - start) / 86400000)
    if (diffDays > 90) return badRequest(res, 'Tối đa 90 ngày mỗi lần sinh chuyến')

    const existing = await ChuyenTau.findAll({
      where: {
        id_lich_chay: idLichChay,
        ngay_chay: { [Op.between]: [tuNgay, denNgay] },
      },
      attributes: ['ngay_chay'],
    })
    const existingDates = new Set(existing.map(c => String(c.ngay_chay).slice(0, 10)))

    const toCreate = []
    let createdCount = 0, skippedCount = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ngay = d.toISOString().slice(0, 10)
      if (existingDates.has(ngay)) {
        skippedCount++
      } else {
        toCreate.push({ id_lich_chay: parseInt(idLichChay), ngay_chay: ngay, trang_thai: 'dung_gio' })
        createdCount++
      }
    }

    if (toCreate.length) await ChuyenTau.bulkCreate(toCreate)

    ok(res, { created: createdCount, skipped: skippedCount }, `Sinh ${createdCount} chuyến thành công`)
  } catch (err) { next(err) }
}

// ─── Metadata ─────────────────────────────────────────────────────
const getTauList = async (req, res, next) => {
  try { ok(res, await Tau.findAll({ order: [['so_hieu', 'ASC']] })) } catch (e) { next(e) }
}
const getGaList = async (req, res, next) => {
  try {
    const { GaTau } = require('../models')
    ok(res, await GaTau.findAll({ where: { trang_thai: 'hoat_dong' }, order: [['thu_tu_tuyen', 'ASC']] }))
  } catch (e) { next(e) }
}
const getLoaiToaList = async (req, res, next) => {
  try { ok(res, await LoaiToa.findAll()) } catch (e) { next(e) }
}

module.exports = {
  getDashboard, getChuyenTauList, getChuyenTauDetail,
  updateTrangThai, logSuKien,
  addToaChuyen, updateToaChuyen, removeToaChuyen, reorderToa,
  getLichChayList, createLichChay, updateLichChay, deleteLichChay, sinhChuyenTau,
  getGaDungList, addGaDung, updateGaDung, removeGaDung,
  getTauList, getGaList, getLoaiToaList,
}
