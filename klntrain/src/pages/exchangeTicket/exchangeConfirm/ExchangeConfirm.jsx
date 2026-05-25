// pages/exchangeTicket/exchangeConfirm/ExchangeConfirm.jsx
// Xem chi phí đổi vé và chuyển sang trang thanh toán /thanh-toan
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { calculateExchangeFee } from '../../../data/bookingMock'
import { formatDate as fmtDate } from '../../../utils/dateUtils'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const ExchangeConfirm = ({ booking, chosenTicket, newSelection, onBack }) => {
  const navigate = useNavigate()
  const { trip: oldTrip, passenger: oldPassenger } = chosenTicket
  const { train: newTrain, coach: newCoach, seatNumber, seatPrice, newDate } = newSelection

  const exchangeFee = calculateExchangeFee(oldPassenger.price)
  const priceDiff   = seatPrice - oldPassenger.price
  // Phí đổi + chênh lệch (nếu vé mới đắt hơn). Nếu rẻ hơn chỉ tính phí đổi.
  const totalPayable = priceDiff > 0 ? exchangeFee + priceDiff : exchangeFee

  const handleGoPayment = () => {
    const orderCode = 'DOI' + Date.now()
    navigate('/thanh-toan', {
      state: {
        orderCode,
        totalAmount: totalPayable,
        tripType: 'one-way',
        totalPassengers: 1,
        // Cấu trúc trips tương thích với PaymentMethod / QRPayment
        trips: [{
          fromStation: newTrain.fromStation,
          toStation:   newTrain.toStation,
          departTime:  newTrain.departTime,
          arriveTime:  newTrain.arriveTime,
          departDate:  newDate,
          arriveDate:  newTrain.arriveDate,
          duration:    newTrain.duration,
          train:  { code: newTrain.code, type: newTrain.type },
          coach:  { number: newCoach.id, name: newCoach.name },
          seats:  [seatNumber],
          totalPrice: totalPayable
        }],
        passengersInfo: [{
          fullName:  oldPassenger.fullName,
          birthDate: oldPassenger.birthDate,
          idCard:    oldPassenger.idCard
        }],
        contactInfo: {
          email: booking.contactEmail,
          phone: booking.contactPhone
        },
        // Truyền thêm context để PaymentSuccess nhận biết đây là đổi vé
        isExchange: true,
        exchangeInfo: {
          bookingCode: booking.bookingCode,
          oldTrain:     oldTrip.trainCode,
          oldRoute:    `${oldTrip.fromStation} → ${oldTrip.toStation}`,
          oldDate:      oldTrip.departDate,
          oldTime:      oldTrip.departTime,
          oldCoach:     oldTrip.coachNumber,
          oldSeat:      oldPassenger.seat,
          oldPrice:     oldPassenger.price
        }
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5 transition-colors">
        <FaArrowLeft /> Quay lại chọn ghế
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h2 className="text-lg font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-5">
          Xác nhận đổi vé
        </h2>

        {/* So sánh vé cũ — vé mới */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Vé cũ */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Vé cũ (sẽ hủy)</p>
            <p className="font-semibold text-sm">{oldPassenger.fullName}</p>
            <p className="text-xs text-gray-500 mt-1">{oldTrip.trainCode}</p>
            <p className="text-xs text-gray-500">{oldTrip.fromStation} → {oldTrip.toStation}</p>
            <p className="text-xs text-gray-500">{oldTrip.departDate} {oldTrip.departTime}</p>
            <p className="text-xs text-gray-500">Toa {oldTrip.coachNumber} · Ghế {oldPassenger.seat}</p>
            <p className="text-sm font-bold text-gray-700 mt-2">{fmt(oldPassenger.price)}</p>
          </div>

          {/* Vé mới */}
          <div className="border-2 border-[#8C1D19] rounded-lg p-4 bg-[#8C1D19]/5">
            <p className="text-[10px] font-bold text-[#8C1D19] uppercase tracking-wide mb-2">Vé mới</p>
            <p className="font-semibold text-sm">{oldPassenger.fullName}</p>
            <p className="text-xs text-gray-500 mt-1">{newTrain.code}</p>
            <p className="text-xs text-gray-500">{newTrain.fromStation} → {newTrain.toStation}</p>
            <p className="text-xs text-gray-500">{fmtDate(newDate)} {newTrain.departTime}</p>
            <p className="text-xs text-gray-500">Toa {newCoach.id} · Ghế {seatNumber}</p>
            <p className="text-sm font-bold text-[#8C1D19] mt-2">{fmt(seatPrice)}</p>
          </div>
        </div>

        {/* Chi phí đổi vé */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2 text-sm">
          <p className="font-semibold text-gray-700 mb-1">Chi phí đổi vé:</p>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí đổi vé (5%, tối thiểu 20.000đ)</span>
            <span className="font-medium">{fmt(exchangeFee)}</span>
          </div>
          {priceDiff > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Chênh lệch giá vé mới cao hơn</span>
              <span className="font-medium text-red-500">+{fmt(priceDiff)}</span>
            </div>
          )}
          {priceDiff < 0 && (
            <div className="flex justify-between text-xs text-gray-400 italic">
              <span>Vé mới rẻ hơn — chênh lệch không được hoàn</span>
              <span>{fmt(-priceDiff)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base">
            <span>Tổng cần thanh toán</span>
            <span className="text-[#ff8a00] text-lg">{fmt(totalPayable)}</span>
          </div>
        </div>

        {/* Lưu ý */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 mb-6 space-y-1">
          <p className="font-semibold text-sm mb-1.5">Lưu ý quan trọng:</p>
          <p>• Sau khi thanh toán phí, vé cũ bị hủy và vé mới sẽ được phát hành ngay</p>
          <p>• Mỗi vé chỉ được đổi <strong>01 lần duy nhất</strong></p>
          {priceDiff < 0 && <p>• Vé mới rẻ hơn <strong>{fmt(-priceDiff)}</strong> — khoản này <strong>không được hoàn lại</strong></p>}
          <p>• Email xác nhận gửi về: <strong>{booking.contactEmail}</strong></p>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            Quay lại
          </button>
          <button onClick={handleGoPayment}
            className="flex-1 py-2.5 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] transition-colors">
            Thanh toán {fmt(totalPayable)} →
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExchangeConfirm
