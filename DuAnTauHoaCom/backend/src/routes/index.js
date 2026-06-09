const router = require('express').Router()

router.use('/auth',     require('./auth'))
router.use('/trains',   require('./trains'))
router.use('/bookings', require('./bookings'))
router.use('/payments', require('./payments'))
router.use('/cancel',   require('./cancel'))
router.use('/exchange', require('./exchange'))
router.use('/notifications', require('./notifications'))
router.use('/dispatch', require('./dieuphoi'))   // Hệ thống Điều Phối Viên

// Health check
router.get('/health', (req, res) => res.json({ success: true, message: 'KLN Train API đang hoạt động', time: new Date() }))

module.exports = router
