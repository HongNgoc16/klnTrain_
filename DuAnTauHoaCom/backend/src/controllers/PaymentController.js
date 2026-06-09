const PaymentService = require('../services/PaymentService')
const { DonDatVe, ThanhToan } = require('../models')
const { ok, created, badRequest } = require('../utils/response')

const createPayment = async (req, res, next) => {
  try {
    const { idDonDatVe, phuongThuc } = req.body
    if (!idDonDatVe) return badRequest(res, 'Thiếu idDonDatVe')
    const result = await PaymentService.createPayment(idDonDatVe, phuongThuc)
    created(res, result, 'Tạo giao dịch thanh toán thành công')
  } catch (err) { next(err) }
}

const confirmPayment = async (req, res, next) => {
  try {
    const { idThanhToan } = req.params
    const result = await PaymentService.confirmPayment(parseInt(idThanhToan))
    ok(res, result, 'Xác nhận thanh toán thành công')
  } catch (err) { next(err) }
}

const getPaymentStatus = async (req, res, next) => {
  try {
    const { idThanhToan } = req.params
    const result = await PaymentService.getPaymentStatus(parseInt(idThanhToan))
    ok(res, result)
  } catch (err) { next(err) }
}

// POST /api/payments/webhook — SePay/ngân hàng gọi khi có giao dịch khớp
const receiveWebhook = async (req, res, next) => {
  try {
    // Xác thực token SePay (nếu cấu hình trong .env)
    const token = req.headers['authorization'] || req.headers['x-sepay-token'] || ''
    const expected = process.env.SEPAY_WEBHOOK_TOKEN
    if (expected && token.replace('Bearer ', '') !== expected) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    await PaymentService.processWebhook(req.body)
    res.json({ success: true })
  } catch (err) { next(err) }
}

// POST /api/payments/dev-confirm/:maDon — chỉ dùng khi phát triển/kiểm thử
const devConfirm = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return badRequest(res, 'Không khả dụng')
    const { maDon } = req.params
    const don = await DonDatVe.findOne({ where: { ma_don: maDon.toUpperCase() } })
    if (!don) return badRequest(res, 'Không tìm thấy đơn')
    const tt = await ThanhToan.findOne({
      where: { id_don_dat_ve: don.id_don_dat_ve, trang_thai: 'dang_xu_ly' },
      order: [['id_thanh_toan', 'DESC']],
    })
    if (!tt) return badRequest(res, 'Không tìm thấy giao dịch đang xử lý')
    const result = await PaymentService.confirmPayment(tt.id_thanh_toan)
    ok(res, result, 'Dev confirm thành công')
  } catch (err) { next(err) }
}

module.exports = { createPayment, confirmPayment, getPaymentStatus, receiveWebhook, devConfirm }
