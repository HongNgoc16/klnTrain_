// pages/bookingLookup/BookingHistory.jsx
import React, { useState, useMemo } from 'react'
import { FaEnvelope, FaUser, FaArrowRight, FaRightFromBracket, FaTicket } from 'react-icons/fa6'
import { getUser, loginUser, logoutUser } from '../../utils/authUtils'
import { MOCK_BOOKINGS, normalizeLocalBooking, normalizeMockBooking } from '../../data/bookingMock'
import BookingResult from './bookingResult/BookingResult'

const KLN_BOOKINGS_KEY = 'KLN_BOOKINGS'

const getMyBookings = (email) => {
  const norm = email.trim().toLowerCase()
  const results = []
  try {
    const stored = JSON.parse(localStorage.getItem(KLN_BOOKINGS_KEY) || '{}')
    Object.values(stored).forEach(b => {
      if (b.contactInfo?.email?.toLowerCase() === norm) {
        results.push(normalizeLocalBooking(b))
      }
    })
  } catch {}
  Object.values(MOCK_BOOKINGS).forEach(b => {
    if (b.contactEmail?.toLowerCase() === norm) {
      results.push(normalizeMockBooking(b))
    }
  })
  return results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

const StatusBadge = ({ status }) => {
  const map = {
    da_thanh_toan: 'bg-green-100 text-green-700',
    da_xac_nhan: 'bg-green-100 text-green-700',
    cho_thanh_toan: 'bg-yellow-100 text-yellow-700',
    cho_xac_nhan: 'bg-yellow-100 text-yellow-700',
    het_han: 'bg-red-100 text-red-600',
    da_huy: 'bg-gray-100 text-gray-500',
    da_doi: 'bg-blue-100 text-blue-600',
    da_su_dung: 'bg-gray-100 text-gray-500',
  }
  const label = {
    da_thanh_toan: 'Đã thanh toán',
    da_xac_nhan: 'Đã xác nhận',
    cho_thanh_toan: 'Chờ thanh toán',
    cho_xac_nhan: 'Chờ xác nhận',
    het_han: 'Hết hạn',
    da_huy: 'Đã hủy',
    da_doi: 'Đã đổi vé',
    da_su_dung: 'Đã sử dụng',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-500'}`}>{label[status] || status}</span>
}

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + ' đ'

// ── Trang đăng nhập ──────────────────────────────────────────────
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [err, setErr]     = useState('')

  const handle = (e) => {
    e.preventDefault()
    if (!email.trim()) { setErr('Vui lòng nhập email'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setErr('Email không hợp lệ'); return }
    onLogin(email, name)
  }

  return (
    <div className="max-w-sm mx-auto mt-4">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-[#8C1D19] mb-1">Đăng nhập</h3>
        <p className="text-sm text-gray-500 mb-4">Dùng email đã đặt vé để xem lịch sử</p>
        <form onSubmit={handle} className="space-y-3">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
              placeholder="Email đặt vé"
              className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#8C1D19] focus:ring-1 focus:ring-[#8C1D19]/30" />
          </div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Họ tên (không bắt buộc)"
              className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#8C1D19] focus:ring-1 focus:ring-[#8C1D19]/30" />
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <button type="submit"
            className="w-full h-11 bg-[#8C1D19] text-white rounded-lg font-semibold text-sm hover:bg-[#6a1613]">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Component chính ───────────────────────────────────────────────
const BookingHistory = () => {
  const [user, setUser]           = useState(() => getUser())
  const [selectedBooking, setSelectedBooking] = useState(null)

  const bookings = useMemo(
    () => (user ? getMyBookings(user.email) : []),
    [user]
  )

  const handleLogin = (email, name) => {
    const u = loginUser(email, name)
    setUser(u)
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setSelectedBooking(null)
  }

  // Đang xem chi tiết một vé
  if (selectedBooking) {
    return (
      <BookingResult
        data={selectedBooking}
        error={null}
        isLoading={false}
        onBack={() => setSelectedBooking(null)}
      />
    )
  }

  // Chưa đăng nhập
  if (!user) return <LoginForm onLogin={handleLogin} />

  // Đã đăng nhập
  return (
    <div>
      {/* Header user */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#8C1D19] border border-gray-200 rounded-md px-3 py-1.5">
          <FaRightFromBracket /> Đăng xuất
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow">
          <FaTicket className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Không tìm thấy đơn đặt vé nào cho email này.</p>
          <p className="text-xs text-gray-400 mt-1">Hãy đặt vé hoặc kiểm tra lại email.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b, i) => (
            <button key={i} onClick={() => setSelectedBooking(b)}
              className="w-full bg-white rounded-xl shadow hover:shadow-md transition-shadow p-4 text-left group border border-transparent hover:border-[#8C1D19]/20">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#8C1D19] tracking-wide text-base">{b.bookingCode}</span>
                    <StatusBadge status={b.paymentStatus || b.status} />
                  </div>
                  {b.journeys?.[0] && (
                    <p className="text-sm font-medium text-gray-800">
                      {b.journeys[0].fromStation} → {b.journeys[0].toStation}
                      {b.journeys.length > 1 && <span className="text-xs text-blue-500 ml-1">(Khứ hồi)</span>}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {b.journeys?.[0]?.departDate} · {b.journeys?.[0]?.trainCode}
                    {b.passengers?.length > 1 && ` · ${b.passengers.length} hành khách`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Tổng tiền</p>
                    <p className="font-bold text-[#ff8a00]">{formatPrice(b.totalPrice || 0)}</p>
                  </div>
                  <FaArrowRight className="text-gray-300 group-hover:text-[#8C1D19] transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingHistory
