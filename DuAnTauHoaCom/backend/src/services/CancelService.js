const { sequelize } = require('../config/database')
const { Op } = require('sequelize')
const fmtDt = (d) => sequelize.literal(`'${new Date(d).toISOString().replace('T', ' ').slice(0, 23)}'`)

const toDateStr = (v) => {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : String(v).slice(0, 10)
}
const toTimeStr = (v) => {
  if (!v) return '00:00:00'
  if (v instanceof Date) return `${String(v.getUTCHours()).padStart(2,'0')}:${String(v.getUTCMinutes()).padStart(2,'0')}:00`
  const s = String(v)
  const iso = s.match(/T(\d{2}:\d{2}:\d{2})/)
  if (iso) return iso[1]
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 8)
  return '00:00:00'
}
const { DonDatVe, Ve, ThanhToan, HoanTien, ChinhSachHuy, ChuyenTau, LichChay, TamGiuGhe } = require('../models')
const BookingRepo = require('../repositories/BookingRepository')
const { freeGheChang } = BookingRepo

// Tính phí hủy vé theo chính sách trong DB
const tinhPhiHuy = async (idVe) => {
  const ve = await Ve.findByPk(idVe, {
    include: [{
      model: ChuyenTau,
      include: [{ model: LichChay, attributes: ['gio_khoi_hanh'] }],
    }],
  })
  if (!ve) throw { status: 404, message: 'Không tìm thấy vé' }

  const chuyen = ve.ChuyenTau
  const ngayChay = toDateStr(chuyen.ngay_chay)
  const gioChay  = toTimeStr(chuyen.LichChay.gio_khoi_hanh)
  const departAt  = new Date(`${ngayChay}T${gioChay}+07:00`)
  const gioConLai = (departAt.getTime() - Date.now()) / (1000 * 60 * 60)

  // Lấy chính sách hủy phù hợp (giờ trước giờ chạy >= gioConLai, order ASC)
  const csHuy = await ChinhSachHuy.findOne({
    where: { gio_truoc_gio_chay: { [Op.gte]: Math.max(0, Math.floor(gioConLai)) } },
    order: [['gio_truoc_gio_chay', 'ASC']],
  })

  const phiHuyPct = csHuy ? parseFloat(csHuy.phi_huy) : 100
  const giaVe = parseFloat(ve.gia_ve)
  const phiHuy = Math.floor(giaVe * phiHuyPct / 100)
  const tienHoan = giaVe - phiHuy

  return {
    idVe,
    giaVe,
    phiHuyPct,
    phiHuy,
    tienHoan,
    gioConLai: Math.max(0, gioConLai),
    canCancel: gioConLai > 0,
    idCsHuy: csHuy?.id_cs_huy || null,
  }
}

// Hủy vé (một hoặc nhiều vé trong đơn)
const cancelTickets = async (maDatCho, idVeList, lyDo = '') => {
  return sequelize.transaction(async (t) => {
    const don = await DonDatVe.findOne({
      where: { ma_dat_cho: maDatCho },
      include: [
        { model: Ve, where: { id_ve: { [Op.in]: idVeList } } },
        { model: ThanhToan, where: { trang_thai: 'thanh_cong' }, required: false },
      ],
      transaction: t,
    })
    if (!don) throw { status: 404, message: 'Không tìm thấy đơn đặt vé' }
    if (!['da_thanh_toan', 'da_xac_nhan'].includes(don.trang_thai))
      throw { status: 400, message: 'Chỉ có thể hủy vé đã thanh toán' }

    let tongTienHoan = 0
    const idThanhToan = don.ThanhToans?.[0]?.id_thanh_toan

    for (const ve of don.Ves) {
      const phiInfo = await tinhPhiHuy(ve.id_ve)
      if (!phiInfo.canCancel) throw { status: 400, message: `Vé #${ve.id_ve} không thể hủy (tàu đã khởi hành hoặc dưới 4 giờ)` }

      await ve.update({ trang_thai: 'da_huy', id_cs_huy: phiInfo.idCsHuy }, { transaction: t })

      // Giải phóng GheChang → ghế trở về 'trong' để người khác đặt được
      await freeGheChang(ve.id_ve, t)

      // Giải phóng ghế trong TamGiuGhe khi hủy vé
      await TamGiuGhe.update(
        { trang_thai: 'da_giai_phong' },
        {
          where: {
            id_chuyen:        ve.id_chuyen,
            so_toa_thu_tu:    ve.so_toa_thu_tu,
            so_ghe_trong_toa: ve.so_ghe_trong_toa,
            id_don_dat_ve:    ve.id_don_dat_ve,
            trang_thai:       'da_dat',
          },
          transaction: t,
        }
      )

      if (idThanhToan) {
        await HoanTien.create({
          id_ve:          ve.id_ve,
          id_thanh_toan:  idThanhToan,
          tien_goc:       phiInfo.giaVe,
          phi_huy:        phiInfo.phiHuy,
          tien_hoan:      phiInfo.tienHoan,
          ly_do:          lyDo || 'Khách hàng hủy vé',
          trang_thai_hoan:'dang_xu_ly',
          thoi_gian_hoan: fmtDt(new Date()),
        }, { transaction: t })
      }
      tongTienHoan += phiInfo.tienHoan
    }

    // Nếu hủy tất cả vé → cập nhật trạng thái đơn
    const allVe = await Ve.findAll({ where: { id_don_dat_ve: don.id_don_dat_ve }, transaction: t })
    const allHuy = allVe.every(v => v.trang_thai === 'da_huy')
    if (allHuy) await don.update({ trang_thai: 'da_huy' }, { transaction: t })

    return { tongTienHoan, soVeHuy: idVeList.length }
  })
}

module.exports = { tinhPhiHuy, cancelTickets }
