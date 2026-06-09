// pages/cancelTicket/cancelResult/CancelResult.jsx
import React, { useState } from 'react'
import { FaArrowLeft, FaCircleXmark, FaTriangleExclamation } from 'react-icons/fa6'
import { calculateRefund } from '../../../data/bookingMock'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const CancelResult = ({ booking, error, onBack, onContinue }) => {
  const [selected, setSelected] = useState([])

  const toggle = (key) =>
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const handleNext = () => {
    if (!selected.length) { alert('Vui lòng chọn ít nhất một vé cần hủy'); return }
    onContinue(selected)
  }

  if (error) return (
    <div className="max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5">
        <FaArrowLeft /> Quay lại tra cứu
      </button>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FaCircleXmark className="text-red-500 text-5xl mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy đơn đặt vé</h3>
        <p className="text-gray-500 text-sm">{error}</p>
        <button onClick={onBack} className="mt-4 px-5 py-2 bg-[#8C1D19] text-white rounded-lg text-sm">Thử lại</button>
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
            <h2 className="text-lg font-bold text-[#8C1D19]">Hủy vé tàu</h2>
            <p className="text-sm text-gray-500">Tích chọn vé cần hủy bên dưới</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Mã đặt chỗ</p>
            <p className="text-lg font-bold text-[#8C1D19]">{booking.bookingCode}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
          <span>Đặt ngày: <strong>{booking.bookingDate}</strong></span>
          {booking.contactPhone && <span>Liên hệ: <strong>{booking.contactPhone}</strong></span>}
        </div>
      </div>

      {/* Danh sách chuyến */}
      {booking.trips?.map(trip => {
        const policy = calculateRefund(trip.departDate, trip.departTime)
        return (
          <div key={trip.tripId} className="bg-white rounded-lg shadow-md p-5 mb-4">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100 flex-wrap gap-2">
              <div>
                <p className="font-bold text-base">{trip.trainName || `${trip.trainType} ${trip.trainCode}`}</p>
                <p className="text-sm text-gray-500">{trip.fromStation} → {trip.toStation}</p>
                <p className="text-xs text-gray-400 mt-0.5">{trip.coachName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{trip.departTime}</p>
                <p className="text-sm text-gray-600">{trip.departDate}</p>
                {trip.arriveDate && <p className="text-xs text-gray-400">→ Đến {trip.arriveDate}</p>}
              </div>
            </div>

            <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg mb-4 ${
              policy.canAct ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <FaTriangleExclamation className="mt-0.5 shrink-0" />
              <span>
                <strong>Chính sách áp dụng:</strong> {policy.label}
                {policy.canAct && <span className="ml-1">— Phí hủy: <strong>{(policy.feeRate * 100).toFixed(0)}%</strong></span>}
              </span>
            </div>

            <div className="space-y-3">
              {trip.passengers?.map(p => {
                const key = `${trip.tripId}_${p.id}`
                const isChecked = selected.includes(key)
                const refundAmt = Math.round(p.price * policy.refundRate)
                return (
                  <label key={p.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      policy.canAct ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } ${isChecked ? 'border-[#8C1D19] bg-[#8C1D19]/5' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isChecked}
                        onChange={() => policy.canAct && toggle(key)}
                        disabled={!policy.canAct}
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
                      <p className="text-gray-400 line-through text-xs">{fmt(p.price)}</p>
                      {policy.canAct
                        ? <p className="font-semibold text-green-600">Hoàn: {fmt(refundAmt)}</p>
                        : <p className="font-semibold text-red-500">Không hoàn</p>
                      }
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{selected.length ? `Đã chọn ${selected.length} vé` : 'Chưa chọn vé nào'}</p>
        <button onClick={handleNext} disabled={!selected.length}
          className="px-6 py-2.5 bg-[#8C1D19] text-white rounded-lg font-semibold hover:bg-[#7a1916] disabled:bg-gray-300">
          Tiếp tục →
        </button>
      </div>
    </div>
  )
}

export default CancelResult
