const AuthService = require('../services/AuthService')
const { ok, created, badRequest } = require('../utils/response')
const { validationResult } = require('express-validator')

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return badRequest(res, 'Dữ liệu không hợp lệ', errors.array())

    const { email, matKhau, hoTen, soDienThoai } = req.body
    const result = await AuthService.register({ email, matKhau, hoTen, soDienThoai })
    created(res, result, 'Đăng ký thành công')
  } catch (err) { next(err) }
}

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return badRequest(res, 'Dữ liệu không hợp lệ', errors.array())

    const { email, matKhau } = req.body
    const result = await AuthService.login({ email, matKhau })
    ok(res, result, 'Đăng nhập thành công')
  } catch (err) { next(err) }
}

const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.user.id)
    ok(res, user)
  } catch (err) { next(err) }
}

const updateProfile = async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.user.id, req.body)
    ok(res, user, 'Cập nhật thông tin thành công')
  } catch (err) { next(err) }
}

const changePassword = async (req, res, next) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body
    await AuthService.changePassword(req.user.id, { matKhauCu, matKhauMoi })
    ok(res, null, 'Đổi mật khẩu thành công')
  } catch (err) { next(err) }
}

// POST /api/auth/refresh — gia hạn token (dùng token cũ, trả token mới)
const refreshToken = async (req, res, next) => {
  try {
    const result = await AuthService.refreshToken(req.user.id)
    ok(res, result, 'Gia hạn token thành công')
  } catch (err) { next(err) }
}

module.exports = { register, login, getProfile, updateProfile, changePassword, refreshToken }
