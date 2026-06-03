// pages/exchangeTicket/exchangeConfirm/ExchangeConfirm.jsx
// Xác nhận đổi vé — gọi trực tiếp API exchangeTicket
import React, { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { formatDate as fmtDate } from '../../../utils/dateUtils'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'
const calcFee = (price) => Math.max(20000, Math.floor(price * 0.05))

const ExchangeConfirm = ({ booking, chosenTicket, newSelection, onBack, onExchange }) => {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)

  const { trip: oldTrip, passenger: oldPassenger } = chosenTicket
  const { train: newTrain, coach: newCoach, seatNumber, seatPrice, newDate } = newSelection

  const exchangeFee  = calcFee(oldPassenger.price)
  const priceDiff    = seatPrice - oldPassenger.price
  const totalPayable = priceDiff > 0 ? exchangeFee + priceDiff : exchangeFee

  const handleConfirm = async () => {
    setError(null)
    setConfirming(true)
    try {
      await onExchange(chosenTicket.passenger.id, {
        idChuyen:  newTrain.idChuyen,
        soToa:     newCoach.id,
        soGhe:     seatNumber,
        idGaLen:   newTrain.gaDiId,
        idGaXuong: newTrain.gaDenId,
        giaVeMoi:  seatPrice,
      })
    } catch (err) {
      setError(err.message || 'Đổi vé thất bại. Vui lòng thử lại.')
      setConfirming(false)
    }
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
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Vé cũ (sẽ hủy)</p>
            <p className="font-semibold text-sm">{oldPassenger.fullName}</p>
            <p className="text-xs text-gray-500 mt-1">{oldTrip.trainCode}</p>
            <p className="text-xs text-gray-500">{oldTrip.fromStation} → {oldTrip.toStation}</p>
            <p className="text-xs text-gray-500">{oldTrip.departDate} {oldTrip.departTime}</p>
            <p className="text-xs text-gray-500">Toa {oldTrip.coachNumber} · Ghế {oldPassenger.seat}</p>
            <p className="text-sm font-bold text-gray-700 mt-2">{fmt(oldPassenger.price)}</p>
          </div>

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
            <span>Tổng phí cần thanh toán</span>
            <span className="text-[#ff8a00] text-lg">{fmt(totalPayable)}</span>
          </div>
        </div>

        {/* Lưu ý */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 mb-6 space-y-1">
          <p className="font-semibold text-sm mb-1.5">Lưu ý quan trọng:</p>
          <p>• Sau khi xác nhận, vé cũ bị hủy và vé mới sẽ được phát hành ngay</p>
          <p>• Mỗi vé chỉ được đổi <strong>01 lần duy nhất</strong></p>
          {priceDiff < 0 && <p>• Vé mới rẻ hơn <strong>{fmt(-priceDiff)}</strong> — khoản này <strong>không được hoàn lại</strong></p>}
          <p>• Email xác nhận gửi về: <strong>{booking.contactEmail}</strong></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onBack} disabled={confirming}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Quay lại
          </button>
          <button onClick={handleConfirm} disabled={confirming}
            className="flex-1 py-2.5 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] disabled:opacity-60 transition-colors">
            {confirming ? 'Đang xử lý...' : `Xác nhận đổi vé · ${fmt(totalPayable)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExchangeConfirm
