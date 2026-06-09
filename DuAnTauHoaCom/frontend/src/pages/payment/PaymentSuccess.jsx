// pages/payment/PaymentSuccess.jsx
import React, { useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaPrint, FaTrain, FaUser, FaIdCard, FaEnvelope, FaPhone, FaCalendar, FaChair, FaQrcode } from 'react-icons/fa6'
import { QRCodeSVG } from 'qrcode.react'
import RootLayout from '../../layout/RootLayout'
import { formatDate as formatDisplayDate } from '../../utils/dateUtils'
import { updateLocalBookingStatus } from '../../data/bookingMock'
import { getPassengerInfo } from '../../utils/passengerUtils'

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p) + ' đ'

const now = () => {
  const d = new Date()
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

// Vé điện tử dạng boarding pass
const TicketCard = ({ passenger, passengerIdx, trip, tripLabel, bookingCode, tripIdx, veList }) => {
  // Per-passenger seat data (new) or fallback to legacy coach/seats
  const pSeat      = trip?.passengerSeats?.[passengerIdx]
  const seatNumber = pSeat?.seatNumber ?? trip?.seats?.[passengerIdx] ?? trip?.seats?.[0] ?? '--'
  const coachId    = pSeat?.coachId ?? trip?.coach?.id ?? trip?.coach?.number ?? '--'
  const coachName  = pSeat?.coachName ?? trip?.coach?.name ?? ''
  const coachType  = coachName.replace(/^Toa \d+: /, '') || '--'
  const pricePerSeat = pSeat?.seatPrice ?? (trip?.totalPrice ? Math.round(trip.totalPrice / (trip?.seats?.length || 1)) : 0)
  const isChild   = pSeat?.isChild   || false
  const isElderly = pSeat?.isElderly || false
  const isStudent = pSeat?.isStudent || false
  const pType     = pSeat?.passengerType || (isChild ? 'child' : isElderly ? 'elderly' : isStudent ? 'student' : 'adult')
  const pInfo     = getPassengerInfo(pType)
  const ticketTypeLabel = pInfo.discount > 0
    ? `${pInfo.label} (-${Math.round(pInfo.discount * 100)}%)`
    : pInfo.label

  // Tìm mã vé thật từ DB theo idChuyen + soToa + soGhe
  const soToaFE = Number(pSeat?.soToaThuTu ?? pSeat?.coachId ?? trip?.coach?.id ?? coachId)
  const soGheFE = Number(seatNumber)
  const matchVe = (veList || []).find(v =>
    Number(v.idChuyen) === Number(trip?.idChuyen) &&
    Number(v.soToa)    === soToaFE &&
    Number(v.soGhe)    === soGheFE
  )
  const ticketCode = matchVe
    ? `VE${String(matchVe.idVe).padStart(6, '0')}`
    : `VE${bookingCode}${passengerIdx}${tripIdx ?? 0}`

  const qrData = `${ticketCode}|${passenger?.fullName}|${trip?.train?.code}|${trip?.fromStation}-${trip?.toStation}`

  return (
    <div className="bg-white border border-gray-400 max-w-sm mx-auto mb-6 shadow-md print:shadow-none print:border-black print:break-after-page text-sm">
      {/* Tiêu đề */}
      <div className="text-center border-b border-gray-300 py-3 px-4">
        <p className="font-bold leading-snug">CÔNG TY CỔ PHẦN VẬN TẢI</p>
        <p className="font-bold leading-snug">ĐƯỜNG SẮT KLN</p>
        <p className="font-bold text-base mt-1 tracking-wide">THẺ LÊN TÀU HỎA/BOARDING PASS</p>
      </div>

      {/* QR code */}
      <div className="flex justify-center py-3 border-b border-gray-300">
        <QRCodeSVG value={qrData} size={80} />
      </div>

      {/* Mã vé */}
      <div className="text-center py-1.5 border-b border-gray-300 bg-gray-50">
        <p>Mã vé/TicketID: <strong className="font-mono tracking-widest">{ticketCode}</strong></p>
      </div>

      {/* Ga đi / Ga đến */}
      <div className="flex justify-between px-6 py-3 border-b border-gray-300">
        <div>
          <p className="text-xs text-gray-500">Ga đi</p>
          <p className="font-black text-xl leading-tight">{(trip?.fromStation || '--').toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Ga đến</p>
          <p className="font-black text-xl leading-tight">{(trip?.toStation || '--').toUpperCase()}</p>
        </div>
      </div>

      {/* Chi tiết */}
      <table className="w-full">
        <tbody>
          {[
            ['Tàu/Train:', trip?.train?.code || '--'],
            ['Ngày đi/Date:', formatDisplayDate(trip?.departDate || trip?.train?.departDate)],
            ['Giờ đi/Time:', trip?.departTime || '--'],
            [`Toa/Coach: ${coachId}`, `Chỗ/Seat: ${seatNumber}`],
            ['Loại chỗ/Class:', coachType],
            ['Loại vé/Ticket:', ticketTypeLabel],
            ['Họ tên/Name:', passenger?.fullName || '--'],
            ...(passenger?.idCard ? [['Giấy tờ/Passport:', passenger.idCard]] : []),
            ...(pricePerSeat > 0 ? [['Giá/Price:', `${new Intl.NumberFormat('vi-VN').format(pricePerSeat)} VNĐ`]] : []),
          ].map(([label, value], i) => (
            <tr key={i} className="border-b border-gray-100 last:border-b-0">
              <td className="px-4 py-1.5 text-gray-500 whitespace-nowrap">{label}</td>
              <td className="px-4 py-1.5 font-bold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="border-t border-gray-300 px-4 py-2 flex justify-between text-xs text-gray-500">
        <span>Mã đặt chỗ: <strong className="text-[#8C1D19]">{bookingCode}</strong></span>
        <span>{now()}</span>
      </div>
    </div>
  )
}

const PaymentSuccess = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const printRef = useRef()

  const _chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bookingCode  = state?.bookingCode  || state?.orderCode || Array.from({length: 6}, () => _chars[Math.floor(Math.random() * _chars.length)]).join('')
  const orderCode    = state?.orderCode    || bookingCode
  const isRoundTrip  = state?.isRoundTrip  || false
  const isExchange   = state?.isExchange   || false
  const exchangeInfo = state?.exchangeInfo || null
  const trips        = state?.trips        || []

  // Cập nhật trạng thái booking gốc khi đổi vé thành công
  React.useEffect(() => {
    if (isExchange && exchangeInfo?.bookingCode) {
      updateLocalBookingStatus(exchangeInfo.bookingCode, 'da_doi', { exchangedAt: Date.now() })
    }
  }, [])
  const passengers   = state?.passengersInfo || []
  const contactInfo  = state?.contactInfo  || {}
  const totalAmount  = state?.totalAmount  || 0
  const veList       = state?.veList       || []

  const getTicketCode = (trip, pIdx, tIdx) => {
    const pSeat   = trip?.passengerSeats?.[pIdx]
    const soToaFE = Number(pSeat?.soToaThuTu ?? pSeat?.coachId ?? trip?.coach?.id)
    const soGheFE = Number(pSeat?.seatNumber ?? trip?.seats?.[pIdx])
    const matchVe = veList.find(v =>
      Number(v.idChuyen) === Number(trip?.idChuyen) &&
      Number(v.soToa)    === soToaFE &&
      Number(v.soGhe)    === soGheFE
    )
    return matchVe
      ? `VE${String(matchVe.idVe).padStart(6, '0')}`
      : `VE${bookingCode}${pIdx}${tIdx}`
  }

  const handlePrint = () => {
    const tickets = passengers.flatMap((passenger, pIdx) =>
      trips.map((trip, tIdx) => {
        const pSeat = trip?.passengerSeats?.[pIdx]
        return {
          ticketCode: getTicketCode(trip, pIdx, tIdx),
          bookingCode,
          passenger,
          fromStation: trip.fromStation,
          toStation: trip.toStation,
          trainCode: trip.train?.code,
          departDate: trip.departDate || trip.train?.departDate,
          departTime: trip.departTime || trip.train?.departTime,
          coachId:    pSeat?.coachId ?? trip?.coach?.id ?? '--',
          coachName:  pSeat?.coachName ?? trip?.coach?.name ?? '',
          seatNumber: pSeat?.seatNumber ?? trip?.seats?.[pIdx] ?? '--',
          price:      pSeat?.seatPrice ?? Math.round((trip.totalPrice || 0) / (passengers.length || 1)),
          isChild:    pSeat?.isChild || false,
        }
      })
    )
    navigate('/in-ve', { state: { tickets, bookingCode } })
  }

  if (!state) {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Không có thông tin đặt vé</h2>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#8C1D19] text-white rounded-lg">Về trang chủ</button>
          </div>
        </div>
      </RootLayout>
    )
  }

  return (
    <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Banner thành công */}
        <div className="no-print bg-green-50 border border-green-200 rounded-xl p-5 mb-5 text-center">
          <div className="text-5xl mb-2"></div>
          <h1 className="text-2xl font-bold text-green-700">
            {isExchange ? 'Đổi vé thành công!' : 'Thanh toán thành công!'}
          </h1>
          <p className="text-gray-600 mt-1">
            Mã đặt chỗ: <strong className="text-[#8C1D19] tracking-wider">{bookingCode}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Mã đơn hàng: {orderCode}</p>
          {contactInfo.email && (
            <p className="text-sm text-gray-500 mt-1">
              Vé điện tử đã gửi đến <strong>{contactInfo.email}</strong>
            </p>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3 mb-5 justify-center flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#8C1D19] text-[#8C1D19] rounded-lg font-medium hover:bg-[#8C1D19]/5 text-sm"
          >
            <FaPrint /> In vé
          </button>
          <button
            onClick={() => navigate('/thong-tin-dat-cho')}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
          >
            <FaQrcode /> Tra cứu vé
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#8C1D19] text-white rounded-lg font-medium hover:bg-[#6a1613] text-sm"
          >
            Về trang chủ
          </button>
        </div>

        {/* Vé điện tử */}
        <div ref={printRef}>
          <h2 className="text-lg font-bold text-gray-700 mb-3">VÉ ĐIỆN TỬ</h2>

          {isExchange && exchangeInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
              Đã đổi vé: {exchangeInfo.oldTrain} ({exchangeInfo.oldDate}) → vé mới được phát hành bên dưới
            </div>
          )}

          {passengers.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              <FaQrcode className="text-3xl mx-auto mb-2 text-gray-300" />
              <p>Tra cứu vé bằng mã đặt chỗ: <strong className="text-[#8C1D19]">{orderCode}</strong></p>
            </div>
          )}

          {/* In vé cho từng hành khách × từng chuyến */}
          {passengers.map((passenger, pIdx) => (
            <div key={pIdx}>
              {trips.map((trip, tIdx) => (
                <TicketCard
                  key={`${pIdx}-${tIdx}`}
                  passenger={passenger}
                  passengerIdx={pIdx}
                  trip={trip}
                  tripLabel={trips.length > 1 ? (tIdx === 0 ? 'CHIỀU ĐI' : 'CHIỀU VỀ') : 'CHIỀU ĐI'}
                  bookingCode={bookingCode}
                  tripIdx={tIdx}
                  veList={veList}
                />
              ))}
            </div>
          ))}

          {/* Tổng chi phí */}
          {totalAmount > 0 && (
            <div className="bg-white border rounded-xl p-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{passengers.length} hành khách · {isRoundTrip ? 'Khứ hồi' : 'Một chiều'}</span>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Tổng đã thanh toán</div>
                  <div className="text-xl font-bold text-[#ff8a00]">{formatPrice(totalAmount)}</div>
                </div>
              </div>
              {contactInfo.phone && (
                <div className="mt-2 flex gap-4 text-xs text-gray-500 border-t pt-2">
                  <span className="flex items-center gap-1"><FaPhone className="text-gray-400" />{contactInfo.phone}</span>
                  {contactInfo.email && <span className="flex items-center gap-1"><FaEnvelope className="text-gray-400" />{contactInfo.email}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lưu ý */}
        <div className="no-print mt-5 bg-white rounded-xl p-4 text-xs text-gray-500 space-y-1 border">
          <p>• Vé điện tử có giá trị như vé giấy. Vui lòng xuất trình CCCD/Passport khi lên tàu.</p>
          <p>• Chính sách hoàn vé: trước 3 ngày hoàn 90%, 1–3 ngày hoàn 75%, 4h–1 ngày hoàn 50%, dưới 4h không hoàn.</p>
          <p>• Hotline hỗ trợ: <a href="tel:19002087" className="text-[#ff8a00] font-medium">1900 2087</a> (7h30–23h)</p>
        </div>
      </div>
    </RootLayout>
  )
}

export default PaymentSuccess
