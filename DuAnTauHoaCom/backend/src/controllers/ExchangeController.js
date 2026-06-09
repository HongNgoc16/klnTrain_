const ExchangeService = require('../services/ExchangeService')
const { ok, badRequest } = require('../utils/response')

const checkExchangeable = async (req, res, next) => {
  try {
    const { idVe } = req.params
    const result = await ExchangeService.checkExchangeable(parseInt(idVe))
    ok(res, result)
  } catch (err) { next(err) }
}

const exchangeTicket = async (req, res, next) => {
  try {
    const { idVeCu, newTicketData } = req.body
    if (!idVeCu || !newTicketData) return badRequest(res, 'Thiếu thông tin đổi vé')
    const result = await ExchangeService.exchangeTicket(idVeCu, newTicketData)
    ok(res, result, 'Đổi vé thành công')
  } catch (err) { next(err) }
}

module.exports = { checkExchangeable, exchangeTicket }
