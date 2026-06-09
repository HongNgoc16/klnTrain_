import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api/dieuphoi'
import { saveAuth, isLoggedIn } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', matKhau: '' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (isLoggedIn()) navigate('/') }, [])

  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1'

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const res = await login(form.email, form.matKhau)
      const d   = res.data || res
      const user = d.user || d
      const allowed = ['quan_tri', 'nhan_vien', 'dieu_phoi']
      if (!allowed.includes(user.vaiTro)) {
        setErr('Tài khoản không có quyền truy cập hệ thống điều phối.')
        setLoading(false)
        return
      }
      saveAuth({ token: d.token, ...user })
      navigate('/')
    } catch (e) {
      setErr(e.message || 'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-8 py-7 text-center">
          <div className="text-5xl mb-2">🚆</div>
          <h1 className="text-xl font-bold text-black">KLN Train</h1>
          <p className="text-sm text-black/70 mt-1">Hệ thống Điều Phối Viên</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          {sessionExpired && (
            <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
              ⏰ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" required value={form.email}
                onChange={e => { setForm(p => ({...p, email: e.target.value})); setErr('') }}
                placeholder="nv@klntrain.vn"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-yellow-400 focus:ring-0 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <input type="password" required value={form.matKhau}
                onChange={e => { setForm(p => ({...p, matKhau: e.target.value})); setErr('') }}
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-yellow-400 focus:ring-0 outline-none transition-colors" />
            </div>
            {err && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
                {err}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-5">
            Chỉ dành cho nhân viên điều phối viên KLN Train
          </p>
        </div>
      </div>
    </div>
  )
}
