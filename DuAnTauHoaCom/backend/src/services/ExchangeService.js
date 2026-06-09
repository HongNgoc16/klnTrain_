const { sequelize } = require('../config/database')
const { DonDatVe, Ve, ThanhToan, DoiVe, HanhKhach, ChuyenTau, LichChay, GaTau, TamGiuGhe } = require('../models')
// fmtDt UTC cho Ve, DoiVe (frontend sẽ tự convert sang VN time qua toLocaleString)
const fmtDt = (d) => sequelize.literal(`'${new Date(d).toISOString().replace('T', ' ').slice(0, 23)}'`)
// fmtVN cho TamGiuGhe (hiển thị trong SSMS là giờ VN)
const VN_OFFSET = 7 * 60 * 60 * 1000
const fmtVN = (d) => sequelize.literal(`'${new Date(new Date(d).getTime() + VN_OFFSET).toISOString().replace('T', ' ').slice(0, 23)}'`)
const BookingRepo = require('../repositories/BookingRepository')
const { calcExchangeFee, genTransactionCode } = require('../utils/helpers')
const { freeGheChang, getLichChayId, getThuTu, createGheChangForVe, ensureGheChuyen } = BookingRepo

// Lấy chuỗi ngày 'YYYY-MM-DD' từ giá trị Sequelize (Date object hoặc string)
const toDateStr = (v) => {
  if (!v) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : String(v).slice(0, 10)
}

// Lấy chuỗi giờ 'HH:MM:SS' từ giá trị TIME Sequelize (Date epoch hoặc string)
const toTimeStr = (v) => {
  if (!v) return '00:00:00'
  if (v instanceof Date) {
    const h = String(v.getUTCHours()).padStart(2, '0')
    const m = String(v.getUTCMinutes()).padStart(2, '0')
    return `${h}:${m}:00`
  }
  const s = String(v)
  const iso = s.match(/T(\d{2}:\d{2}:\d{2})/)
  if (iso) return iso[1]
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 8)
  return '00:00:00'
}

// Kiểm tra vé có thể đổi không (cần trước giờ chạy ≥ 24h)
const checkExchangeable = async (idVe) => {
  const ve = await Ve.findByPk(idVe, {
    include: [{ model: ChuyenTau, include: [{ model: LichChay }] }],
  })
  if (!ve) throw { status: 404, message: 'Không tìm thấy vé' }
  if (ve.trang_thai !== 'da_xac_nhan') throw { status: 400, message: 'Chỉ có thể đổi vé đã xác nhận' }

  const ngayChay = toDateStr(ve.ChuyenTau.ngay_chay)
  const gioChay  = toTimeStr(ve.ChuyenTau.LichChay.gio_khoi_hanh)
  // Giờ chạy là giờ Việt Nam → dùng +07:00 để so sánh đúng với Date.now() (UTC)
  const departAt  = new Date(`${ngayChay}T${gioChay}+07:00`)
  const gioConLai = (departAt.getTime() - Date.now()) / (1000 * 60 * 60)

  if (gioConLai < 24) throw { status: 400, message: 'Chỉ có thể đổi vé trước 24 giờ khởi hành' }

  const phiDoi = calcExchangeFee(parseFloat(ve.gia_ve))
  return { idVe, giaVe: parseFloat(ve.gia_ve), phiDoi, gioConLai }
}

