// pages/exchangeTicket/exchangeSelect/ExchangeSelect.jsx
// Chọn chuyến mới để đổi: ngày mới → danh sách tàu → sơ đồ toa/ghế
// Tái sử dụng cấu trúc SEAT_ROWS và seatsData từ data/trains.js
import React, { useState } from 'react'
import { FaArrowLeft, FaArrowRightLong, FaTrain } from 'react-icons/fa6'
import { FaCalendarAlt } from 'react-icons/fa'
import { searchTrains } from '../../../data/trains'
import { formatDate as fmtDate } from '../../../utils/dateUtils'

const fmt  = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'
const fmtK = (price) => Math.round(price / 1000) + 'k'

// Layout sơ đồ ghế (ngồi mềm, 5 hàng × 15 cột — chuẩn toa khách ĐSVN)
const SEAT_ROWS = [
  [1, 8, 9, 16, 17, 24, 25, 32, 'aisle', 33, 40, 41, 48, 49, 56],
  [2, 7, 10, 15, 18, 23, 26, 31, 'aisle', 34, 39, 42, 47, 50, 55],
  ['space'],
  [3, 6, 11, 14, 19, 22, 27, 30, 'aisle', 35, 38, 43, 46, 51, 54],
  [4, 5, 12, 13, 20, 21, 28, 29, 'aisle', 36, 37, 44, 45, 52, 53],
]

// ── Nút ghế ──────────────────────────────────────────────────────────────────
const SeatButton = ({ seat, selected, onSelect }) => {
  if (!seat) return <div className="w-9 h-9" />
  const isSold = seat.status === 'sold'
  const isHeld = seat.status === 'held'
  const isUnavailable = isSold || isHeld
  const cls = selected
    ? 'border-[#8C1D19] bg-white text-[#8C1D19] ring-1 ring-[#8C1D19]'
    : isSold  ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
    : isHeld  ? 'border-[#e8a100] bg-[#fff3cd] cursor-not-allowed'
    : 'border-gray-300 bg-white hover:border-[#8C1D19] cursor-pointer'
  return (
    <button
      disabled={isUnavailable}
      onClick={() => !isUnavailable && onSelect(seat)}
      className={`relative w-9 h-9 rounded-md border text-center transition-all ${cls}`}
    >
      {!isUnavailable && (
        <>
          <div className="text-[11px] font-bold leading-tight">{seat.number}</div>
          <div className="text-[9px] leading-tight text-gray-500">{fmtK(seat.price * 1000)}</div>
        </>
      )}
      <div className="absolute -top-1 left-1/2 w-3 h-1 -translate-x-1/2 rounded border border-gray-200 bg-white" />
      <div className="absolute -bottom-1 left-1/2 w-3 h-1 -translate-x-1/2 rounded border border-gray-200 bg-white" />
    </button>
  )
}

