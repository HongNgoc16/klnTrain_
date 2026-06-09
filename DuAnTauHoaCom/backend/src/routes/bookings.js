const router = require('express').Router()
const BookingController = require('../controllers/BookingController')
const { authenticate, optionalAuth } = require('../middleware/auth')

// POST /api/bookings/hold-seats — giữ ghế tạm (trước khi điền form)
router.post('/hold-seats', BookingController.holdSeats)

// POST /api/bookings/release-hold — giải phóng ghế khi thoát form checkout không điền xong
router.post('/release-hold', BookingController.releaseHold)

// POST /api/bookings — tạo đơn đặt vé (khách vãng lai hoặc đã đăng nhập)
router.post('/', optionalAuth, BookingController.createBooking)

// POST /api/bookings/lookup — tra cứu theo mã + email/phone
router.post('/lookup', BookingController.lookupBooking)

// GET /api/bookings/history — lịch sử của tài khoản
router.get('/history', authenticate, BookingController.getBookingHistory)

// GET /api/bookings/:maDatCho
router.get('/:maDatCho', BookingController.getBookingByCode)

module.exports = router
