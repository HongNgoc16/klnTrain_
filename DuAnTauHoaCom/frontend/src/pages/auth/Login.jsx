// pages/auth/Login.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTrain } from 'react-icons/fa6'
import { login as apiLogin } from '../../api/auth'
import { loginUser } from '../../utils/authUtils'
import background from '../../assets/background.jpg'

const Login = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/'

  const [form, setForm]       = useState({ email: '', matKhau: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Hiện thông báo khi bị redirect do token hết hạn
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1'
  useEffect(() => {
    if (sessionExpired) setApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }, [sessionExpired])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError(null)
  }

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@.]+\.[^\s@.]{2,}$/.test(form.email)) errs.email = 'Email không hợp lệ'
    if (!form.matKhau) errs.matKhau = 'Vui lòng nhập mật khẩu'
    else if (form.matKhau.length < 6) errs.matKhau = 'Mật khẩu ít nhất 6 ký tự'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res  = await apiLogin({ email: form.email.trim(), matKhau: form.matKhau })
      const data = res.data || res
      loginUser({ token: data.token, user: data.user })
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-12 pt-[var(--nav-h)]"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-[#8C1D19] px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <FaTrain className="text-[#FFD15A] text-3xl" />
              <span className="text-3xl font-bold text-[#FDF2D6]">KLN TRAIN</span>
            </div>
            <p className="text-[#FDF2D6]/80 text-sm">Đăng nhập để quản lý hành trình của bạn</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <h2 className="text-xl font-bold text-gray-800 mb-5">Đăng nhập</h2>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="example@email.com"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPwd ? 'text' : 'password'} name="matKhau" value={form.matKhau}
                    onChange={handleChange} placeholder="Nhập mật khẩu"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 ${errors.matKhau ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {errors.matKhau && <p className="text-red-500 text-xs mt-1">{errors.matKhau}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#8C1D19] text-white rounded-lg font-semibold hover:bg-[#6a1613] disabled:bg-gray-400 transition-colors text-sm">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className="text-[#8C1D19] font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
