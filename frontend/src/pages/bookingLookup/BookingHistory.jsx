// pages/bookingLookup/BookingHistory.jsx
import React, { useState, useEffect } from 'react'
import {
  FaTicket, FaSpinner, FaChevronRight,
  FaTrain, FaArrowRightLong, FaUsers, FaCalendarDays,
} from 'react-icons/fa6'
import { getUser, isLoggedIn } from '../../utils/authUtils'
import { getBookingHistory } from '../../api/bookings'
import { normalizeApiBooking } from '../../utils/normalizeBooking'
import BookingResult from './bookingResult/BookingResult'

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p ?? 0) + ' đ'

const STATUS = {
  da_thanh_toan: { cls: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500', label: 'Đã thanh toán' },
  da_xac_nhan:   { cls: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500', label: 'Đã xác nhận'   },
  cho_thanh_toan:{ cls: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-400', label: 'Chờ thanh toán'},
  cho_xac_nhan:  { cls: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-400', label: 'Chờ xác nhận'  },
  het_han:       { cls: 'bg-red-100  text-red-600   border-red-200',   bar: 'bg-red-400',   label: 'Hết hạn'        },
  da_huy:        { cls: 'bg-gray-100 text-gray-500  border-gray-200',  bar: 'bg-gray-300',  label: 'Đã hủy'         },
  da_doi:        { cls: 'bg-blue-100 text-blue-600  border-blue-200',  bar: 'bg-blue-400',  label: 'Đã đổi vé'      },
  da_su_dung:    { cls: 'bg-gray-100 text-gray-500  border-gray-200',  bar: 'bg-gray-300',  label: 'Đã sử dụng'     },
}

const getStatus = (s) =>
  STATUS[s] || { cls: 'bg-gray-100 text-gray-500 border-gray-200', bar: 'bg-gray-300', label: s || '--' }

// ── Card đơn đặt vé ───────────────────────────────────────────────
const BookingCard = ({ b, onClick }) => {
  const st       = getStatus(b.paymentStatus || b.status)
  const dep      = b.journeys?.[0]
  const ret      = b.journeys?.[1]
  const isRound  = !!ret
  const pCount   = b.passengers?.length || 1

  return (
    <button
      onClick={onClick}
      className="w-full text-left group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-[#8C1D19]/30 transition-all duration-200 overflow-hidden"
    >
      {/* Thanh màu trạng thái bên trái */}
      <div className="flex">
        <div className={`w-1 shrink-0 ${st.bar}`} />

        <div className="flex-1 p-4">
          {/* Row 1: mã + badge + giá + chevron */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-[#8C1D19] tracking-widest text-base leading-none">
                {b.bookingCode}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${st.cls}`}>
                {st.label}
              </span>
              {isRound && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                  Khứ hồi
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 leading-none mb-0.5">Tổng tiền</p>
                <p className="font-bold text-[#8C1D19] text-base leading-none">
                  {formatPrice(b.totalPrice || 0)}
                </p>
              </div>
              <FaChevronRight className="text-gray-300 group-hover:text-[#8C1D19] transition-colors text-sm" />
            </div>
          </div>

          {/* Row 2: hành trình */}
          {dep && (
            <div className="space-y-1.5">
              {/* Chiều đi */}
              <div className="flex items-center gap-2">
                <FaTrain className="text-[#8C1D19] text-xs shrink-0" />
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {dep.fromStation}
                </span>
                <FaArrowRightLong className="text-gray-400 text-xs shrink-0" />
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {dep.toStation}
                </span>
              </div>

              {/* Chiều về (nếu có) */}
              {isRound && (
                <div className="flex items-center gap-2 opacity-70">
                  <FaTrain className="text-blue-500 text-xs shrink-0" />
                  <span className="text-sm font-medium text-gray-600 truncate">
                    {ret.fromStation}
                  </span>
                  <FaArrowRightLong className="text-gray-300 text-xs shrink-0" />
                  <span className="text-sm font-medium text-gray-600 truncate">
                    {ret.toStation}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Row 3: meta info */}
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {dep?.departDate && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <FaCalendarDays className="text-[10px]" />
                {dep.departDate}
                {dep.departTime && ` · ${dep.departTime}`}
              </span>
            )}
            {dep?.trainCode && (
              <span className="text-xs text-gray-400 font-mono">{dep.trainCode}</span>
            )}
            {pCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <FaUsers className="text-[10px]" />
                {pCount} hành khách
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Component chính ───────────────────────────────────────────────
const BookingHistory = () => {
  const [bookings, setBookings]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) return
    setLoading(true)
    setError(null)
    getBookingHistory()
      .then(res => {
        const list = res.data || res
        setBookings(Array.isArray(list) ? list.map(normalizeApiBooking).filter(Boolean) : [])
      })
      .catch(err => setError(err.message || 'Lỗi tải lịch sử đặt vé'))
      .finally(() => setLoading(false))
  }, [])

  // Đang xem chi tiết
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
  if (!isLoggedIn()) {
    return (
      <div className="max-w-sm mx-auto py-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <FaTicket className="text-5xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#8C1D19] mb-2">Đăng nhập để xem lịch sử</h3>
          <p className="text-sm text-gray-500 mb-5">
            Vui lòng đăng nhập tài khoản KLN Train để xem các vé đã đặt.
          </p>
          <a href="/dang-nhap"
            className="block w-full py-2.5 bg-[#8C1D19] text-white rounded-lg font-semibold text-sm hover:bg-[#6a1613] transition-colors">
            Đăng nhập
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Tiêu đề */}
      <div className="flex items-center gap-2 mb-4">
        <FaTicket className="text-[#8C1D19] text-base" />
        <h3 className="font-bold text-gray-800 text-base">Lịch sử đặt vé</h3>
        {!loading && bookings.length > 0 && (
          <span className="ml-auto text-xs text-gray-400">{bookings.length} đơn</span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
          <FaSpinner className="animate-spin text-3xl text-[#8C1D19]/40" />
          <span className="text-sm">Đang tải lịch sử đặt vé...</span>
        </div>
      )}

      {/* Lỗi */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs text-[#8C1D19] underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Trống */}
      {!loading && !error && bookings.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <FaTicket className="text-5xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chưa có đơn đặt vé nào</p>
          <p className="text-xs text-gray-400 mt-1.5">Các vé bạn đặt sẽ xuất hiện ở đây.</p>
          <a href="/tim-ve"
            className="inline-block mt-4 px-5 py-2 bg-[#8C1D19] text-white rounded-lg text-sm font-semibold hover:bg-[#6a1613] transition-colors">
            Đặt vé ngay
          </a>
        </div>
      )}

      {/* Danh sách đơn */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b, i) => (
            <BookingCard key={b.bookingCode || i} b={b} onClick={() => setSelectedBooking(b)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingHistory
