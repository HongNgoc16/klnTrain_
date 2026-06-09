// pages/ticketSearch/SeatSelection.jsx
import React, { useMemo, useRef, useEffect, useCallback } from 'react'
import { FaChevronRight, FaXmark } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../../utils/dateUtils'

// Sơ đồ ghế theo đúng mẫu
const seatRows = [
  [1, 8, 9, 16, 17, 24, 25, 32, 'aisle', 33, 40, 41, 48, 49, 56],
  [2, 7, 10, 15, 18, 23, 26, 31, 'aisle', 34, 39, 42, 47, 50, 55],
  ['space'],
  [3, 6, 11, 14, 19, 22, 27, 30, 'aisle', 35, 38, 43, 46, 51, 54],
  [4, 5, 12, 13, 20, 21, 28, 29, 'aisle', 36, 37, 44, 45, 52, 53]
]

// Hàm tạo ghế với trạng thái
const createSeats = (sold = [], held = []) =>
  Array.from({ length: 56 }, (_, index) => {
    const number = index + 1
    return {
      number,
      price: number % 7 === 0 ? 1127 : 1107,
      status: sold.includes(number) ? 'sold' : held.includes(number) ? 'held' : 'empty'
    }
  })

// Dữ liệu ghế cho từng toa
const seatsData = {
  4: createSeats([1, 2, 6, 7, 8, 11, 12, 17, 18, 24, 30, 36, 40, 41, 48, 49], [16, 23, 31]),
  3: createSeats([1, 2, 3, 4, 9, 10, 14, 15, 19, 20, 25, 29, 30, 33, 34, 38], [22, 27]),
  2: createSeats([1, 2, 6, 7, 10, 15, 18, 25, 30, 37, 42, 43, 50], [8, 23, 28, 32]),
  1: createSeats([1, 2, 7, 8, 10, 15, 17, 18, 25, 31, 40, 44, 45, 52], [24, 32, 56])
}

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

// Tab toa tàu (thu nhỏ)
const CoachTab = ({ coach, active, onClick }) => (
  <button onClick={onClick} className={`min-w-[280px] rounded-sm border bg-white px-3 py-2 text-left shadow-md transition-all ${
    active ? 'border-[#8C1D19]/70 border-t-4' : 'border-neutral-200 border-t-4 border-t-neutral-300'
  }`}>
    <p className="text-sm font-medium text-neutral-800 line-clamp-1">{coach.name}</p>
    <p className="mt-0.5 text-xs text-neutral-500">Còn {coach.availableSeats} chỗ | {coach.priceRange}</p>
  </button>
)

// Nút ghế (nhỏ gọn)
const SeatButton = ({ seat, selected, onClick }) => {
  const isSold = seat.status === 'sold'
  const isHeld = seat.status === 'held'
  const isUnavailable = isSold || isHeld
  const statusClass = selected
    ? 'border-[#8C1D19] bg-white text-[#8C1D19] ring-1 ring-[#8C1D19]'
    : isSold   ? 'border-[#cfd5da] bg-[#e8eef4] text-transparent'
    : isHeld   ? 'border-[#e8a100] bg-[#fff3cd] text-transparent cursor-not-allowed'
    : 'border-[#cfd5da] bg-white text-neutral-700 hover:border-[#8C1D19]'

  return (
    <button
      type="button"
      disabled={isUnavailable}
      onClick={(e) => {
        e.preventDefault()
        onClick(seat)
      }}
      className={`relative h-[42px] w-[38px] rounded-md border text-center transition-colors ${statusClass}`}
    >
      {!isUnavailable && (
        <>
          <span className="block text-xs font-bold leading-4">{seat.number}</span>
          <span className="block text-[10px] leading-3">{seat.price}k</span>
        </>
      )}
      <span className="absolute -top-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
      <span className="absolute -bottom-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
    </button>
  )
}

// Legend (nhỏ gọn)
const SeatLegend = ({ bgColor, borderColor, label, textColor = 'text-neutral-700' }) => (
  <div className="flex items-center gap-1.5 text-xs">
    <span className={`h-3 w-3 rounded-sm border ${bgColor} ${borderColor}`} />
    <span className={textColor}>{label}</span>
  </div>
)

