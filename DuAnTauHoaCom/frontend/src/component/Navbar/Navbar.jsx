import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaBars, FaChevronDown, FaX, FaUser,
  FaRightFromBracket, FaTicket, FaTrain,
} from 'react-icons/fa6'
import { getUser, logoutUser } from '../../utils/authUtils'

const topbarItems = [
  { label: 'Trang chủ',           link: '/' },
  { label: 'Tìm vé',              link: '/tim-ve' },
  { label: 'Thông tin đặt chỗ',   link: '/thong-tin-dat-cho' },
  { label: 'Lịch tàu – giá vé',   link: '/chuyen-tau-gia-ve' },
  { label: 'Trả vé',              link: '/tra-ve' },
  { label: 'Đổi vé',              link: '/doi-ve' },
]

const Navbar = () => {
  const [open, setOpen]         = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef             = useRef(null)
  const location                = useLocation()
  const navigate                = useNavigate()
  const user                    = getUser()

  /* ── Scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Đóng menu khi đổi route ── */
  useEffect(() => { setOpen(false); setUserMenu(false) }, [location.pathname])

  /* ── Đóng user-dropdown khi click ra ngoài ── */
  useEffect(() => {
    if (!userMenu) return
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenu])

  const handleClose  = () => { setOpen(false); setUserMenu(false) }
  const handleLogout = () => {
    logoutUser()
    setUserMenu(false)
    navigate('/')
    window.location.reload()
  }

  const isActive = (link) =>
    link === '/' ? location.pathname === '/' : location.pathname === link

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      {/* ══ Main nav bar — 56px ══════════════════════════════════ */}
      <nav className="h-14 w-full bg-[#8C1D19]">
        <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-10">

          {/* Logo */}
          <Link
            to="/"
            onClick={handleClose}
            className="flex items-center gap-2 font-saira text-xl font-bold text-[#FDF2D6] transition-opacity hover:opacity-90 sm:text-2xl md:text-3xl"
          >
            <FaTrain className="text-[#FFD15A] text-lg sm:text-xl md:text-2xl shrink-0" />
            <span>KLN TRAIN</span>
          </Link>

          {/* Desktop — liên kết phụ + auth ── */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/"
              onClick={handleClose}
              className="text-[#FDF2D6]/80 text-sm font-medium hover:text-[#FFD15A] transition-colors"
            >
              Hỗ trợ
            </Link>
            <Link
              to="/"
              onClick={handleClose}
              className="text-[#FDF2D6]/80 text-sm font-medium hover:text-[#FFD15A] transition-colors"
            >
              Khuyến mãi
            </Link>

            <div className="h-4 w-px bg-white/20" />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu(m => !m)}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-sm text-[#FDF2D6] hover:border-[#FFD15A] hover:text-[#FFD15A] transition-all"
                >
                  <FaUser className="h-3.5 w-3.5 shrink-0" />
                  <span>{user.hoTen || user.email}</span>
                  <FaChevronDown className={`h-3 w-3 transition-transform duration-200 ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 animate-scale-in rounded-xl bg-white shadow-xl ring-1 ring-black/5 py-1 z-50">
                    <Link
                      to="/thong-tin-dat-cho"
                      onClick={handleClose}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#8C1D19]/5 hover:text-[#8C1D19] transition-colors"
                    >
                      <FaTicket className="text-[#8C1D19] shrink-0" />
                      Lịch sử đặt vé
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaRightFromBracket className="shrink-0" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/dang-nhap"
                  onClick={handleClose}
                  className="text-sm font-semibold text-[#FDF2D6] hover:text-[#FFD15A] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-ky"
                  onClick={handleClose}
                  className="rounded-full bg-[#FFD15A] px-4 py-1.5 text-sm font-bold text-[#8C1D19] hover:bg-[#ffe07a] transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: auth compact + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Auth button nhỏ gọn trên mobile */}
            {user ? (
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-full border border-white/30 px-2.5 py-1 text-xs font-medium text-[#FDF2D6]"
              >
                <FaUser className="h-3 w-3 shrink-0" />
                <span className="max-w-[130px] truncate">{user.hoTen || user.email}</span>
              </button>
            ) : (
              <Link
                to="/dang-nhap"
                onClick={handleClose}
                className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-[#FDF2D6] hover:bg-white/10 transition-colors"
              >
                Đăng nhập
              </Link>
            )}

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-label="Mở menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#FDF2D6] hover:bg-white/10 transition-colors"
            >
              {open
                ? <FaX className="h-3.5 w-3.5" />
                : <FaBars className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ══ Topbar — 40px — Luôn hiển thị, cuộn ngang trên mobile ═ */}
      <div className="h-10 w-full overflow-x-auto bg-[#FDF2D6] shadow-sm scrollbar-hide">
        <div
          className="flex h-full min-w-max px-2 sm:px-4 md:mx-auto md:grid md:min-w-0 md:max-w-screen-xl md:grid-cols-6 md:px-4 lg:px-10"
        >
          {topbarItems.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              onClick={handleClose}
              className={`font-roboto flex h-full min-w-[115px] items-center justify-center whitespace-nowrap px-3 text-center text-[11px] font-bold uppercase tracking-wide transition-colors duration-200 md:min-w-0 md:px-2 md:text-xs lg:text-sm ${
                isActive(item.link)
                  ? 'bg-[#FFE082] text-[#8C1D19] font-extrabold'
                  : 'text-[#8C1D19] hover:bg-[#8C1D19]/8'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ══ Mobile slide-down menu (chỉ auth + liên kết phụ) ════════ */}
      <div
        className={`overflow-hidden bg-[#7a1916] transition-all duration-300 ease-in-out md:hidden ${
          open ? 'max-h-[260px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-0.5">

          {/* Liên kết phụ */}
          <Link
            to="/"
            onClick={handleClose}
            className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-[#FDF2D6]/80 hover:bg-white/10 transition-colors"
          >
            Hỗ trợ
          </Link>
          <Link
            to="/"
            onClick={handleClose}
            className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-[#FDF2D6]/80 hover:bg-white/10 transition-colors"
          >
            Khuyến mãi
          </Link>

          <div className="my-2 border-t border-white/15" />

          {/* Auth */}
          {user ? (
            <div className="space-y-0.5">
              <p className="px-4 pb-1 text-xs text-white/50 font-medium">{user.hoTen || user.email}</p>
              <Link
                to="/thong-tin-dat-cho"
                onClick={handleClose}
                className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-[#FDF2D6] hover:bg-white/10 transition-colors"
              >
                <FaTicket className="text-[#FFD15A] shrink-0" />
                Lịch sử đặt vé
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-white/10 transition-colors"
              >
                <FaRightFromBracket className="shrink-0" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 pt-1 pb-2">
              <Link
                to="/dang-nhap"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-white/30 py-2 text-center text-sm font-semibold text-[#FDF2D6] hover:bg-white/10 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                onClick={handleClose}
                className="flex-1 rounded-lg bg-[#FFD15A] py-2 text-center text-sm font-bold text-[#8C1D19] hover:bg-[#ffe07a] transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
