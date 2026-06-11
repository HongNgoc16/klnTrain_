const router = require('express').Router()

// Hệ thống Quản trị (Admin) — được mount tại /api/admin trong app.js chính
router.use('/auth',          require('./routes/auth.routes'))
router.use('/dashboard',     require('./routes/dashboard.routes'))
router.use('/stations',      require('./routes/stations.routes'))
router.use('/trains',        require('./routes/trains.routes'))
router.use('/carriages',     require('./routes/carriages.routes'))
router.use('/customers',     require('./routes/customers.routes'))
router.use('/seats',         require('./routes/seats.routes'))
router.use('/policies',      require('./routes/policies.routes'))
router.use('/schedules',     require('./routes/schedules.routes'))
router.use('/users',         require('./routes/users.routes'))
router.use('/coupons',       require('./routes/coupons.routes'))
router.use('/refunds',       require('./routes/refunds.routes'))
router.use('/reports',       require('./routes/reports.routes'))
router.use('/notifications', require('./routes/notifications.routes'))
router.use('/tickets',       require('./routes/ticket.routes'))

// Health check
router.get('/health', (req, res) => res.json({ success: true, message: 'KLN Train Admin API đang hoạt động', time: new Date() }))

module.exports = router