const SeatSelection = ({ fromStation, toStation, departureDate, train, selectedCoach, selectedSeats, passengers, onBack, onCoachChange, onSeatClick }) => {
  const navigate = useNavigate() // THÊM DÒNG NÀY
  const scrollPositionRef = useRef(0)
  const isChangingCoach = useRef(false)

  // Thêm dữ liệu ghế vào coaches
  const coachesWithSeats = train.coaches.map(coach => ({
    ...coach,
    seats: seatsData[coach.id] || createSeats()
  }))
  
  const currentCoach = coachesWithSeats.find(c => c.id === selectedCoach.id) || coachesWithSeats[0]

  const saveScrollPosition = useCallback(() => {
    scrollPositionRef.current = window.scrollY
  }, [])

  useEffect(() => {
    if (!isChangingCoach.current && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current)
      scrollPositionRef.current = 0
    }
    isChangingCoach.current = false
  }, [selectedSeats.length, currentCoach.id])

  const handleSeatClick = useCallback((seat) => {
    saveScrollPosition()
    onSeatClick(seat)
  }, [onSeatClick, saveScrollPosition])

  const handleCoachChange = useCallback((coach) => {
    isChangingCoach.current = true
    onCoachChange(coach)
  }, [onCoachChange])

  // Tính tổng tiền
  const totalPrice = selectedSeats.reduce((sum, seatNum) => {
    const seat = currentCoach.seats.find(s => s.number === seatNum)
    return sum + (seat ? seat.price * 1000 : 0)
  }, 0)

  // Hàm xử lý đặt vé
  const handleBooking = () => {
    if (selectedSeats.length !== passengers) {
      alert(`Vui lòng chọn đủ ${passengers} ghế`)
      return
    }

    navigate('/checkout', {
      state: {
        train: {
          code: train.code,
          type: train.type,
          fromStation: fromStation,
          toStation: toStation,
          departTime: train.departTime,
          arriveTime: train.arriveTime,
          departDate: train.departDate,
          arriveDate: train.arriveDate,
          duration: train.duration
        },
        coach: {
          id: currentCoach.id,
          number: currentCoach.id,
          name: currentCoach.name
        },
        seats: selectedSeats,
        passengers: passengers,
        fromStation: fromStation,
        toStation: toStation,
        departureDate: departureDate,
        totalPrice: totalPrice
      }
    })
  }

  return (
    <section className="bg-white shadow-lg rounded-lg overflow-hidden max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 bg-neutral-50">
        <p className="text-sm text-neutral-700">{fromStation} → {toStation} | {formatDate(departureDate)}</p>
        <p className="text-lg font-bold text-neutral-800">{train.type} {train.code}</p>
        <button onClick={onBack} className="text-2xl text-neutral-400 hover:text-[#8C1D19]"><FaXmark /></button>
      </div>

      {/* Danh sách toa */}
      <div className="overflow-x-auto px-3 pt-2">
        <div className="flex items-stretch gap-2 min-w-[800px]">
          {coachesWithSeats.map((coach) => (
            <CoachTab 
              key={coach.id} 
              coach={coach} 
              active={coach.id === currentCoach.id} 
              onClick={() => handleCoachChange(coach)} 
            />
          ))}
          <div className="flex min-w-[60px] items-center justify-center"><div className="h-8 w-12 rounded-r-2xl bg-[#eef3f7]" /></div>
        </div>
      </div>

      <div className="mx-auto mt-1 h-px w-64 rounded-full bg-neutral-300" />

      {/* Sơ đồ ghế */}
      <div className="overflow-x-auto px-2 py-2">
        <div className="min-w-[850px]">
          <h3 className="text-center text-sm font-bold text-neutral-800 mb-2">{currentCoach.name}</h3>
          <div className="space-y-1.5">
            {seatRows.map((row, rowIndex) =>
              row[0] === 'space' ? <div key="space" className="h-2" /> : (
                <div key={rowIndex} className="flex justify-center gap-1.5">
                  {row.map((item, idx) => {
                    if (item === 'aisle') return <div key={`aisle-${idx}`} className="w-[38px] flex items-center justify-center text-[10px] text-neutral-400">Bàn</div>
                    const seat = currentCoach.seats.find(s => s.number === item)
                    if (!seat) return <div key={`empty-${item}`} className="w-[38px]" />
                    return <SeatButton key={item} seat={seat} selected={selectedSeats.includes(seat.number)} onClick={handleSeatClick} />
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 grid gap-3 px-4 pb-4 lg:grid-cols-[240px_1fr] lg:items-end">
        <div className="rounded-md border border-[#8C1D19] p-2">
          <p className="text-xs font-bold text-neutral-700">
            {passengers > 1 ? `${passengers} người lớn` : 'Người lớn'}
          </p>
          <p className="text-xs text-neutral-600">
            {selectedSeats.length ? `Ghế ${selectedSeats.join(', ')}` : 'Chưa chọn'}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-3">
            <SeatLegend bgColor="bg-white" borderColor="border-neutral-300" label="Chỗ trống" />
            <SeatLegend bgColor="bg-[#e8eef4]" borderColor="border-neutral-300" label="Chỗ đã bán" />
            <SeatLegend bgColor="bg-[#fff3cd]" borderColor="border-[#e8a100]" label="Đang giữ" />
            <SeatLegend bgColor="bg-white" borderColor="border-[#8C1D19]" label="Đang chọn" textColor="text-[#8C1D19]" />
          </div>

          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
            <div className="text-right">
              <p className="text-xs text-neutral-600">
                Đã chọn: <span className="font-bold">{selectedSeats.length}/{passengers} chỗ</span>
              </p>
              {selectedSeats.length > 0 && (
                <p className="text-xs text-[#ff8a00] font-semibold">Tổng: {formatPrice(totalPrice)}</p>
              )}
              {!selectedSeats.length && (
                <p className="text-xs text-[#ff8a00]">Vui lòng chọn chỗ trống</p>
              )}
            </div>
            
            <button
              onClick={handleBooking}
              disabled={selectedSeats.length !== passengers}
              className={`h-10 min-w-[200px] rounded-md px-4 text-sm font-bold flex items-center justify-center gap-1 transition ${
                selectedSeats.length === passengers
                  ? 'bg-[#ff8a00] text-white hover:bg-[#f47c00] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Đặt vé <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SeatSelection