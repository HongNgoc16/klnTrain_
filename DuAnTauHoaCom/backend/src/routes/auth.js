const router = require('express').Router()
const { body } = require('express-validator')
const AuthController = require('../controllers/AuthController')
const { authenticate } = require('../middleware/auth')

router.post('/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('matKhau').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('hoTen').notEmpty().withMessage('Họ tên không được để trống'),
  ],
  AuthController.register
)

router.post('/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('matKhau').notEmpty().withMessage('Mật khẩu không được để trống'),
  ],
  AuthController.login
)

router.get('/profile',         authenticate, AuthController.getProfile)
router.put('/profile',         authenticate, AuthController.updateProfile)
router.put('/change-password', authenticate, AuthController.changePassword)

// Gia hạn token — dùng token cũ (còn hợp lệ) để lấy token mới
// Frontend gọi khi token sắp hết hạn hoặc khi khởi động ứng dụng
router.post('/refresh', authenticate, AuthController.refreshToken)

module.exports = router
