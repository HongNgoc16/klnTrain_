import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getUser, clearAuth } from '../utils/auth'

const MENU = [
  { to: '/',           icon: '📊', label: 'Tổng quan',       end: true  },
  { to: '/chuyen-tau', icon: '🚂', label: 'Quản lý Chuyến'             },
  { to: '/lich-chay',  icon: '📅', label: 'Lịch Chạy'                  },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => { clearAuth(); navigate('/dang-nhap') }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0 fixed h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚆</span>
            <div>
              <p className="font-bold text-yellow-400 leading-tight">KLN Train</p>
              <p className="text-xs text-gray-400">Điều Phối Viên</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1">
          {MENU.map(m => (
            <NavLink key={m.to} to={m.to} end={m.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }>
              <span className="text-base">{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-sm font-bold">
              {user?.hoTen?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.hoTen || 'Nhân viên'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
