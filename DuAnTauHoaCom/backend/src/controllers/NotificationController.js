const { ThongBao } = require('../models')
const { ok, notFound } = require('../utils/response')

// GET /api/notifications — danh sách thông báo của tài khoản đang đăng nhập
const getMyNotifications = async (req, res, next) => {
  try {
    const list = await ThongBao.findAll({
      where: { id_tai_khoan: req.user.id },
      order: [['thoi_gian_tao', 'DESC']],
      limit: 50,
    })
    const soChuaDoc = list.filter(t => !t.da_doc).length
    ok(res, { items: list, soChuaDoc })
  } catch (err) { next(err) }
}

// PUT /api/notifications/:id/read — đánh dấu 1 thông báo đã đọc
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params
    const tb = await ThongBao.findOne({ where: { id_thong_bao: id, id_tai_khoan: req.user.id } })
    if (!tb) return notFound(res, 'Không tìm thấy thông báo')
    if (!tb.da_doc) await tb.update({ da_doc: true })
    ok(res, null, 'Đã đánh dấu đã đọc')
  } catch (err) { next(err) }
}

// PUT /api/notifications/read-all — đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res, next) => {
  try {
    await ThongBao.update(
      { da_doc: true },
      { where: { id_tai_khoan: req.user.id, da_doc: false } }
    )
    ok(res, null, 'Đã đánh dấu tất cả là đã đọc')
  } catch (err) { next(err) }
}

module.exports = { getMyNotifications, markAsRead, markAllAsRead }