// ── Sơ đồ toa + ghế ──────────────────────────────────────────────────────────
const SeatMap = ({ train, selectedCoach, selectedSeat, onCoachChange, onSeatSelect, onConfirm, onBack }) => {
  const coachSeats = selectedCoach.seats || []
  const totalPrice = selectedSeat
    ? (coachSeats.find(s => s.number === selectedSeat)?.price ?? 0) * 1000
    : 0

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
        <button onClick={onBack} className="text-gray-500 hover:text-[#8C1D19] text-sm">
          ← Chọn tàu khác
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">{train.code} · {train.fromStation} → {train.toStation}</p>
          <p className="text-xs text-gray-500">{train.departTime} — {train.duration}</p>
        </div>
        <div className="w-24" />
      </div>

      {/* Tab chọn toa */}
      <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1">
        {train.coaches.map(c => (
          <button
            key={c.id}
            onClick={() => onCoachChange(c)}
            className={`min-w-[160px] rounded-t-lg border px-3 py-2 text-left text-sm shrink-0 transition-colors ${
              selectedCoach.id === c.id
                ? 'border-[#8C1D19] border-t-4 bg-white'
                : 'border-gray-200 border-t-4 border-t-gray-300 bg-gray-50 hover:bg-white'
            }`}
          >
            <div className="font-medium text-xs truncate">{c.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">Còn {c.availableSeats} chỗ · {c.priceRange}</div>
          </button>
        ))}
      </div>

      {/* Sơ đồ ghế */}
      <div className="overflow-x-auto p-4">
        <div className="min-w-[700px]">
          <p className="text-center font-bold text-sm mb-3 text-gray-700">{selectedCoach.name}</p>
          <div className="space-y-1.5">
            {SEAT_ROWS.map((row, i) => {
              if (row[0] === 'space') return <div key={i} className="h-2" />
              return (
                <div key={i} className="flex justify-center gap-1.5">
                  {row.map((item, j) => {
                    if (item === 'aisle') return (
                      <div key={j} className="w-9 flex items-center justify-center text-[10px] text-gray-400">Bàn</div>
                    )
                    const seat = coachSeats.find(s => s.number === item)
                    return (
                      <SeatButton
                        key={j}
                        seat={seat}
                        selected={selectedSeat === item}
                        onSelect={onSeatSelect}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3 flex flex-wrap justify-between items-center gap-3 bg-gray-50">
        {/* Chú giải */}
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-300 bg-white inline-block" />Trống</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-300 bg-gray-100 inline-block" />Đã bán</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-[#e8a100] bg-[#fff3cd] inline-block" />Đang giữ</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-[#8C1D19] bg-white inline-block" />Đang chọn</span>
        </div>

        {/* Thông tin + nút xác nhận */}
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            {selectedSeat
              ? <><p>Ghế <strong>{selectedSeat}</strong></p><p className="text-[#ff8a00] font-semibold">{fmt(totalPrice)}</p></>
              : <p className="text-gray-400">Chưa chọn ghế</p>
            }
          </div>
          <button
            onClick={() => selectedSeat && onConfirm(selectedSeat, totalPrice)}
            disabled={!selectedSeat}
            className={`px-5 py-2 rounded-md font-semibold text-sm transition-colors ${
              selectedSeat
                ? 'bg-[#ff8a00] text-white hover:bg-[#e07a00]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Xác nhận ghế →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Component chính ───────────────────────────────────────────────────────────
const ExchangeSelect = ({ chosenTicket, onBack, onContinue }) => {
  const [newDate, setNewDate]           = useState('')
  const [mode, setMode]                 = useState('list')   // 'list' | 'seats'
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [selectedSeat, setSelectedSeat]   = useState(null)   // number | null

  const { trip: oldTrip, passenger: oldPassenger } = chosenTicket
  const today = new Date().toISOString().split('T')[0]

  // Lấy tàu cùng tuyến từ data/trains.js
  const availableTrains = newDate
    ? searchTrains(oldTrip.fromStation, oldTrip.toStation)
    : []

  const handleSelectTrain = (train) => {
    setSelectedTrain(train)
    setSelectedCoach(train.coaches[0])
    setSelectedSeat(null)
    setMode('seats')
  }

  const handleCoachChange = (coach) => {
    setSelectedCoach(coach)
    setSelectedSeat(null)
  }

  const handleSeatSelect = (seat) => {
    setSelectedSeat(prev => prev === seat.number ? null : seat.number)
  }

  const handleConfirmSeat = (seatNumber, seatPrice) => {
    onContinue({
      train: { ...selectedTrain, departDate: newDate },
      coach: selectedCoach,
      seatNumber,
      seatPrice,
      newDate
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5 transition-colors">
        <FaArrowLeft /> Quay lại chọn vé
      </button>

      {/* Vé cũ — ghim ở trên */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vé hiện tại cần đổi</p>
        <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 text-sm">
          <div>
            <p className="font-semibold">{oldPassenger.fullName}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {oldTrip.trainCode} · {oldTrip.fromStation} → {oldTrip.toStation}
            </p>
            <p className="text-gray-500 text-xs">
              {oldTrip.departDate} {oldTrip.departTime} · Toa {oldTrip.coachNumber} · Ghế {oldPassenger.seat}
            </p>
          </div>
          <p className="font-bold text-gray-700">{fmt(oldPassenger.price)}</p>
        </div>
      </div>

      {/* Chọn ngày mới */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h3 className="font-bold text-gray-800 border-l-4 border-[#ff8a00] pl-3 mb-4">
          Bước 1: Chọn ngày đi mới
        </h3>
        <div className="relative max-w-xs">
          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={newDate}
            min={today}
            onChange={e => { setNewDate(e.target.value); setMode('list'); setSelectedTrain(null); setSelectedSeat(null) }}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30"
          />
        </div>
        {newDate && (
          <p className="text-sm text-gray-500 mt-2">
            Tuyến: <strong>{oldTrip.fromStation} → {oldTrip.toStation}</strong> ngày <strong>{fmtDate(newDate)}</strong>
          </p>
        )}
      </div>

      {/* Danh sách tàu */}
      {newDate && mode === 'list' && (
        <div className="bg-white rounded-lg shadow-md p-5 mb-4">
          <h3 className="font-bold text-gray-800 border-l-4 border-[#ff8a00] pl-3 mb-4">
            Bước 2: Chọn chuyến tàu mới
          </h3>
          {availableTrains.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Không có chuyến tàu cho tuyến {oldTrip.fromStation} → {oldTrip.toStation}
            </p>
          ) : (
            <div className="space-y-3">
              {availableTrains.map(train => {
                const diff = train.priceFrom - oldPassenger.price
                return (
                  <div key={train.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-wrap sm:grid sm:grid-cols-5 gap-3 items-center hover:border-[#8C1D19]/40 transition-colors">
                    {/* Mã tàu */}
                    <div>
                      <p className="text-xs text-gray-500">{train.type}</p>
                      <p className="text-xl font-bold">{train.code}</p>
                      <p className="text-xs mt-1 inline-block px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full">
                        Còn {train.availableSeats} chỗ
                      </p>
                    </div>
                    {/* Ga đi */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{train.fromStation}</p>
                      <p className="text-xl font-bold">{train.departTime}</p>
                      <p className="text-xs text-gray-400">{fmtDate(newDate)}</p>
                    </div>
                    {/* Thời gian */}
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-400">{train.duration}</p>
                      <FaArrowRightLong className="text-gray-400 mt-1" />
                    </div>
                    {/* Ga đến */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{train.toStation}</p>
                      <p className="text-xl font-bold">{train.arriveTime}</p>
                    </div>
                    {/* Giá + nút */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Từ</p>
                      <p className="text-base font-bold">{fmt(train.priceFrom)}</p>
                      {diff > 0 && <p className="text-xs text-red-500">+{fmt(diff)} so với vé cũ</p>}
                      {diff < 0 && <p className="text-xs text-green-600">Rẻ hơn {fmt(-diff)}</p>}
                      {diff === 0 && <p className="text-xs text-gray-400">Cùng giá</p>}
                      <button
                        onClick={() => handleSelectTrain(train)}
                        className="mt-2 px-4 py-1.5 bg-[#8C1D19] text-white rounded-md text-sm hover:bg-[#ff8a00] transition-colors">
                        Chọn toa / ghế
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Sơ đồ toa/ghế */}
      {mode === 'seats' && selectedTrain && (
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 border-l-4 border-[#ff8a00] pl-3 mb-4">
            Bước 3: Chọn toa và ghế
          </h3>
          <SeatMap
            train={selectedTrain}
            selectedCoach={selectedCoach}
            selectedSeat={selectedSeat}
            onCoachChange={handleCoachChange}
            onSeatSelect={handleSeatSelect}
            onConfirm={handleConfirmSeat}
            onBack={() => { setMode('list'); setSelectedTrain(null); setSelectedSeat(null) }}
          />
        </div>
      )}
    </div>
  )
}

export default ExchangeSelect
