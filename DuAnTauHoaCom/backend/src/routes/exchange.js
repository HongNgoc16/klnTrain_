const router = require('express').Router()
const ExchangeController = require('../controllers/ExchangeController')

// GET /api/exchange/check/:idVe — kiểm tra điều kiện đổi vé
router.get('/check/:idVe', ExchangeController.checkExchangeable)

// POST /api/exchange — thực hiện đổi vé
router.post('/', ExchangeController.exchangeTicket)

module.exports = router
