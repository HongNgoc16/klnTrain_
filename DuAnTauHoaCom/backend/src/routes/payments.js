const router = require('express').Router()
const PaymentController = require('../controllers/PaymentController')

// POST /api/payments — tạo giao dịch thanh toán
router.post('/', PaymentController.createPayment)

// POST /api/payments/webhook — SePay / ngân hàng tự động xác nhận (đặt TRƯỚC /:id)
router.post('/webhook', PaymentController.receiveWebhook)

// POST /api/payments/dev-confirm/:maDon — chỉ dùng khi phát triển
router.post('/dev-confirm/:maDon', PaymentController.devConfirm)

// PUT /api/payments/:idThanhToan/confirm — xác nhận thủ công (fallback)
router.put('/:idThanhToan/confirm', PaymentController.confirmPayment)

// GET /api/payments/:idThanhToan — polling trạng thái giao dịch
router.get('/:idThanhToan', PaymentController.getPaymentStatus)

module.exports = router
