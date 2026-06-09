// pages/bookingLookup/bookingResult/BookingResult.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPrint, FaDownload } from 'react-icons/fa'
import { formatDate } from '../../../utils/dateUtils'

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const genTicketCode = (seed) => {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = (((h << 5) + h) ^ seed.charCodeAt(i)) >>> 0
  return String((h % 900000000) + 100000000)
}

const StatusBadge = ({ status }) => {
  const config = {
    da_xac_nhan: 'text-green-600 bg-green-50',
    cho_xac_nhan: 'text-yellow-600 bg-yellow-50',
    da_huy: 'text-red-600 bg-red-50',
    da_doi: 'text-blue-600 bg-blue-50',
    da_su_dung: 'text-gray-600 bg-gray-100',
    da_thanh_toan: 'text-green-600 bg-green-50',
    cho_thanh_toan: 'text-yellow-600 bg-yellow-50',
    het_han: 'text-red-600 bg-red-50',
  }
  const text = {
    da_xac_nhan: 'Đã xác nhận',
    cho_xac_nhan: 'Chờ xác nhận',
    da_huy: 'Đã hủy',
    da_doi: 'Đã đổi vé',
    da_su_dung: 'Đã sử dụng',
    da_thanh_toan: 'Đã thanh toán',
    cho_thanh_toan: 'Chờ thanh toán',
    het_han: 'Hết hạn thanh toán',
  }
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-500'}`}>{text[status] || status}</span>
}

