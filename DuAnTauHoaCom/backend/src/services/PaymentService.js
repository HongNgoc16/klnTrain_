const { sequelize } = require('../config/database')
const { DonDatVe, ThanhToan, HoaDon, Ve, TamGiuGhe } = require('../models')

const fmtDt = (d) => sequelize.literal(`'${new Date(d).toISOString().replace('T', ' ').slice(0, 23)}'`)
const { genTransactionCode, genInvoiceNumber } = require('../utils/helpers')
const BookingRepo = require('../repositories/BookingRepository')
const { confirmGheChang } = BookingRepo

// Map phuong_thuc frontend → giá trị CHECK constraint DB
const mapPhuongThuc = (pt) => {
  if (pt === 'qr_bank' || pt === 'chuyen_khoan') return 'the_ngan_hang'
  const valid = ['tien_mat', 'the_ngan_hang', 'zalopay', 'momo', 'vnpay']
  return valid.includes(pt) ? pt : 'the_ngan_hang'
}

// Map phuong_thuc → payment_gateway code
const mapGateway = (pt) => {
  const map = { zalopay: 'zalopay', momo: 'momo', vnpay: 'vnpay', the_ngan_hang: 'vietqr', qr_bank: 'vietqr', chuyen_khoan: 'vietqr' }
  return map[pt] || null
}

// Phí phụ thu theo phương thức thanh toán (đồng bộ với frontend PaymentMethod.jsx)
const PHI_PHUONG_THUC = { qr: 0, credit: 28000, momo: 14600, atm: 14100 }
const tinhPhiThanhToan = (pt) => PHI_PHUONG_THUC[pt] ?? 0

// Tạo URL QR VietQR (không lưu vào DB)
const buildQrUrl = (amount, maDon) =>
  `https://img.vietqr.io/image/BIDV-9630630005144911-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(maDon)}&accountName=KLN%20TRAIN`

// Tạo giao dịch thanh toán
const createPayment = async (idDonDatVe, phuongThuc = 'the_ngan_hang') => {
  const don = await DonDatVe.findByPk(idDonDatVe)
  if (!don) throw { status: 404, message: 'Không tìm thấy đơn đặt vé' }
  if (don.trang_thai !== 'cho_thanh_toan')
    throw { status: 400, message: 'Đơn đặt vé không ở trạng thái chờ thanh toán' }
  if (Date.now() > new Date(don.thoi_gian_het_han).getTime())
    throw { status: 400, message: 'Đơn đặt vé đã hết thời gian thanh toán' }

  const maGD   = genTransactionCode()
  const pt     = mapPhuongThuc(phuongThuc)
  const phi    = tinhPhiThanhToan(phuongThuc)
  const soTien = parseFloat(don.tien_thanh_toan) + phi
  const qrUrl  = buildQrUrl(soTien, don.ma_don)

  const tt = await ThanhToan.create({
    ma_giao_dich:      maGD,
    id_don_dat_ve:     idDonDatVe,
    phuong_thuc:       pt,
    so_tien:           soTien,
    trang_thai:        'dang_xu_ly',
    payment_gateway:   mapGateway(phuongThuc),
    so_lan_thu:        1,
    thoi_gian_tao:     fmtDt(new Date()),
    thoi_gian_het_han: fmtDt(don.thoi_gian_het_han),
  })

  return {
    idThanhToan: tt.id_thanh_toan,
    maGiaoDich:  maGD,
    qrUrl,
    soTien,
    phi,
    maDon:       don.ma_don,
  }
}

