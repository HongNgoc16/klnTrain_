import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FiCalendar, FiLogOut, FiUser } from 'react-icons/fi'
import { FaTrain } from 'react-icons/fa'
import { IoMdSpeedometer } from 'react-icons/io'
import { getUser, clearAuth } from '../utils/auth'

const MENU = [
  { to: '/dispatcher',              icon: IoMdSpeedometer, label: 'Tổng quan',    end: true },
  { to: '/dispatcher/chuyen-tau',   icon: FaTrain,         label: 'Quản lý Chuyến'          },
  { to: '/dispatcher/lich-chay',    icon: FiCalendar,      label: 'Lịch Chạy'               },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => { clearAuth(); navigate('/dispatcher/dang-nhap') }

  return (
    <div className="flex min-h-screen bg-[#FAF2DC] font-montserrat">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-700 flex flex-col shrink-0 fixed h-full shadow-[1px_0px_4px_rgba(147,146,146,0.3)]">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FaTrain className="text-2xl text-[#8C1D19]" />
            <div>
              <p className="font-bold leading-tight bg-gradient-to-br from-[#8C1D19] to-[#e67e22] bg-clip-text text-transparent">KLN Train</p>
              <p className="text-xs text-gray-400">Điều Phối Viên</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 space-y-1">
          {MENU.map(m => (
            <NavLink key={m.to} to={m.to} end={m.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-4 transition-all ${
                  isActive
                    ? 'border-[#8C1D19] text-[#8C1D19] bg-[#8C1D19]/5'
                    : 'border-transparent text-gray-500 hover:bg-[#8C1D19]/5 hover:text-[#8C1D19] hover:border-[#8C1D19]'
                }`
              }>
              <m.icon className="text-base" />
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#8C1D19]/10 flex items-center justify-center text-[#8C1D19] text-sm font-bold">
              {user?.hoTen?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-800 font-medium truncate">{user?.hoTen || 'Nhân viên'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <NavLink to="/dispatcher/thong-tin-ca-nhan"
            className={({ isActive }) =>
              `w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors mb-1 ${
                isActive ? 'bg-[#8C1D19]/10 text-[#8C1D19] font-semibold' : 'text-gray-500 hover:bg-[#8C1D19]/5 hover:text-[#8C1D19]'
              }`}>
            <FiUser /> Thông tin cá nhân
          </NavLink>
          <button onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
            <FiLogOut /> Đăng xuất
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
