// pages/checkout/Checkout.jsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCreditCard, FaUser, FaPhone, FaEnvelope, FaCalendar, FaIdCard } from 'react-icons/fa6'
import RootLayout from '../../layout/RootLayout'
import { formatDate as formatDisplayDate } from '../../utils/dateUtils'

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 4) return cleaned
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`
}

const capitalizeName = (name) => {
  if (!name) return ''
  return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const CHILD_DISCOUNT = 0.75

const Checkout = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state || !state.trips) navigate('/tim-ve')
  }, [state, navigate])

  const { trips, totalPassengers, adultTickets = 1, childTickets = 0, tripType } = state || {}

  const departureTrip = trips?.[0]
  const returnTrip = trips?.[1]
  const isRoundTrip = tripType === 'round-trip'

  // Total price from passengerSeats (already includes child discount)
  const totalPrice = trips?.reduce((sum, trip) => sum + (trip.totalPrice || 0), 0) || 0
  const serviceFee = isRoundTrip ? 40000 : 20000
  const totalAmount = totalPrice + serviceFee

  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', needInvoice: false })
  const [passengers, setPassengers] = useState(
    Array(totalPassengers || 1).fill(null).map(() => ({ fullName: '', birthDate: '', idCard: '' }))
  )
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatBirthDate = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
  }

  const validatePhone = (phone) => /^(0[1-9][0-9]{8,9})$/.test(phone.replace(/\s/g, ''))
  const validateEmail = (email) => /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)
  const validateIdCard = (idCard) => /^[0-9]{9,12}$/.test(idCard.replace(/\s/g, ''))

  const handleContactChange = (field, value) => {
    if (field === 'phone') value = formatPhoneNumber(value)
    setContactInfo(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handlePassengerChange = (index, field, value) => {
    if (field === 'birthDate') value = formatBirthDate(value)
    if (field === 'fullName') value = capitalizeName(value)
    const newPassengers = [...passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    setPassengers(newPassengers)
    if (errors[`${field}_${index}`]) setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!contactInfo.phone) newErrors.phone = 'Số điện thoại không được để trống'
    else if (!validatePhone(contactInfo.phone)) newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912 345 678)'
    if (!contactInfo.email) newErrors.email = 'Email không được để trống'
    else if (!validateEmail(contactInfo.email)) newErrors.email = 'Email không hợp lệ'

    passengers.forEach((passenger, idx) => {
      if (!passenger.fullName.trim()) newErrors[`fullName_${idx}`] = 'Họ và tên không được để trống'
      else if (passenger.fullName.trim().length < 3) newErrors[`fullName_${idx}`] = 'Họ và tên phải có ít nhất 3 ký tự'
      if (!passenger.birthDate) newErrors[`birthDate_${idx}`] = 'Ngày sinh không được để trống'
      else {
        const [d, m, y] = passenger.birthDate.split('/')
        if (!d || !m || !y || parseInt(d) > 31 || parseInt(m) > 12 || parseInt(y) < 1900 || parseInt(y) > new Date().getFullYear())
          newErrors[`birthDate_${idx}`] = 'Ngày sinh không hợp lệ (DD/MM/YYYY)'
      }
      if (passenger.idCard && !validateIdCard(passenger.idCard)) newErrors[`idCard_${idx}`] = 'CCCD/Passport không hợp lệ (9-12 số)'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const bookingCode = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const orderCode = 'KLN' + String(Math.floor(100000 + Math.random() * 900000))

    navigate('/thanh-toan', {
      state: {
        bookingCode,
        orderCode,
        totalAmount,
        trips,
        totalPassengers,
        adultTickets,
        childTickets,
        tripType,
        contactInfo,
        passengersInfo: passengers.map((p, idx) => ({
          ...p,
          type: idx >= adultTickets ? 'child' : 'adult',
          isChild: idx >= adultTickets
        }))
      }
    })
  }

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
    <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[14ch]">
      <div className="container mx-auto px-4 max-w-6xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-5">
                <h1 className="text-2xl font-bold text-[#8C1D19]">Thông tin đặt vé</h1>
                <p className="text-gray-500 text-sm">{isRoundTrip ? 'Vé khứ hồi' : 'Vé một chiều'} · {totalPassengers} hành khách</p>
              </div>

              {/* Thông tin liên hệ */}
              <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-bold border-l-4 border-[#8C1D19] pl-3 mb-4">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" value={contactInfo.phone} onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="Nhập số điện thoại"
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
                  const isChild = idx >= adultTickets
                  const adultNum = isChild ? null : idx + 1
                  const childNum = isChild ? idx - adultTickets + 1 : null
                  const depSeat = departureTrip?.passengerSeats?.[idx]
                  const retSeat = returnTrip?.passengerSeats?.[idx]
                  const depPrice = depSeat?.seatPrice || 0
                  const retPrice = retSeat?.seatPrice || 0

                  return (
                    <div key={idx} className={idx > 0 ? 'border-t pt-5 mt-5' : ''}>
                      {/* Header hành khách */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="font-semibold text-gray-800">
                          {isChild ? `Trẻ em${childTickets > 1 ? ` ${childNum}` : ''}` : `Người lớn${adultTickets > 1 ? ` ${adultNum}` : ''}`}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isChild ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isChild ? 'Trẻ em (6–9 tuổi) · -25%' : 'Người lớn (từ 10 tuổi)'}
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

                        <div className="relative">
                          <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={passenger.birthDate}
                            onChange={(e) => handlePassengerChange(idx, 'birthDate', e.target.value)}
                            placeholder="dd/mm/yyyy" maxLength={10}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors[`birthDate_${idx}`] ? 'border-red-500' : 'border-gray-300'}`} />
                        </div>
                        {errors[`birthDate_${idx}`] && <p className="text-red-500 text-xs">{errors[`birthDate_${idx}`]}</p>}

                        {!isChild && (
                          <div className="relative">
                            <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={passenger.idCard}
                              onChange={(e) => handlePassengerChange(idx, 'idCard', e.target.value)}
                              placeholder="CCCD/Passport (tùy chọn)"
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg ${errors[`idCard_${idx}`] ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors[`idCard_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`idCard_${idx}`]}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => navigate(-1)} className="text-gray-600">← Quay lại</button>
                <button type="submit" disabled={isSubmitting}
                  className="px-8 py-3 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] disabled:bg-gray-400 flex items-center gap-2">
                  {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                  {!isSubmitting && <FaCreditCard />}
                </button>
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
