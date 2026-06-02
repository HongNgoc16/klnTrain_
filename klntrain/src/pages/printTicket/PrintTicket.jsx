// pages/printTicket/PrintTicket.jsx — standalone print page, no navbar/layout
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TicketCard from '../../components/TicketCard'

const PrintTicket = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { tickets = [], bookingCode = '' } = state || {}

  useEffect(() => {
    if (tickets.length > 0) {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [])

  if (!state || tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white rounded-xl p-8 shadow">
          <p className="text-gray-500 mb-4">Không có dữ liệu vé để in</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#8C1D19] text-white rounded-md text-sm">Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      {/* Control bar — ẩn khi in */}
      <div className="no-print max-w-sm mx-auto mb-4 flex justify-between items-center px-2">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Quay lại
        </button>
        <span className="text-xs text-gray-400">Mã đặt chỗ: <strong className="text-[#8C1D19]">{bookingCode}</strong></span>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#8C1D19] text-white rounded-md text-sm font-medium"
        >
          In vé
        </button>
      </div>

      {tickets.map((ticket, i) => (
        <TicketCard key={i} ticket={ticket} />
      ))}
    </div>
  )
}

export default PrintTicket