// Thực hiện đổi vé
const exchangeTicket = async (idVeCu, newTicketData) => {
  return sequelize.transaction(async (t) => {
    const veCu = await Ve.findByPk(idVeCu, {
      include: [{ model: HanhKhach }, { model: ChuyenTau }],
      transaction: t,
    })
    if (!veCu) throw { status: 404, message: 'Không tìm thấy vé cũ' }

    // Kiểm tra ghế mới còn trống
    const available = await BookingRepo.checkSeatsAvailable(
      newTicketData.idChuyen, newTicketData.soToa, [newTicketData.soGhe]
    )
    if (!available) throw { status: 409, message: 'Ghế đã được đặt. Vui lòng chọn ghế khác.' }

    const phiDoi    = calcExchangeFee(parseFloat(veCu.gia_ve))
    const chenhLech = Math.max(0, newTicketData.giaVeMoi - parseFloat(veCu.gia_ve))
    const tongPhaitra = phiDoi + chenhLech

    // Vé mới: nếu không cần thanh toán thêm → xác nhận luôn
    const trangThaiVeMoi = tongPhaitra > 0 ? 'cho_xac_nhan' : 'da_xac_nhan'
    const veMoi = await Ve.create({
      id_don_dat_ve:    veCu.id_don_dat_ve,
      id_hanh_khach:    veCu.id_hanh_khach,
      id_chuyen:        newTicketData.idChuyen,
      so_toa_thu_tu:    newTicketData.soToa,
      so_ghe_trong_toa: newTicketData.soGhe,
      id_ga_len:        newTicketData.idGaLen,
      id_ga_xuong:      newTicketData.idGaXuong,
      loai_hanh_khach:  veCu.loai_hanh_khach,
      gia_ve:           newTicketData.giaVeMoi,
      trang_thai:       trangThaiVeMoi,
      ngay_xuat_ve:     fmtDt(new Date()),
    }, { transaction: t })

    // Tạo bản ghi DoiVe — DB chỉ cho phép 'da_doi' hoặc 'huy'
    const doi = await DoiVe.create({
      id_ve_cu:       idVeCu,
      id_ve_moi:      veMoi.id_ve,
      phi_doi:        phiDoi,
      chenh_lech_gia: chenhLech,
      tong_phai_tra:  tongPhaitra,
      trang_thai:     'da_doi',
      thoi_gian_doi:  fmtDt(new Date()),
    }, { transaction: t })

    // Giải phóng GheChang của vé cũ
    await freeGheChang(idVeCu, t)

    // Tạo GheChang cho vé mới
    if (newTicketData.idGaLen && newTicketData.idGaXuong) {
      const idLC  = await getLichChayId(newTicketData.idChuyen)
      const thuTuTu  = idLC ? await getThuTu(idLC, newTicketData.idGaLen)  : null
      const thuTuDen = idLC ? await getThuTu(idLC, newTicketData.idGaXuong) : null
      await ensureGheChuyen(newTicketData.idChuyen)
      await createGheChangForVe(veMoi, thuTuTu, thuTuDen, null, t)
    }

    // Đánh dấu vé cũ là đã đổi
    await veCu.update({ trang_thai: 'da_doi' }, { transaction: t })

    // Giải phóng ghế cũ trong TamGiuGhe (trả về trạng thái trống)
    await TamGiuGhe.update(
      { trang_thai: 'da_giai_phong' },
      {
        where: {
          id_chuyen:        veCu.id_chuyen,
          so_toa_thu_tu:    veCu.so_toa_thu_tu,
          so_ghe_trong_toa: veCu.so_ghe_trong_toa,
          id_don_dat_ve:    veCu.id_don_dat_ve,
          trang_thai:       'da_dat',
        },
        transaction: t,
      }
    )

    // Đặt giữ ghế mới trong TamGiuGhe
    const now    = new Date()
    const hetHan = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    await TamGiuGhe.create({
      id_chuyen:         newTicketData.idChuyen,
      so_toa_thu_tu:     newTicketData.soToa,
      so_ghe_trong_toa:  newTicketData.soGhe,
      id_don_dat_ve:     veCu.id_don_dat_ve,
      trang_thai:        tongPhaitra > 0 ? 'dang_giu' : 'da_dat',
      thoi_gian_giu:     fmtVN(now),
      thoi_gian_het_han: fmtVN(hetHan),
    }, { transaction: t })

    // Nếu có phí đổi vé → tạo ThanhToan và link vào DoiVe
    let idThanhToan = null
    let qrUrl = null
    if (tongPhaitra > 0) {
      const don = await DonDatVe.findByPk(veCu.id_don_dat_ve, { transaction: t })
      const maGD = genTransactionCode()
      qrUrl = `https://img.vietqr.io/image/BIDV-9630630005144911-compact2.png?amount=${tongPhaitra}&addInfo=${encodeURIComponent(don.ma_don)}&accountName=KLN%20TRAIN`
      const tt = await ThanhToan.create({
        ma_giao_dich:    maGD,
        id_don_dat_ve:   veCu.id_don_dat_ve,
        phuong_thuc:     'the_ngan_hang',
        so_tien:         tongPhaitra,
        trang_thai:      'dang_xu_ly',
        payment_gateway: 'vietqr',
        so_lan_thu:      1,
        thoi_gian_tao:   fmtDt(new Date()),
      }, { transaction: t })
      idThanhToan = tt.id_thanh_toan
      await doi.update({ id_thanh_toan: idThanhToan }, { transaction: t })
    }

    return {
      doi, veMoi, phiDoi, chenhLech, tongPhaitra,
      idThanhToan, qrUrl,
      idDon: veCu.id_don_dat_ve,
    }
  })
}

module.exports = { checkExchangeable, exchangeTicket }
