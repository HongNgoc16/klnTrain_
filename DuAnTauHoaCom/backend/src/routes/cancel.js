const router = require('express').Router()
const CancelController = require('../controllers/CancelController')

// GET /api/cancel/fee/:idVe — tính phí hủy vé
router.get('/fee/:idVe', CancelController.getCancelFee)

// POST /api/cancel — hủy vé
router.post('/', CancelController.cancelTickets)

module.exports = router
