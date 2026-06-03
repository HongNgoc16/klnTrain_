// pages/home/popularRoutes/PopularRoutes.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowRightLong, FaFire, FaTrain, FaTicket } from 'react-icons/fa6'
import RootLayout from '../../../layout/RootLayout'
import { getPopularRoutes } from '../../../api/trains'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price)

const rankStyle = (rank) => {
  if (rank === 1) return { bg: 'bg-yellow-400',  text: 'text-yellow-900',  label: '🏆 #1' }
  if (rank === 2) return { bg: 'bg-gray-300',     text: 'text-gray-700',   label: '🥈 #2' }
  if (rank === 3) return { bg: 'bg-orange-300',   text: 'text-orange-900', label: '🥉 #3' }
  return { bg: 'bg-[#8C1D19]/10', text: 'text-[#8C1D19]', label: `#${rank}` }
}

const cardBorder = (rank) => {
  if (rank === 1) return 'border-yellow-300 hover:border-yellow-400'
  if (rank === 2) return 'border-gray-200   hover:border-gray-400'
  if (rank === 3) return 'border-orange-200 hover:border-orange-400'
  return 'border-gray-100 hover:border-[#8C1D19]/30'
}

const RouteCard = ({ route, onBook }) => {
  const rs = rankStyle(route.rank)
  return (
    <article
      className={`relative rounded-xl border-2 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cardBorder(route.rank)}`}
    >
      {/* Rank badge */}
      <span className={`absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold shadow-sm ${rs.bg} ${rs.text}`}>
        {rs.label}
      </span>

      {/* Route display */}
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Từ</p>
          <p className="text-base font-bold text-gray-800 leading-tight">{route.gaDi}</p>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <FaTrain className="text-[#8C1D19] text-xs" />
          <FaArrowRightLong className="text-[#8C1D19] text-lg" />
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Đến</p>
          <p className="text-base font-bold text-gray-800 leading-tight">{route.gaDen}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-dashed border-gray-100" />

      {/* Footer */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Từ</p>
          <p className="text-lg font-bold text-[#8C1D19]">
            {route.giaMin > 0 ? `${fmt(route.giaMin)} đ` : 'Liên hệ'}
          </p>
          <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <FaTicket className="text-[#8C1D19] shrink-0" />
            {fmt(route.soLuotDat)} lượt đặt
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBook(route)}
          className="shrink-0 rounded-lg bg-[#8C1D19] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#6a1513] hover:shadow-md active:scale-95"
        >
          Đặt vé →
        </button>
      </div>
    </article>
  )
}

const PopularRoutes = () => {
  const navigate = useNavigate()
  const [routes, setRoutes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getPopularRoutes(10)
      .then(res => setRoutes(res.data || res))
      .catch(err => setError(err.message || 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  const handleBook = (route) => {
    navigate('/tim-ve', {
      state: {
        fromStation:   route.gaDi,
        toStation:     route.gaDen,
        departureDate: new Date().toISOString().split('T')[0],
        tripType:      'one-way',
        adultTickets:  1,
        childTickets:  0,
        ticketTotal:   1,
      },
    })
  }

  return (
    <section className="w-full bg-[#fffef9] py-10">
      <RootLayout>

        {/* Header */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaFire className="text-[#ff8a00] text-xl" />
              <h2 className="text-2xl font-bold text-neutral-800 md:text-3xl">
                Hành trình phổ biến
              </h2>
            </div>
            <p className="text-sm text-neutral-500 md:text-base">
              Top 10 tuyến tàu được đặt nhiều nhất — cập nhật từ dữ liệu thực tế
            </p>
          </div>
          <button
            onClick={() => navigate('/tim-ve')}
            className="shrink-0 rounded-lg border border-[#8C1D19] px-4 py-2 text-sm font-semibold text-[#8C1D19] hover:bg-[#8C1D19] hover:text-white transition-colors"
          >
            Xem tất cả →
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#8C1D19] border-t-transparent" />
            <span className="text-sm">Đang tải...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-8 text-center text-red-600">
            <p className="font-semibold mb-1">Không thể tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && routes.length === 0 && (
          <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-400">
            <FaTrain className="text-5xl mx-auto mb-3 opacity-30" />
            <p>Chưa có dữ liệu hành trình phổ biến.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && routes.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {routes.map((route) => (
              <RouteCard
                key={`${route.idGaLen}-${route.idGaDen}`}
                route={route}
                onBook={handleBook}
              />
            ))}
          </div>
        )}

      </RootLayout>
    </section>
  )
}

export default PopularRoutes
