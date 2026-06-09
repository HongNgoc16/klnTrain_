// pages/bookingLookup/bookingResult/BookingResult.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPrint, FaDownload, FaCreditCard } from 'react-icons/fa'
import { FaCircleExclamation, FaCircleCheck } from 'react-icons/fa6'
import { mapLoaiHKToType, getPassengerInfo } from '../../../utils/passengerUtils'

const fmt = (p) => new Intl.NumberFormat('vi-VN').format(p ?? 0) + ' đ'

const Badge = ({ status }) => {
  const MAP = {
    da_xac_nhan:    { cls: 'text-green-700  bg-green-50  border-green-200',  label: 'Đã xác nhận' },
    cho_xac_nhan:   { cls: 'text-yellow-700 bg-yellow-50 border-yellow-200', label: 'Chờ xác nhận' },
    da_huy:         { cls: 'text-red-700    bg-red-50    border-red-200',    label: 'Đã hủy' },
    da_doi:         { cls: 'text-blue-700   bg-blue-50   border-blue-200',   label: 'Đã đổi vé' },
    da_su_dung:     { cls: 'text-gray-600   bg-gray-100  border-gray-200',   label: 'Đã sử dụng' },
    da_thanh_toan:  { cls: 'text-green-700  bg-green-50  border-green-200',  label: 'Đã thanh toán' },
    cho_thanh_toan: { cls: 'text-yellow-700 bg-yellow-50 border-yellow-200', label: 'Chờ thanh toán' },
    het_han:        { cls: 'text-red-700    bg-red-50    border-red-200',    label: 'Hết hạn' },
  }
  const { cls, label } = MAP[status] || { cls: 'bg-gray-100 text-gray-500 border-gray-200', label: status || '--' }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>
}

/* ────────────────────────────────────────────────────────── */

const BookingResult = ({ data, error, isLoading, onBack }) => {
  const navigate = useNavigate()

  /* ── Loading ── */
  if (isLoading) return (
    <div className="bg-white rounded-xl shadow p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8C1D19] mx-auto" />
      <p className="mt-4 text-gray-600">Đang tra cứu...</p>
    </div>
  )

  /* ── Lỗi ── */
  if (error) return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-red-50 p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">Không tìm thấy thông tin</h3>
        <p className="text-gray-600 text-sm">{error}</p>
        <button onClick={onBack}
          className="mt-4 px-5 py-2 bg-[#8C1D19] text-white rounded-lg text-sm hover:bg-[#6a1613] flex items-center gap-2 mx-auto">
          <FaArrowLeft /> Tìm lại
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const {
    bookingCode, totalPrice, serviceFee,
    bookingDate, bookingStatus, paymentStatus,
    customer, expiresAt, idDon, orderCode,
    passengers, journeys,
    veList = [],
  } = data

  const isPaid      = paymentStatus === 'da_thanh_toan' || bookingStatus === 'da_xac_nhan'
  const isPending   = paymentStatus === 'cho_thanh_toan'
  const isHetHan    = paymentStatus === 'het_han' || (isPending && expiresAt && expiresAt < Date.now())
  const canContinue = isPending && !isHetHan

  /* ── Hết hạn ── */
  if (isHetHan) return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="bg-red-50 p-10 text-center">
        <FaCircleExclamation className="text-5xl text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Mã đặt chỗ đã hết hạn</h3>
        <p className="text-gray-600 mb-1">
          Mã đặt chỗ <strong className="text-[#8C1D19]">{bookingCode}</strong> chưa được thanh toán và đã hết hạn.
        </p>
        <p className="text-sm text-gray-500 mt-1">Ghế đã được giải phóng. Vui lòng thực hiện đặt vé mới.</p>
        <div className="mt-5 flex gap-3 justify-center">
          <button onClick={onBack} className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Tra cứu lại</button>
          <a href="/" className="px-5 py-2 bg-[#8C1D19] text-white rounded-lg text-sm font-semibold hover:bg-[#6a1613]">Đặt vé mới</a>
        </div>
      </div>
    </div>
  )

  /* ── Tiếp tục thanh toán ── */
  const handleContinuePayment = () => {
    const isRoundTrip = (journeys?.length || 0) >= 2
    const tripsForPayment = (journeys || []).map((j, jIdx) => ({
      fromStation: j.fromStation, toStation: j.toStation,
      departTime: j.departTime, arriveTime: j.arriveTime || '',
      departDate: j.departDate, arriveDate: j.departDate,
      idChuyen: j.idChuyen,
      train: { code: j.trainCode, type: '', departDate: j.departDate, departTime: j.departTime },
      coach: { name: j.coachName || `Toa ${j.coachNumber}`, number: j.coachNumber, id: Number(j.coachNumber) },
      seats: j.seats || [],
      passengerSeats: (passengers || []).map((p, pIdx) => ({
        seatNumber: Number(j.seats?.[pIdx] || 0), coachId: Number(j.coachNumber),
        soToaThuTu: Number(j.coachNumber), coachName: j.coachName || `Toa ${j.coachNumber}`,
        seatPrice: p.priceByTrip?.[jIdx] || 0, isChild: p.type === 'child',
      })),
      totalPrice: (passengers || []).reduce((s, p) => s + (p.priceByTrip?.[jIdx] || 0), 0),
      sessionId: null,
    }))
    navigate('/thanh-toan', {
      state: {
        bookingCode, orderCode, idDon, totalAmount: totalPrice,
        tripType: isRoundTrip ? 'round-trip' : 'one-way',
        trips: tripsForPayment,
        totalPassengers: passengers?.length || 0,
        adultTickets: (passengers || []).filter(p => p.type !== 'child').length,
        childTickets: (passengers || []).filter(p => p.type === 'child').length,
        passengersInfo: (passengers || []).map(p => ({ ...p })),
        contactInfo: { phone: customer?.phone || '', email: customer?.email || '' },
        hetHan: expiresAt ? new Date(expiresAt).toISOString() : null,
      }
    })
  }

  const handlePrint = () => {
    if (!veList?.length) return
    const tickets = veList.map(v => ({
      ticketCode:  String(v.idVe),
      bookingCode,
      passenger:   { fullName: v.fullName, type: mapLoaiHKToType(v.loaiHanhKhach) },
      fromStation: v.gaDi,
      toStation:   v.gaDen,
      trainCode:   v.maTau,
      departDate:  v.departDate,
      departTime:  v.departTime,
      coachId:     v.soToa,
      seatNumber:  v.soGhe,
      price:       v.giaVe,
      isChild:   v.loaiHanhKhach === 'tre_em',
      isElderly: v.loaiHanhKhach === 'nguoi_cao_tuoi',
      isStudent: v.loaiHanhKhach === 'sinh_vien',
    }))
    navigate('/in-ve', { state: { tickets, bookingCode } })
  }

  /* ── Nhóm veList theo chuyến (idChuyen + gaDi) ── */
  const tripMap = new Map()
  veList.forEach(v => {
    const key = v.idChuyen ? String(v.idChuyen) : `${v.gaDi}|${v.gaDen}|${v.departDate}`
    if (!tripMap.has(key)) tripMap.set(key, [])
    tripMap.get(key).push(v)
  })
  const tripGroups = Array.from(tripMap.values())
  const isRoundTrip = tripGroups.length >= 2
  const ticketPrice = (totalPrice || 0) - (serviceFee || 0)

  /* ── Bảng hành khách theo chiều ── */
  const TripPassengerTable = ({ tickets, tripIdx }) => {
    if (!tickets?.length) return null
    const firstTicket = tickets[0]
    const label = isRoundTrip ? (tripIdx === 0 ? 'Chiều đi' : 'Chiều về') : null
    return (
      <div className="mb-4 last:mb-0">
        {label && (
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${tripIdx === 0 ? 'bg-[#8C1D19]' : 'bg-blue-500'}`} />
            {label}
          </h3>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                {['Họ và tên', 'Loại vé', 'Chỗ ngồi', 'Mã vé', 'Giá vé'].map(h => (
                  <th key={h} className={`px-4 py-2.5 font-semibold text-gray-600 text-left ${h === 'Giá vé' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((v, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{v.fullName}</td>
                  <td className="px-4 py-2.5">
                    {(() => {
                      const pInfo = getPassengerInfo(mapLoaiHKToType(v.loaiHanhKhach))
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pInfo.color}`}>
                          {pInfo.label}{pInfo.discount > 0 ? ` (-${Math.round(pInfo.discount*100)}%)` : ''}
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">Toa {v.soToa} · Chỗ {v.soGhe}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-700">{v.idVe || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#8C1D19]">{fmt(v.giaVe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-[#8C1D19] px-5 py-3.5 flex justify-between items-center flex-wrap gap-3">
        <button onClick={onBack} className="text-white/80 hover:text-white text-sm flex items-center gap-2 transition-colors">
          <FaArrowLeft /> Tìm kiếm lại
        </button>
        <div className="flex gap-2">
          {isPaid ? (
            <>
              <button onClick={handlePrint} className="text-white/80 hover:text-white text-xs flex items-center gap-1.5 px-3 py-1.5 border border-white/30 rounded-lg">
                <FaPrint /> In vé
              </button>
              <button onClick={handlePrint} className="text-white/80 hover:text-white text-xs flex items-center gap-1.5 px-3 py-1.5 border border-white/30 rounded-lg">
                <FaDownload /> Tải về
              </button>
            </>
          ) : canContinue && (
            <button onClick={handleContinuePayment}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ff8a00] text-white text-xs font-bold rounded-lg hover:bg-[#e07a00]">
              <FaCreditCard /> Tiếp tục thanh toán
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">

        {/* ── Banner trạng thái ── */}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 flex gap-3 items-start">
            <FaCircleCheck className="text-green-500 text-lg shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Đặt chỗ đã thanh toán thành công</p>
              <p className="text-xs text-green-700 mt-0.5">Vui lòng xuất trình CCCD/Hộ chiếu khi lên tàu.</p>
            </div>
          </div>
        )}
        {canContinue && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex gap-3 items-start">
            <FaCircleExclamation className="text-amber-500 text-lg shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">Đặt chỗ đang chờ thanh toán</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Ghế đang được giữ tạm.{expiresAt && (
                  <span className="font-semibold"> Hết hạn lúc {new Date(expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.</span>
                )}
              </p>
              <button onClick={handleContinuePayment}
                className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-[#ff8a00] text-white text-xs font-bold rounded-lg hover:bg-[#e07a00]">
                <FaCreditCard /> Tiếp tục thanh toán
              </button>
            </div>
          </div>
        )}

        {/* ════ 1. THÔNG TIN ĐẶT CHỖ ════ */}
        <div>
          <h2 className="text-base font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-3 uppercase tracking-wide">Thông tin đặt chỗ</h2>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500 font-medium w-2/5">Mã đặt chỗ</td>
                  <td className="px-4 py-3 font-extrabold text-[#8C1D19] tracking-widest text-base">{bookingCode}</td>
                </tr>
                {customer?.email && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-500 font-medium">Email</td>
                    <td className="px-4 py-3 text-gray-800">{customer.email}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500 font-medium">Ngày đặt chỗ</td>
                  <td className="px-4 py-3 text-gray-800">{bookingDate}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-500 font-medium">Trạng thái đặt chỗ</td>
                  <td className="px-4 py-3"><Badge status={bookingStatus} /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-500 font-medium">Trạng thái thanh toán</td>
                  <td className="px-4 py-3"><Badge status={paymentStatus} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ════ 2. THÔNG TIN HÀNH KHÁCH ════ */}
        {veList.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-3 uppercase tracking-wide">Thông tin hành khách</h2>
            {tripGroups.map((tickets, tripIdx) => (
              <TripPassengerTable key={tripIdx} tickets={tickets} tripIdx={tripIdx} />
            ))}
          </div>
        )}

        {/* ════ 3. THÔNG TIN HÀNH TRÌNH ════ */}
        {veList.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-3 uppercase tracking-wide">Thông tin hành trình</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    {['Chiều', 'Ga đi', 'Ga đến', 'Ngày đi', 'Giờ đi', 'Toa'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tripGroups.map((tickets, i) => {
                    const t = tickets[0]
                    return (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold ${i === 0 ? 'text-[#8C1D19]' : 'text-blue-600'}`}>
                            {i === 0 ? 'Đi' : 'Về'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-800">{t?.gaDi || '--'}</td>
                        <td className="px-4 py-2.5 text-gray-800">{t?.gaDen || '--'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{t?.departDate || '--'}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{t?.departTime || '--'}</td>
                        <td className="px-4 py-2.5 text-gray-600">{t?.soToa || '--'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ Footer ════ */}
        <div className="border-t border-gray-100 pt-4 flex justify-between items-end flex-wrap gap-4">
          <p className="text-xs text-gray-500">* Vui lòng xuất trình CMND/CCCD khi lên tàu</p>
          <div className="text-right text-sm space-y-0.5">
            {(serviceFee || 0) > 0 && (
              <>
                <p className="text-gray-600">Giá vé: <span className="font-medium text-gray-800">{fmt(ticketPrice > 0 ? ticketPrice : totalPrice)}</span></p>
                <p className="text-gray-600">Phí dịch vụ: <span className="font-medium text-gray-800">+{fmt(serviceFee)}</span></p>
              </>
            )}
            <p className="text-sm font-semibold text-gray-700 mt-1">Tổng thanh toán</p>
            <p className="text-2xl font-extrabold text-[#8C1D19]">{fmt(totalPrice || 0)}</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default BookingResult
