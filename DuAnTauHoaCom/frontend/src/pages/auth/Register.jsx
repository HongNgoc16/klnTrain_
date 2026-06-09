// pages/auth/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTrain, FaUser, FaPhone } from 'react-icons/fa6'
import { register as apiRegister } from '../../api/auth'
import { loginUser } from '../../utils/authUtils'
import background from '../../assets/background.jpg'

const Register = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    hoTen: '', email: '', soDienThoai: '', matKhau: '', xacNhanMatKhau: ''
  })
  const [showPwd, setShowPwd]     = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [errors, setErrors]       = useState({})
  const [apiError, setApiError]   = useState(null)
  const [loading, setLoading]     = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    let processed = value
    if (name === 'soDienThoai') processed = value.replace(/\D/g, '').slice(0, 10)
    setForm(prev => ({ ...prev, [name]: processed }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError(null)
  }

  const validate = () => {
    const errs = {}
    if (!form.hoTen.trim() || form.hoTen.trim().length < 2)
      errs.hoTen = 'Họ tên phải có ít nhất 2 ký tự'
    if (!form.email.trim())
      errs.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@.]+\.[^\s@.]{2,}$/.test(form.email))
      errs.email = 'Email không hợp lệ'
    if (form.soDienThoai && !/^0[0-9]{9}$/.test(form.soDienThoai))
      errs.soDienThoai = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'
    if (!form.matKhau)
      errs.matKhau = 'Vui lòng nhập mật khẩu'
    else if (form.matKhau.length < 6)
      errs.matKhau = 'Mật khẩu ít nhất 6 ký tự'
    if (!form.xacNhanMatKhau)
      errs.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu'
    else if (form.xacNhanMatKhau !== form.matKhau)
      errs.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res  = await apiRegister({
        hoTen:        form.hoTen.trim(),
        email:        form.email.trim(),
        soDienThoai:  form.soDienThoai || undefined,
        matKhau:      form.matKhau,
      })
      const data = res.data || res
      loginUser({ token: data.token, user: data.user })
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (field) =>
    `w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 pt-[var(--nav-h)]"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-[#8C1D19] px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <FaTrain className="text-[#FFD15A] text-3xl" />
              <span className="text-3xl font-bold text-[#FDF2D6]">KLN TRAIN</span>
            </div>
            <p className="text-[#FDF2D6]/80 text-sm">Tạo tài khoản để trải nghiệm dịch vụ đặt vé</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Đăng ký tài khoản</h2>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="text" name="hoTen" value={form.hoTen}
                    onChange={handleChange} placeholder="Nguyễn Văn A"
                    className={inputCls('hoTen')} />
                </div>
                {errors.hoTen && <p className="text-red-500 text-xs mt-1">{errors.hoTen}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="example@email.com"
                    className={inputCls('email')} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="tel" name="soDienThoai" value={form.soDienThoai}
                    onChange={handleChange} placeholder="0912345678"
                    maxLength={10} inputMode="numeric"
                    className={inputCls('soDienThoai')} />
                </div>
                {errors.soDienThoai && <p className="text-red-500 text-xs mt-1">{errors.soDienThoai}</p>}
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type={showPwd ? 'text' : 'password'} name="matKhau" value={form.matKhau}
                    onChange={handleChange} placeholder="Ít nhất 6 ký tự"
                    className={`${inputCls('matKhau')} pr-10`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {errors.matKhau && <p className="text-red-500 text-xs mt-1">{errors.matKhau}</p>}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type={showCfm ? 'text' : 'password'} name="xacNhanMatKhau" value={form.xacNhanMatKhau}
                    onChange={handleChange} placeholder="Nhập lại mật khẩu"
                    className={`${inputCls('xacNhanMatKhau')} pr-10`} />
                  <button type="button" onClick={() => setShowCfm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCfm ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {errors.xacNhanMatKhau && <p className="text-red-500 text-xs mt-1">{errors.xacNhanMatKhau}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#8C1D19] text-white rounded-lg font-semibold hover:bg-[#6a1613] disabled:bg-gray-400 transition-colors text-sm">
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className="text-[#8C1D19] font-semibold hover:underline">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
