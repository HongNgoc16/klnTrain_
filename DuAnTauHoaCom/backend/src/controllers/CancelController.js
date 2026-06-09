const CancelService = require('../services/CancelService')
const { ok, badRequest } = require('../utils/response')

const getCancelFee = async (req, res, next) => {
  try {
    const { idVe } = req.params
    const result = await CancelService.tinhPhiHuy(parseInt(idVe))
    ok(res, result)
  } catch (err) { next(err) }
}

const cancelTickets = async (req, res, next) => {
  try {
    const { maDatCho, idVeList, lyDo } = req.body
    if (!maDatCho || !idVeList?.length) return badRequest(res, 'Thiếu maDatCho hoặc danh sách vé')
    const result = await CancelService.cancelTickets(maDatCho, idVeList, lyDo)
    ok(res, result, `Hủy ${result.soVeHuy} vé thành công. Hoàn tiền: ${result.tongTienHoan.toLocaleString('vi-VN')}đ`)
  } catch (err) { next(err) }
}

module.exports = { getCancelFee, cancelTickets }
