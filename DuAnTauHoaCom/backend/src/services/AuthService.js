const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const TaiKhoanRepo = require('../repositories/TaiKhoanRepository')

const SALT_ROUNDS = 10

const register = async ({ email, matKhau, hoTen, soDienThoai }) => {
  const exists = await TaiKhoanRepo.emailExists(email)
  if (exists) throw { status: 400, message: 'Email đã được đăng ký' }

  const hashedPwd = await bcrypt.hash(matKhau, SALT_ROUNDS)
  const taiKhoan = await TaiKhoanRepo.create({
    email: email.toLowerCase().trim(),
    mat_khau: hashedPwd,
    ho_ten: hoTen.trim(),
    so_dien_thoai: soDienThoai || null,
    vai_tro: 'khach_hang',
    trang_thai: 'hoat_dong',
  })

  const token = signToken(taiKhoan)
  return { token, user: sanitize(taiKhoan) }
}

const login = async ({ email, matKhau }) => {
  const taiKhoan = await TaiKhoanRepo.findByEmail(email)
  if (!taiKhoan) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' }
  if (taiKhoan.trang_thai !== 'hoat_dong') throw { status: 403, message: 'Tài khoản đã bị khóa' }

  const valid = await bcrypt.compare(matKhau, taiKhoan.mat_khau)
  if (!valid) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' }

  const token = signToken(taiKhoan)
  return { token, user: sanitize(taiKhoan) }
}

const getProfile = async (idTaiKhoan) => {
  const taiKhoan = await TaiKhoanRepo.findById(idTaiKhoan)
  if (!taiKhoan) throw { status: 404, message: 'Không tìm thấy tài khoản' }
  return sanitize(taiKhoan)
}

const updateProfile = async (idTaiKhoan, data) => {
  const allowed = ['ho_ten', 'so_dien_thoai', 'ngay_sinh', 'gioi_tinh']
  const update = {}
  allowed.forEach(k => { if (data[k] !== undefined) update[k] = data[k] })
  await TaiKhoanRepo.update(idTaiKhoan, update, 'id_tai_khoan')
  return getProfile(idTaiKhoan)
}

const changePassword = async (idTaiKhoan, { matKhauCu, matKhauMoi }) => {
  const taiKhoan = await TaiKhoanRepo.findById(idTaiKhoan)
  const valid = await bcrypt.compare(matKhauCu, taiKhoan.mat_khau)
  if (!valid) throw { status: 400, message: 'Mật khẩu cũ không đúng' }
  const hashed = await bcrypt.hash(matKhauMoi, SALT_ROUNDS)
  await TaiKhoanRepo.update(idTaiKhoan, { mat_khau: hashed }, 'id_tai_khoan')
}

const signToken = (taiKhoan) =>
  jwt.sign(
    { id: taiKhoan.id_tai_khoan, email: taiKhoan.email, role: taiKhoan.vai_tro },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '365d' }
  )

// Gia hạn token: lấy thông tin từ token cũ và tạo token mới
const refreshToken = async (idTaiKhoan) => {
  const taiKhoan = await TaiKhoanRepo.findById(idTaiKhoan)
  if (!taiKhoan) throw { status: 404, message: 'Không tìm thấy tài khoản' }
  if (taiKhoan.trang_thai !== 'hoat_dong') throw { status: 403, message: 'Tài khoản đã bị khóa' }
  const token = signToken(taiKhoan)
  return { token, user: sanitize(taiKhoan) }
}

const sanitize = (tk) => ({
  id: tk.id_tai_khoan,
  email: tk.email,
  hoTen: tk.ho_ten,
  soDienThoai: tk.so_dien_thoai,
  ngaySinh: tk.ngay_sinh,
  gioiTinh: tk.gioi_tinh,
  vaiTro: tk.vai_tro,
  ngayTao: tk.ngay_tao,
})

module.exports = { register, login, getProfile, updateProfile, changePassword, refreshToken }
