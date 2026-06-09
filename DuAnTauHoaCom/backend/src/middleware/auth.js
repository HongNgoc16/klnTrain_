const jwt = require('jsonwebtoken')
const { unauthorized, forbidden } = require('../utils/response')

const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return unauthorized(res, 'Vui lòng đăng nhập')

  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return unauthorized(res, 'Token không hợp lệ hoặc đã hết hạn')
  }
}

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    } catch {}
  }
  next()
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'quan_tri')
    return forbidden(res, 'Chỉ quản trị viên mới có quyền truy cập')
  next()
}

module.exports = { authenticate, optionalAuth, requireAdmin }
