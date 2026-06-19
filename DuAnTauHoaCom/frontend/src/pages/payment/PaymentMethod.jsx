// pages/payment/PaymentMethod.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaQrcode, FaCreditCard, FaWallet, FaBuilding, FaUser } from 'react-icons/fa6'
import RootLayout from '../../layout/RootLayout'
import { formatDate as formatDisplayDate } from '../../utils/dateUtils'

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const PaymentMethod = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  
  const scrollPositionRef = useRef(0)
  const timerRef = useRef(null)

  // Dữ liệu từ Checkout
  const bookingData = state || {}

  const trips = bookingData.trips
  const isRoundTrip = bookingData.tripType === 'round-trip' && trips?.length === 2
  const totalAmount = bookingData.totalAmount || 0
  const orderCode = bookingData.orderCode
  const bookingCode = bookingData.bookingCode || orderCode
  const passengers = bookingData.passengersInfo || []
  const totalPassengers = passengers.length

  // Lấy chuyến đầu để hiển thị tóm tắt
  const firstTrip = trips?.[0]

  const [selectedMethod, setSelectedMethod] = useState('qr')
  const [timeLeft, setTimeLeft] = useState(15 * 60)

  useEffect(() => {
    const saveScroll = () => {
      scrollPositionRef.current = window.scrollY
    }
    window.addEventListener('scroll', saveScroll)
    return () => window.removeEventListener('scroll', saveScroll)
  }, [])

  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current)
  })

  useEffect(() => {
    if (timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const methods = [
    { id: 'qr', name: 'Chuyển khoản QR', icon: <FaQrcode />, desc: 'Quét mã QR - Miễn phí', fee: 0 },
    { id: 'credit', name: 'Thẻ tín dụng', icon: <FaCreditCard />, desc: 'Visa, Master, JCB', fee: 28000 },
    { id: 'momo', name: 'Ví MoMo', icon: <FaWallet />, desc: 'Thanh toán qua MoMo', fee: 14600 },
    { id: 'atm', name: 'Thẻ ATM nội địa', icon: <FaBuilding />, desc: 'Chuyển khoản ATM', fee: 14100 }
  ]

  const feeAmount = methods.find(m => m.id === selectedMethod)?.fee || 0
  const grandTotal = totalAmount + feeAmount

  const handleConfirm = () => {
    navigate('/thanh-toan/qr', {
      state: { ...bookingData, totalAmount: grandTotal, phuongThuc: selectedMethod, paymentFee: feeAmount },
    })
  }

  // Component hiển thị 1 chuyến tàu (tóm tắt)
  const TripCard = ({ trip, title, isReturn = false }) => {
    if (!trip) return null
    
    const seatText = trip.seats?.length > 1 ? `Ghế ${trip.seats.join(', ')}` : `Ghế ${trip.seats?.[0] || '--'}`
    
    return (
      <div className={`border rounded-lg p-3 ${isReturn ? 'mt-3' : ''}`}>
        <div className={`text-xs font-bold mb-1 ${isReturn ? 'text-blue-600' : 'text-[#8C1D19]'}`}>
          {title}
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <div className="font-bold">{trip.departTime || '--:--'}</div>
            <div className="text-xs text-gray-600">{trip.fromStation || '--'}</div>
            <div className="text-xs text-gray-400">{formatDisplayDate(trip.departDate || trip.train?.departDate)}</div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-center">
            <div className="font-bold">{trip.arriveTime || '--:--'}</div>
            <div className="text-xs text-gray-600">{trip.toStation || '--'}</div>
            <div className="text-xs text-gray-400">{formatDisplayDate(trip.arriveDate || trip.train?.arriveDate)}</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-semibold">{trip.train?.code || '--'}</div>
            <div className="text-gray-500">Toa {trip.coach?.number || '--'}</div>
            <div className="text-gray-500">{seatText}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-4">
          <FaArrowLeft /> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[#8C1D19]">Thanh toán</h1>
                  <p className="text-gray-500">Đặt vé tàu {isRoundTrip ? 'khứ hồi' : 'một chiều'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Mã đặt chỗ</p>
                  <p className="text-lg font-bold text-[#8C1D19]">{bookingCode}</p>
                  <p className="text-xs text-gray-400">Mã đơn: {orderCode}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <FaClock className="text-[#ff8a00]" />
                <span>Thời gian thanh toán:</span>
                <span className="text-2xl font-bold text-[#ff8a00]">{formatTimeLeft()}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5">
              <h2 className="text-lg font-bold mb-4">Chọn hình thức thanh toán</h2>
              {methods.map((m) => (
                <label key={m.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer mb-3 ${
                  selectedMethod === m.id ? 'border-[#8C1D19] bg-[#8C1D19]/5' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" checked={selectedMethod === m.id} onChange={() => setSelectedMethod(m.id)} className="accent-[#8C1D19]" />
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-[#8C1D19]">{m.icon}</div>
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.desc}</p>
                    </div>
                  </div>
                  {m.fee > 0 && <span className="text-[#ff8a00]">+{formatPrice(m.fee)}</span>}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-5 text-center">
              <p className="text-gray-500">Xác nhận thanh toán</p>
              <p className="text-3xl font-bold text-[#ff8a00]">{formatPrice(grandTotal)}</p>
              <button onClick={handleConfirm} className="w-full mt-4 py-3 bg-[#ff8a00] text-white rounded-lg font-bold hover:bg-[#e07a00]">
                Xác nhận thanh toán
              </button>
            </div>

            {/* Thông tin chuyến tàu - hiển thị cả chiều đi và chiều về */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="font-bold mb-3">Thông tin chuyến tàu</h3>
              {isRoundTrip && trips ? (
                <>
                  <TripCard trip={trips[0]} title="CHUYẾN ĐI" />
                  <TripCard trip={trips[1]} title="CHUYẾN VỀ" isReturn={true} />
                  <div className="text-sm text-gray-500 mt-2">{totalPassengers} hành khách - Khứ hồi</div>
                </>
              ) : (
                <>
                  <TripCard trip={firstTrip} title="CHUYẾN ĐI" />
                  <div className="text-sm text-gray-500 mt-2">{totalPassengers} hành khách - Một chiều</div>
                </>
              )}
            </div>

            {/* Thông tin hành khách */}
            {passengers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <FaUser className="text-[#8C1D19]" /> Hành khách
                </h3>
                <div className="space-y-3">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="border-b pb-2 last:border-b-0">
                      <p className="font-medium text-sm">{p.fullName || `Hành khách ${idx + 1}`}</p>
                      <p className="text-xs text-gray-500">
                        Ngày sinh: {p.birthDate || '--'} | {p.idCard || 'Chưa có CCCD'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chi tiết giá */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="font-bold mb-3">Chi tiết giá</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Giá vé ({totalPassengers} khách x {isRoundTrip ? 2 : 1} chiều)</span>
                  <span>{formatPrice(totalAmount - (totalPassengers * (isRoundTrip ? 44000 : 22000)))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí bảo hiểm</span>
                  <span>{formatPrice(totalPassengers * (isRoundTrip ? 4000 : 2000))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí dịch vụ</span>
                  <span>{formatPrice(totalPassengers * (isRoundTrip ? 40000 : 20000))}</span>
                </div>
                {feeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Phí thanh toán ({methods.find(m => m.id === selectedMethod)?.name})</span>
                    <span>{formatPrice(feeAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-[#ff8a00]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  )
}

export default PaymentMethod