// Xác nhận thanh toán thành công
const confirmPayment = async (idThanhToan) => {
  return sequelize.transaction(async (t) => {
    const tt = await ThanhToan.findByPk(idThanhToan, { transaction: t })
    if (!tt) throw { status: 404, message: 'Không tìm thấy giao dịch' }
    if (tt.trang_thai === 'thanh_cong') return { message: 'Đã xác nhận trước đó' }

    const don = await DonDatVe.findByPk(tt.id_don_dat_ve, { transaction: t })
    if (!don) throw { status: 404, message: 'Không tìm thấy đơn đặt vé' }

    const now = new Date()

    await tt.update({
      trang_thai:           'thanh_cong',
      thoi_gian_thanh_toan: fmtDt(now),
    }, { transaction: t })

    await don.update({ trang_thai: 'da_thanh_toan' }, { transaction: t })

    await Ve.update(
      { trang_thai: 'da_xac_nhan' },
      { where: { id_don_dat_ve: don.id_don_dat_ve, trang_thai: 'cho_xac_nhan' }, transaction: t }
    )

    await TamGiuGhe.update(
      { trang_thai: 'da_dat' },
      { where: { id_don_dat_ve: don.id_don_dat_ve, trang_thai: 'dang_giu' }, transaction: t }
    )
    await confirmGheChang(don.id_don_dat_ve, t)

    // Tạo hóa đơn
    const soHD = genInvoiceNumber()
    const hd = await HoaDon.create({
      so_hoa_don:           soHD,
      id_don_dat_ve:        don.id_don_dat_ve,
      id_thanh_toan:        tt.id_thanh_toan,
      ho_ten_khach:         don.ho_ten_lien_lac,
      email_khach:          don.email_dat_cho,
      tong_tien_truoc_giam: don.tong_tien,
      tien_giam:            don.tien_giam,
      tong_tien_thanh_toan: tt.so_tien,
      ngay_xuat:            fmtDt(now),
      da_gui_email:         false,
    }, { transaction: t })

    const ves = await Ve.findAll({
      where:      { id_don_dat_ve: don.id_don_dat_ve },
      attributes: ['id_ve', 'id_chuyen', 'so_toa_thu_tu', 'so_ghe_trong_toa', 'gia_ve', 'loai_hanh_khach'],
      transaction: t,
    })

    return {
      soHoaDon:     hd.so_hoa_don,
      maDatCho:     don.ma_dat_cho,
      idDon:        don.id_don_dat_ve,
      tongThanhToan: parseFloat(tt.so_tien),
      veList: ves.map(v => ({
        idVe:          v.id_ve,
        idChuyen:      v.id_chuyen,
        soToa:         v.so_toa_thu_tu,
        soGhe:         v.so_ghe_trong_toa,
        giaVe:         parseFloat(v.gia_ve),
        loaiHanhKhach: v.loai_hanh_khach,
      })),
    }
  })
}

// Kiểm tra trạng thái thanh toán
const getPaymentStatus = async (idThanhToan) => {
  const tt = await ThanhToan.findByPk(idThanhToan, {
    include: [{
      model: DonDatVe,
      attributes: ['ma_dat_cho', 'ma_don', 'trang_thai', 'id_don_dat_ve'],
      include: [{
        model: Ve,
        attributes: ['id_ve', 'id_chuyen', 'so_toa_thu_tu', 'so_ghe_trong_toa', 'gia_ve', 'loai_hanh_khach'],
      }],
    }],
  })
  if (!tt) throw { status: 404, message: 'Không tìm thấy giao dịch' }
  return tt
}

// Xử lý webhook SePay / ngân hàng
const processWebhook = async (body) => {
  const content = String(body.content || body.description || body.addInfo || '').toUpperCase()
  const match   = content.match(/KLN\d{6}/)
  if (!match) return null

  const maDon  = match[0]
  const soTien = parseFloat(body.transferAmount || body.amount || 0)

  const don = await DonDatVe.findOne({ where: { ma_don: maDon } })
  if (!don || don.trang_thai !== 'cho_thanh_toan') return null

  const tt = await ThanhToan.findOne({
    where: { id_don_dat_ve: don.id_don_dat_ve, trang_thai: 'dang_xu_ly' },
    order: [['id_thanh_toan', 'DESC']],
  })
  if (!tt) return null

  if (soTien > 0 && Math.abs(soTien - parseFloat(tt.so_tien)) > 2000) return null

  return confirmPayment(tt.id_thanh_toan)
}

module.exports = { createPayment, confirmPayment, getPaymentStatus, processWebhook, buildQrUrl }
