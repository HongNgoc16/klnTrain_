// pages/exchangeTicket/exchangeResult/ExchangeResult.jsx
import React, { useState } from 'react'
import { FaArrowLeft, FaCircleXmark, FaTriangleExclamation } from 'react-icons/fa6'
// Kiểm tra còn đủ ≥24h trước giờ tàu chạy không
// departDate: "DD/MM/YYYY", departTime: "HH:MM"
const isEligible = (departDate, departTime) => {
  if (!departDate || !departTime) return false
  const parts = departDate.split('/')
  if (parts.length !== 3) return false
  const [dd, mm, yyyy] = parts
  // Giờ khởi hành là giờ Việt Nam → thêm +07:00
  const departAt = new Date(`${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${departTime.slice(0,5)}:00+07:00`)
  if (isNaN(departAt.getTime())) return false
  return (departAt.getTime() - Date.now()) / (1000 * 60 * 60) >= 24
}

const calcFee = (price) => Math.max(20000, Math.floor(price * 0.05))

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const ExchangeResult = ({ booking, error, onBack, onSelect }) => {
  const [chosen, setChosen] = useState(null)

  if (error) return (
    <div className="max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5">
        <FaArrowLeft /> Quay lại tra cứu
      </button>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FaCircleXmark className="text-red-500 text-5xl mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy đơn đặt vé</h3>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={onBack} className="px-5 py-2 bg-[#8C1D19] text-white rounded-lg text-sm">Thử lại</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5">
        <FaArrowLeft /> Quay lại tra cứu
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#8C1D19]">Đổi vé tàu</h2>
            <p className="text-sm text-gray-500">Chọn vé muốn đổi (chỉ đổi được 1 vé mỗi lần)</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Mã đặt chỗ</p>
            <p className="text-lg font-bold text-[#8C1D19]">{booking.bookingCode}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
          <span>Đặt ngày: <strong>{booking.bookingDate}</strong></span>
        </div>
      </div>

      {/* Danh sách chuyến */}
      {booking.trips?.map(trip => {
        const eligible = isEligible(trip.departDate, trip.departTime)
        return (
          <div key={trip.tripId} className="bg-white rounded-lg shadow-md p-5 mb-4">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100 flex-wrap gap-2">
              <div>
                <p className="font-bold">{trip.trainName || `${trip.trainType} ${trip.trainCode}`}</p>
                <p className="text-sm text-gray-500">{trip.fromStation} → {trip.toStation}</p>
                <p className="text-xs text-gray-400 mt-0.5">{trip.coachName}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{trip.departTime} · {trip.departDate}</p>
                {trip.arriveDate && <p className="text-xs text-gray-400">→ Đến {trip.arriveDate}</p>}
              </div>
            </div>

            {!eligible && (
              <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-3">
                <FaTriangleExclamation className="shrink-0" />
                <span>Không đủ điều kiện đổi — tàu khởi hành trong vòng 24 giờ</span>
              </div>
            )}

            <div className="space-y-3">
              {trip.passengers?.map(p => {
                const key = `${trip.tripId}_${p.id}`
                const isSelected = chosen?.key === key
                const fee = calcFee(p.price)
                return (
                  <label key={p.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      eligible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${isSelected ? 'border-[#8C1D19] bg-[#8C1D19]/5' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" name="chosenTicket" checked={isSelected}
                        onChange={() => eligible && setChosen({ key, trip, passenger: p })}
                        disabled={!eligible}
                        className="accent-[#8C1D19] w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{p.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {p.idCard && `CCCD: ${p.idCard} · `}Ghế {p.seat}
                          {p.type === 'child'   && <span className="ml-1 px-1 bg-green-100  text-green-700  rounded text-[10px]">Trẻ em</span>}
                          {p.type === 'elderly' && <span className="ml-1 px-1 bg-purple-100 text-purple-700 rounded text-[10px]">Người cao tuổi</span>}
                          {p.type === 'student' && <span className="ml-1 px-1 bg-teal-100   text-teal-700   rounded text-[10px]">Sinh viên</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm ml-3 shrink-0">
                      <p className="font-semibold text-gray-700">{fmt(p.price)}</p>
                      {eligible && <p className="text-xs text-amber-600">Phí đổi: {fmt(fee)}</p>}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{chosen ? `Đã chọn: ${chosen.passenger.fullName}` : 'Chưa chọn vé nào'}</p>
        <button onClick={() => chosen && onSelect(chosen)} disabled={!chosen}
          className="px-6 py-2.5 bg-[#8C1D19] text-white rounded-lg font-semibold hover:bg-[#7a1916] disabled:bg-gray-300">
          Chọn chuyến mới →
        </button>
      </div>
    </div>
  )
}

export default ExchangeResult
