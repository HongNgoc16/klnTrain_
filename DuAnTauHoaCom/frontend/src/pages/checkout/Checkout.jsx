// pages/checkout/Checkout.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCreditCard, FaUser, FaPhone, FaEnvelope, FaCalendar, FaIdCard, FaClock } from 'react-icons/fa6'
import RootLayout from '../../layout/RootLayout'
import { formatDate as formatDisplayDate } from '../../utils/dateUtils'
import { createBooking, releaseHold } from '../../api/bookings'
import { validatePassengerAge, getPassengerInfo, calcAge } from '../../utils/passengerUtils'

/* ── Birth Date Input (uncontrolled) ──────────────────────────────
   KHÔNG dùng value prop — React không can thiệp vào cursor.
   Thao tác DOM trực tiếp: el.value + el.setSelectionRange → cursor luôn đúng.
   1→"1" | 18→"18/" | 18/0→"18/0" | 18/08/→... | 18/08/2005
*/
const BirthDateInput = ({ value, onChangeDate, hasError }) => {
  const inputRef  = useRef(null)
  const digitsRef = useRef('')   // source of truth: chỉ lưu các chữ số

  const buildDisplay = (d, addTrail) => {
    if (d.length > 4) return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`
    if (d.length > 2) return `${d.slice(0,2)}/${d.slice(2)}`
    if (d.length === 2 && addTrail) return `${d}/`
    return d
  }

  const applyToDOM = (display) => {
    const el = inputRef.current
    if (!el) return
    el.value = display
    el.setSelectionRange(display.length, display.length)
  }

  // Khởi tạo / reset khi parent thay đổi value
  useEffect(() => {
    const d = (value || '').replace(/\D/g, '').slice(0, 8)
    digitsRef.current = d
    applyToDOM(buildDisplay(d, false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleChange = (e) => {
    const newDigits = e.target.value.replace(/\D/g, '').slice(0, 8)
    const isAdding  = newDigits.length > digitsRef.current.length
    digitsRef.current = newDigits

    const display = buildDisplay(newDigits, isAdding)
    applyToDOM(display)

    onChangeDate(
      newDigits.length === 8
        ? `${newDigits.slice(0,2)}/${newDigits.slice(2,4)}/${newDigits.slice(4,8)}`
        : newDigits.length === 0 ? '' : display
    )
  }

  return (
    <div className={`flex items-center h-11 w-full rounded-lg border px-3 transition-colors
      ${hasError
        ? 'border-red-500'
        : 'border-gray-300 focus-within:border-[#8C1D19] focus-within:ring-2 focus-within:ring-[#8C1D19]/20'
      }`}>
      <FaCalendar className="h-3.5 w-3.5 text-gray-400 mr-2.5 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        maxLength={10}
        onChange={handleChange}
        className="w-full border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 appearance-none text-sm text-neutral-900 placeholder:text-gray-400 bg-transparent"
      />
    </div>
  )
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const capitalizeName = (name) => {
  if (!name) return ''
  return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const getPassengerTypeInfo = (type) => getPassengerInfo(type)

const Checkout = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state || !state.trips) navigate('/tim-ve')
  }, [state, navigate])

  const {
    trips, totalPassengers,
    adultTickets = 1, childTickets = 0,
    elderlyTickets = 0, studentTickets = 0,
    tripType, hetHan,
  } = state || {}

  // Countdown từ lúc giữ ghế (hetHan là thời điểm hết hạn)
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!hetHan) return null
    const ms = new Date(hetHan).getTime() - Date.now()
    return ms > 0 ? Math.floor(ms / 1000) : 0
  })
  const [holdExpired, setHoldExpired] = useState(false)

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { setHoldExpired(true); return }
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(id); setHoldExpired(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])   // chỉ chạy 1 lần khi mount

  const formatCountdown = (s) => {
    if (s === null) return null
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  const departureTrip = trips?.[0]
  const returnTrip = trips?.[1]
  const isRoundTrip = tripType === 'round-trip'

  // Total price from passengerSeats (already includes child discount)
  const totalPrice = trips?.reduce((sum, trip) => sum + (trip.totalPrice || 0), 0) || 0
  const serviceFee = isRoundTrip ? 40000 : 20000
  const totalAmount = totalPrice + serviceFee

  // Đánh dấu đã navigate đi (submit hoặc chủ động quay lại) — cleanup sẽ không giải phóng lại
  const releasedRef = React.useRef(false)

  // Giải phóng tất cả ghế đang giữ rồi navigate đi
  const releaseAndGo = async (delta = -1) => {
    if (releasedRef.current) { navigate(delta); return }
    releasedRef.current = true
    const sessionIds = trips?.map(t => t.sessionId).filter(Boolean) || []
    await Promise.allSettled(sessionIds.map(sid => releaseHold(sid)))
    navigate(delta)
  }

  // Fallback: nếu người dùng dùng nút Back của trình duyệt / Navbar / đóng tab
  useEffect(() => {
    return () => {
      if (!releasedRef.current) {
        const sessionIds = trips?.map(t => t.sessionId).filter(Boolean) || []
        sessionIds.forEach(sid => releaseHold(sid).catch(() => {}))
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', needInvoice: false })
  const [passengers, setPassengers] = useState(
    Array(totalPassengers || 1).fill(null).map(() => ({ fullName: '', birthDate: '', idCard: '' }))
  )
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  const validatePhone = (phone) => /^0[0-9]{9}$/.test(phone)
  const validateEmail = (email) => /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)
  const validateIdCard = (idCard) => /^[0-9]{12}$/.test(idCard)

  const handleContactChange = (field, value) => {
    if (field === 'phone') value = value.replace(/\D/g, '').slice(0, 10)
    setContactInfo(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handlePassengerChange = (index, field, value) => {
    if (field === 'idCard')   value = value.replace(/\D/g, '').slice(0, 12)
    if (field === 'fullName') value = capitalizeName(value)
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setPassengers(newPassengers)
    if (errors[`${field}_${index}`]) setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }))
  }

  // Handler riêng cho BirthDateInput (không cần format, component tự quản lý)
  const handleBirthDateChange = (index, value) => {
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], birthDate: value }
    setPassengers(newPassengers)
    if (errors[`birthDate_${index}`]) setErrors(prev => ({ ...prev, [`birthDate_${index}`]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!contactInfo.phone) newErrors.phone = 'Số điện thoại không được để trống'
    else if (!validatePhone(contactInfo.phone)) newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'
    if (!contactInfo.email) newErrors.email = 'Email không được để trống'
    else if (!validateEmail(contactInfo.email)) newErrors.email = 'Email không hợp lệ'

    passengers.forEach((passenger, idx) => {
      if (!passenger.fullName.trim()) newErrors[`fullName_${idx}`] = 'Họ và tên không được để trống'
      else if (passenger.fullName.trim().length < 3) newErrors[`fullName_${idx}`] = 'Họ và tên phải có ít nhất 3 ký tự'

      if (!passenger.birthDate) {
        newErrors[`birthDate_${idx}`] = 'Ngày sinh không được để trống'
      } else {
        const parts = passenger.birthDate.split('/')
        if (parts.length === 3 && passenger.birthDate.length === 10) {
          const [d, m, y] = parts.map(Number)
          if (!d || !m || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
            newErrors[`birthDate_${idx}`] = 'Ngày sinh không hợp lệ'
          } else {
            // Kiểm tra tuổi có khớp với loại hành khách đã chọn
            const seat    = allSeats[idx]
            const pType   = seat?.passengerType || (idx >= adultTickets ? 'child' : 'adult')
            const ageErr  = validatePassengerAge(passenger.birthDate, pType)
            if (ageErr) newErrors[`birthDate_${idx}`] = ageErr
          }
        } else {
          newErrors[`birthDate_${idx}`] = 'Ngày sinh không hợp lệ (định dạng DD/MM/YYYY)'
        }
      }

      if (passenger.idCard && !validateIdCard(passenger.idCard)) newErrors[`idCard_${idx}`] = 'CCCD không hợp lệ (phải đủ 12 số)'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Chuyển DD/MM/YYYY → YYYY-MM-DD cho API
  const toIsoDate = (dateStr) => {
    if (!dateStr) return null
    const [d, m, y] = dateStr.split('/')
    if (!d || !m || !y) return null
    return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      // Chuẩn bị dữ liệu hành khách — dùng passengerType từ seat data
      const passengersPayload = passengers.map((p, idx) => {
        const seat  = allSeats[idx]
        const pType = seat?.passengerType || (idx >= adultTickets ? 'child' : 'adult')
        return {
          hoTen:     p.fullName.trim(),
          ngaySinh:  toIsoDate(p.birthDate),
          cccd:      p.idCard?.trim() || null,
          isChild:   pType === 'child',
          isElderly: pType === 'elderly',
          isStudent: pType === 'student',
          passengerType: pType,
        }
      })

      // Chuẩn bị dữ liệu chuyến
      const tripsPayload = trips.map(trip => ({
        idChuyen:  trip.idChuyen,
        idGaLen:   trip.idGaLen,
        idGaXuong: trip.idGaXuong,
        sessionId: trip.sessionId || null,
        passengerSeats: trip.passengerSeats.map(ps => ({
          seatNumber:    ps.seatNumber,
          soToaThuTu:    ps.soToaThuTu ?? ps.coachId,
          seatPrice:     ps.seatPrice,
          isChild:       ps.isChild,
          isElderly:     ps.isElderly    || false,
          isStudent:     ps.isStudent    || false,
          passengerType: ps.passengerType || (ps.isChild ? 'child' : 'adult'),
        })),
      }))

      const res = await createBooking({
        trips:       tripsPayload,
        passengers:  passengersPayload,
        contactInfo: {
          hoTen: passengers[0]?.fullName?.trim() || '',
          phone: contactInfo.phone,
          email: contactInfo.email.trim(),
        },
      })

      const { maDatCho, maDon, idDon, tongThanhToan } = res.data || res

      releasedRef.current = true   // đánh dấu đã xử lý — cleanup không giải phóng lại
      navigate('/thanh-toan', {
        state: {
          bookingCode:  maDatCho,
          orderCode:    maDon,
          idDon,
          totalAmount:  tongThanhToan ?? totalAmount,
          trips,
          totalPassengers,
          adultTickets,
          childTickets,
          tripType,
          contactInfo,
          passengersInfo: passengers.map((p, idx) => {
            const seat  = allSeats[idx]
            const pType = seat?.passengerType || (idx >= adultTickets ? 'child' : 'adult')
            return {
              ...p,
              type:          pType,
              isChild:       pType === 'child',
              isElderly:     pType === 'elderly',
              isStudent:     pType === 'student',
              passengerType: pType,
            }
          }),
        }
      })
    } catch (err) {
      setBookingError(err.message || 'Lỗi đặt vé, vui lòng thử lại')
      setIsSubmitting(false)
    }
  }

  // Tất cả ghế theo thứ tự: dep[0..N1-1] → ret[0..N2-1] (sequential)
  const allSeats = (trips || []).flatMap(t => t.passengerSeats || [])

  const getSeatLabel = (coachType) => coachType === 'NMCLC' ? 'Ghế' : 'Giường'

  const TripInfo = ({ trip, title, isReturn = false }) => {
    if (!trip) return null
    const departDate = trip.departDate || trip.train?.departDate
    const arriveDate = trip.arriveDate || trip.train?.arriveDate
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${isReturn ? 'mt-3' : ''}`}>
        <div className={`text-sm font-bold mb-2 ${isReturn ? 'text-blue-600' : 'text-[#8C1D19]'}`}>{title}</div>
        <div className="flex justify-between items-center text-sm flex-wrap gap-2">
          <div className="text-center">
            <p className="text-xl font-bold">{trip.departTime || '--:--'}</p>
            <p className="text-gray-600">{trip.fromStation || '--'}</p>
            <p className="text-xs text-gray-400">{formatDisplayDate(departDate)}</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <p className="text-xl font-bold">{trip.arriveTime || '--:--'}</p>
            <p className="text-gray-600">{trip.toStation || '--'}</p>
            <p className="text-xs text-gray-400">{formatDisplayDate(arriveDate)}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{trip.train?.code || '--'}</p>
            <p className="text-xs text-gray-500">{trip.coach?.name || '--'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
      <div className="container mx-auto px-4 max-w-6xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-5">
                <h1 className="text-2xl font-bold text-[#8C1D19]">Thông tin đặt vé</h1>
                <p className="text-gray-500 text-sm">{isRoundTrip ? 'Vé khứ hồi' : 'Vé một chiều'} · {totalPassengers} hành khách</p>
                {timeLeft !== null && (
                  <div className={`mt-2 flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-1.5 w-fit ${
                    holdExpired ? 'bg-red-100 text-red-700' : timeLeft <= 120 ? 'bg-orange-100 text-orange-700' : 'bg-green-50 text-green-700'
                  }`}>
                    <FaClock className="h-3 w-3" />
                    {holdExpired
                      ? 'Hết thời gian giữ chỗ — vui lòng chọn lại ghế'
                      : `Chỗ được giữ trong: ${formatCountdown(timeLeft)}`
                    }
                  </div>
                )}
              </div>

              {/* Thông tin liên hệ */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-bold border-l-4 border-[#8C1D19] pl-3 mb-4">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" inputMode="numeric" value={contactInfo.phone} onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="0912345678" maxLength={10}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={contactInfo.email} onChange={(e) => handleContactChange('email', e.target.value)}
                        placeholder="Nhập email nhận vé"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Thông tin hành khách */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-bold border-l-4 border-[#8C1D19] pl-3 mb-4">Thông tin hành khách</h2>

                {passengers.map((passenger, idx) => {
                  // Lấy passenger type từ seat data (ưu tiên) hoặc tính theo vị trí
                  const seatInfo  = allSeats[idx]
                  const pType     = seatInfo?.passengerType || (idx >= adultTickets ? 'child' : 'adult')
                  const isChild   = pType === 'child'
                  const typeInfo  = getPassengerTypeInfo(pType)

                  // Tính số thứ tự trong nhóm (VD: "Người lớn 2", "Trẻ em 1")
                  const countInType = allSeats.slice(0, idx).filter(s =>
                    (s?.passengerType || 'adult') === pType
                  ).length + 1
                  const totalOfType = allSeats.filter(s =>
                    (s?.passengerType || 'adult') === pType
                  ).length
                  const labelWithNum = totalOfType > 1
                    ? `${typeInfo.label} ${countInType}`
                    : typeInfo.label

                  // Tìm ghế tương ứng theo sequential: dep ghế 0..N1-1, ret ghế N1..N1+N2-1
                  const depCount  = departureTrip?.passengerSeats?.length || 0
                  const depSeat   = idx < depCount ? departureTrip?.passengerSeats?.[idx] : null
                  const retSeat   = idx >= depCount ? returnTrip?.passengerSeats?.[idx - depCount] : null
                  const depPrice  = depSeat?.seatPrice || 0
                  const retPrice  = retSeat?.seatPrice || 0

                  return (
                    <div key={idx} className={idx > 0 ? 'border-t pt-5 mt-5' : ''}>
                      {/* Header hành khách */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="font-semibold text-gray-800">{labelWithNum}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                          {typeInfo.sub}{typeInfo.discount > 0 ? ` · -${Math.round(typeInfo.discount * 100)}%` : ''}
                        </span>
                      </div>

                      {/* Thông tin chỗ ngồi */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm space-y-1">
                        {depSeat && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Chiều đi · Toa {depSeat.coachId} - {getSeatLabel(depSeat.coachType)} {depSeat.seatNumber}</span>
                            <span className="font-semibold text-[#8C1D19]">{formatPrice(depPrice)}</span>
                          </div>
                        )}
                        {retSeat && isRoundTrip && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Chiều về · Toa {retSeat.coachId} - {getSeatLabel(retSeat.coachType)} {retSeat.seatNumber}</span>
                            <span className="font-semibold text-[#8C1D19]">{formatPrice(retPrice)}</span>
                          </div>
                        )}
                        {(depPrice + (isRoundTrip ? retPrice : 0)) > 0 && (
                          <div className="flex justify-between border-t pt-1 mt-1">
                            <span className="text-gray-600 font-medium">Tổng hành khách này</span>
                            <span className="font-bold text-[#ff8a00]">{formatPrice(depPrice + (isRoundTrip ? retPrice : 0))}</span>
                          </div>
                        )}
                      </div>

                      {/* Form nhập thông tin */}
                      <div className="space-y-3">
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={passenger.fullName}
                            onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                            placeholder="Họ và tên"
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors[`fullName_${idx}`] ? 'border-red-500' : 'border-gray-300'}`} />
                        </div>
                        {errors[`fullName_${idx}`] && <p className="text-red-500 text-xs">{errors[`fullName_${idx}`]}</p>}

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <BirthDateInput
                              value={passenger.birthDate}
                              onChangeDate={(v) => handleBirthDateChange(idx, v)}
                              hasError={!!errors[`birthDate_${idx}`]}
                            />
                          </div>
                          {/* Hiện tuổi realtime khi nhập đủ DD/MM/YYYY */}
                          {passenger.birthDate?.length === 10 && (() => {
                            const age = calcAge(passenger.birthDate)
                            if (age === null) return null
                            const ageErr = validatePassengerAge(passenger.birthDate, pType)
                            return (
                              <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                ageErr
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                              }`}>
                                {age} tuổi
                              </span>
                            )
                          })()}
                        </div>
                        {errors[`birthDate_${idx}`] && <p className="text-red-500 text-xs">{errors[`birthDate_${idx}`]}</p>}

                        {!isChild && (
                          <div className="relative">
                            <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={passenger.idCard}
                              onChange={(e) => handlePassengerChange(idx, 'idCard', e.target.value)}
                              placeholder="Số CCCD (12 số, tùy chọn)"
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors[`idCard_${idx}`] ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors[`idCard_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`idCard_${idx}`]}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {bookingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {bookingError}
                </div>
              )}
              <div className="flex justify-between">
                <button type="button" onClick={() => releaseAndGo(-1)} className="text-gray-600">← Quay lại</button>
                <button type="submit" disabled={isSubmitting || holdExpired}
                  className="px-8 py-3 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] disabled:bg-gray-400 flex items-center gap-2">
                  {holdExpired ? 'Hết hạn giữ chỗ' : isSubmitting ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                  {!isSubmitting && !holdExpired && <FaCreditCard />}
                </button>
                {holdExpired && (
                  <button type="button" onClick={() => releaseAndGo(-2)}
                    className="px-6 py-3 border border-[#8C1D19] text-[#8C1D19] rounded-lg font-semibold hover:bg-[#8C1D19]/5">
                    ← Chọn lại ghế
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold mb-3">CHUYẾN TÀU</h3>
                <TripInfo trip={departureTrip} title="CHIỀU ĐI" />
                {returnTrip && <TripInfo trip={returnTrip} title="CHIỀU VỀ" isReturn={true} />}
              </div>

              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold mb-3">CHI TIẾT THANH TOÁN</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Giá vé ({totalPassengers} khách)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>· {adultTickets} người lớn</span>
                  </div>
                  {childTickets > 0 && (
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>· {childTickets} trẻ em (giảm 25%)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Phí dịch vụ</span>
                    <span className="text-[#ff8a00]">+ {formatPrice(serviceFee)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Tổng tiền</span>
                    <span className="text-[#ff8a00]">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg shadow-md p-4 text-sm text-blue-700">
                <p>✉️ Vé điện tử sẽ gửi qua email sau khi thanh toán</p>
                <p className="mt-2">📞 Hotline: 1900 2087</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </RootLayout>
  )
}

export default Checkout