const BookingResult = ({ data, error, isLoading, onBack }) => {
  const navigate = useNavigate()

  const handlePrint = () => {
    if (!data) return
    const { bookingCode, passengers, journeys, rawTrips } = data
    const tickets = (passengers || []).flatMap((p, pIdx) =>
      (journeys || []).map((j, jIdx) => {
        // Ưu tiên giá từng chiều; fallback: chia đều p.price theo số chuyến
        const perJourneyPrice = p.priceByTrip?.[jIdx]
          ?? rawTrips?.[jIdx]?.passengerSeats?.[pIdx]?.seatPrice
          ?? (journeys.length > 1 ? Math.round((p.price || 0) / journeys.length) : (p.price || 0))
        return {
          ticketCode: genTicketCode(`${bookingCode}${pIdx}${jIdx}`),
          bookingCode,
          passenger: p,
          fromStation: j.fromStation,
          toStation: j.toStation,
          trainCode: j.trainCode,
          departDate: j.departDate,
          departTime: j.departTime,
          coachId: j.coachNumber,
          coachName: j.coachName,
          seatNumber: j.seats?.[pIdx] || j.seats?.[0] || '--',
          price: perJourneyPrice,
          isChild: p.type === 'child',
        }
      })
    )
    navigate('/in-ve', { state: { tickets, bookingCode } })
  }

  if (isLoading) return (
    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C1D19] mx-auto" />
      <p className="mt-4 text-gray-600">Đang tra cứu...</p>
    </div>
  )

  if (error) return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-red-50 p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">Không tìm thấy thông tin</h3>
        <p className="text-gray-600">{error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#8C1D19] text-white rounded-md hover:bg-[#6a1613] flex items-center gap-2 mx-auto">
          <FaArrowLeft /> Tìm lại
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const { bookingCode, passengers, journeys, totalPrice, serviceFee, bookingDate, bookingStatus, paymentStatus, customer } = data
  const isRoundTrip = journeys?.length >= 2
  const depJourneys = isRoundTrip ? [journeys[0]] : journeys
  const retJourneys = isRoundTrip ? journeys.slice(1) : []

  const getTicketCode = (pIdx, jIdx = 0) => genTicketCode(`${bookingCode}${pIdx}${jIdx}`)

  const PassengerTable = ({ journeyList, tableTitle, jStartIdx = 0 }) => (
    <div className="mb-6">
      {tableTitle && (
        <h3 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full inline-block ${jStartIdx === 0 ? 'bg-[#8C1D19]' : 'bg-blue-500'}`} />
          {tableTitle}
        </h3>
      )}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Họ và tên</th>
              <th className="px-4 py-3 text-left">Loại vé</th>
              <th className="px-4 py-3 text-left">Chỗ ngồi</th>
              <th className="px-4 py-3 text-left">Mã vé</th>
              <th className="px-4 py-3 text-right">Giá vé</th>
            </tr>
          </thead>
          <tbody>
            {passengers?.map((p, pIdx) => {
              const journey = journeyList?.[0]
              const seatNum = journey?.seats?.[pIdx] || '--'
              const ticketCode = getTicketCode(pIdx, jStartIdx)
              // Giá từng chiều: priceByTrip[jStartIdx] → rawTrips → fallback p.price
              const displayPrice = p.priceByTrip?.[jStartIdx]
                ?? data?.rawTrips?.[jStartIdx]?.passengerSeats?.[pIdx]?.seatPrice
                ?? p.price ?? 0
              return (
                <tr key={pIdx} className="border-t">
                  <td className="px-4 py-3 font-medium">{p.fullName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.type === 'child' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.type === 'child' ? 'Trẻ em' : 'Người lớn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {journey ? `Toa ${journey.coachNumber} · Chỗ ${seatNum}` : '--'}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">{ticketCode}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#8C1D19]">{formatPrice(displayPrice)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

      {/* Header */}
      <div className="bg-[#8C1D19] px-6 py-4 flex justify-between items-center flex-wrap gap-4">
        <button onClick={onBack} className="text-white/80 hover:text-white text-sm flex items-center gap-2">
          <FaArrowLeft /> Tìm kiếm lại
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="text-white/80 hover:text-white text-sm flex items-center gap-2 px-3 py-1 border border-white/30 rounded-md">
            <FaPrint /> In vé
          </button>
          <button onClick={handlePrint} className="text-white/80 hover:text-white text-sm flex items-center gap-2 px-3 py-1 border border-white/30 rounded-md">
            <FaDownload /> Tải vé
          </button>
        </div>
      </div>

      {/* Booking info */}
      <div className="p-6 space-y-6">

        {/* 1. THÔNG TIN ĐẶT CHỖ */}
        <div>
          <h2 className="text-xl font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-4">THÔNG TIN ĐẶT CHỖ</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 bg-gray-50 font-semibold w-2/5">Mã đặt chỗ</td>
                  <td className="px-4 py-3 font-bold text-[#8C1D19] tracking-wider text-lg">{bookingCode}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 bg-gray-50 font-semibold">Email</td>
                  <td className="px-4 py-3">{customer?.email || '—'}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 bg-gray-50 font-semibold">Ngày đặt chỗ</td>
                  <td className="px-4 py-3">{bookingDate || '—'}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 bg-gray-50 font-semibold">Trạng thái đặt chỗ</td>
                  <td className="px-4 py-3"><StatusBadge status={bookingStatus} /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold">Trạng thái thanh toán</td>
                  <td className="px-4 py-3"><StatusBadge status={paymentStatus} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. THÔNG TIN HÀNH KHÁCH */}
        {passengers?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-4">THÔNG TIN HÀNH KHÁCH</h2>
            <PassengerTable journeyList={depJourneys} tableTitle={isRoundTrip ? 'Chiều đi' : null} jStartIdx={0} />
            {isRoundTrip && retJourneys.length > 0 && (
              <PassengerTable journeyList={retJourneys} tableTitle="Chiều về" jStartIdx={1} />
            )}
          </div>
        )}

        {/* 3. THÔNG TIN HÀNH TRÌNH */}
        {journeys?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-4">THÔNG TIN HÀNH TRÌNH</h2>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Chiều</th>
                    <th className="px-4 py-3 text-left">Ga đi</th>
                    <th className="px-4 py-3 text-left">Ga đến</th>
                    <th className="px-4 py-3 text-left">Ngày đi</th>
                    <th className="px-4 py-3 text-left">Giờ đi</th>
                    <th className="px-4 py-3 text-left">Toa</th>
                  </tr>
                </thead>
                <tbody>
                  {journeys.map((j, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${i === 0 ? 'text-[#8C1D19]' : 'text-blue-600'}`}>{i === 0 ? 'Đi' : 'Về'}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{j.fromStation}</td>
                      <td className="px-4 py-3 font-medium">{j.toStation}</td>
                      <td className="px-4 py-3">{formatDate(j.departDate)}</td>
                      <td className="px-4 py-3">{j.departTime}</td>
                      <td className="px-4 py-3">{j.coachNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer tổng tiền */}
        <div className="border-t pt-4 flex justify-between items-start flex-wrap gap-4">
          <p className="text-sm text-gray-500">* Vui lòng xuất trình CMND/CCCD khi lên tàu</p>
          <div className="text-right space-y-0.5">
            {serviceFee > 0 && (
              <>
                <p className="text-sm text-gray-500">
                  Giá vé: <span className="font-medium text-gray-700">{formatPrice((totalPrice || 0) - serviceFee)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Phí dịch vụ: <span className="font-medium text-gray-700">+{formatPrice(serviceFee)}</span>
                </p>
              </>
            )}
            <p className="text-sm text-gray-500">Tổng thanh toán</p>
            <p className="text-2xl font-bold text-[#8C1D19]">{formatPrice(totalPrice || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingResult
