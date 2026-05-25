// pages/ticketSearch/trainSelection/TrainSelection.jsx
import React, { useState, useEffect } from 'react'
import { FaArrowRightLong, FaTrain, FaXmark, FaChevronRight } from 'react-icons/fa6'
import { searchTrains, COACH_TYPE } from '../../../data/trains'
import { formatDate as formatDisplayDate } from '../../../utils/dateUtils'

const seatRows = [
  [1, 8, 9, 16, 17, 24, 25, 32, 'aisle', 33, 40, 41, 48, 49, 56],
  [2, 7, 10, 15, 18, 23, 26, 31, 'aisle', 34, 39, 42, 47, 50, 55],
  ['space'],
  [3, 6, 11, 14, 19, 22, 27, 30, 'aisle', 35, 38, 43, 46, 51, 54],
  [4, 5, 12, 13, 20, 21, 28, 29, 'aisle', 36, 37, 44, 45, 52, 53],
]

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ'

// ─── Nút ghế ngồi mềm ───────────────────────────────────────────
const SeatBtn = ({ seat, selected, onSelect }) => {
  if (!seat) return <div className="w-[38px] h-[42px]" />
  const isSold = seat.status === 'sold'
  const isHeld = seat.status === 'held'
  const disabled = isSold || isHeld
  const cls = selected
    ? 'border-[#8C1D19] bg-white text-[#8C1D19] ring-1 ring-[#8C1D19]'
    : isSold ? 'border-[#cfd5da] bg-[#e8eef4] text-transparent cursor-not-allowed'
    : isHeld ? 'border-yellow-300 bg-yellow-50 text-yellow-500 cursor-not-allowed'
    : 'border-[#cfd5da] bg-white text-neutral-700 hover:border-[#8C1D19] cursor-pointer'
  return (
    <button type="button" disabled={disabled}
      onClick={(e) => { e.preventDefault(); !disabled && onSelect(seat) }}
      title={isHeld ? 'Đang giữ chỗ' : isSold ? 'Đã bán' : `Ghế ${seat.number} - ${seat.price}K`}
      className={`relative h-[42px] w-[38px] rounded-md border text-center transition-colors ${cls}`}>
      {!disabled && (
        <>
          <span className="block text-xs font-bold leading-4">{seat.number}</span>
          <span className="block text-[10px] leading-3">{seat.price}K</span>
        </>
      )}
      <span className="absolute -top-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
      <span className="absolute -bottom-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
    </button>
  )
}

const NMCLCSeatMap = ({ seats, selectedNums, onSelect }) => (
  <div className="overflow-x-auto px-2 py-2">
    <div className="min-w-[850px]">
      <div className="space-y-1.5">
        {seatRows.map((row, rowIndex) =>
          row[0] === 'space' ? <div key="space" className="h-2" /> : (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((item, idx) => {
                if (item === 'aisle') return (
                  <div key={`aisle-${idx}`} className="w-[38px] flex items-center justify-center text-[10px] text-neutral-400">Bàn</div>
                )
                const seat = seats.find(s => s.number === item)
                return <SeatBtn key={item} seat={seat || null} selected={!!seat && selectedNums.includes(seat.number)} onSelect={onSelect} />
              })}
            </div>
          )
        )}
      </div>
    </div>
  </div>
)

// ─── Nút giường nằm ──────────────────────────────────────────────
const BerthBtnH = ({ berth, selected, onSelect, tierColor }) => {
  if (!berth) return <div className="w-[38px] h-[42px]" />
  const isSold = berth.status === 'sold'
  const isHeld = berth.status === 'held'
  const disabled = isSold || isHeld
  const cls = selected
    ? 'border-[#8C1D19] bg-white text-[#8C1D19] ring-1 ring-[#8C1D19]'
    : isSold ? 'border-[#cfd5da] bg-[#e8eef4] text-transparent cursor-not-allowed'
    : isHeld ? 'border-yellow-300 bg-yellow-50 text-yellow-500 cursor-not-allowed'
    : `border-[#cfd5da] ${tierColor} text-neutral-700 hover:border-[#8C1D19] cursor-pointer`
  return (
    <button disabled={disabled} onClick={() => !disabled && onSelect(berth)}
      title={disabled ? (isHeld ? 'Đang giữ' : 'Đã bán') : `Giường ${berth.number} · ${berth.price}K`}
      className={`relative h-[42px] w-[38px] rounded-md border text-center transition-colors ${cls}`}>
      {!disabled && (
        <>
          <span className="block text-xs font-bold leading-4">{berth.number}</span>
          <span className="block text-[10px] leading-3">{berth.price}K</span>
        </>
      )}
      <span className="absolute -top-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
      <span className="absolute -bottom-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
    </button>
  )
}

const GN6ACSeatMap = ({ seats, selectedNums, onSelect }) => {
  const compartments = Array.from({ length: 10 }, (_, i) => {
    const cs = seats.filter(s => s.compartment === i + 1)
    return { num: i + 1, get: (pos) => cs.find(b => b.pos === pos) || null }
  })
  const tiers = [
    { label: 'Tầng trên', posL: 4, posR: 5, color: 'bg-purple-50' },
    { label: 'Tầng giữa', posL: 2, posR: 3, color: 'bg-blue-50' },
    { label: 'Tầng dưới', posL: 0, posR: 1, color: 'bg-green-50' },
  ]
  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-max pb-1">
          <div className="flex items-center gap-2 mb-2 pl-[84px] pr-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">← Đầu tàu</span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">Cuối tàu →</span>
          </div>
          <div className="flex items-end mb-0.5">
            <div className="w-[84px] shrink-0" />
            {compartments.map(c => (
              <div key={c.num} className="w-[84px] text-center text-[10px] font-bold text-gray-600 border-b border-gray-200 pb-0.5">K{c.num}</div>
            ))}
          </div>
          {tiers.map(({ label, posL, posR, color }) => (
            <div key={label} className="flex items-center mb-1">
              <div className="w-[84px] text-[10px] text-gray-500 font-medium shrink-0 text-right pr-2">{label}</div>
              {compartments.map(c => {
                const bL = c.get(posL); const bR = c.get(posR)
                return (
                  <div key={c.num} className="w-[84px] flex gap-1 justify-center">
                    <BerthBtnH berth={bL} selected={!!(bL && selectedNums.includes(bL.number))} onSelect={onSelect} tierColor={color} />
                    <BerthBtnH berth={bR} selected={!!(bR && selectedNums.includes(bR.number))} onSelect={onSelect} tierColor={color} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-[10px] justify-center mt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-green-50 border-gray-300 inline-block" /> Tầng dưới (1.670K)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-blue-50 border-gray-300 inline-block" /> Tầng giữa (1.490K)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-purple-50 border-gray-300 inline-block" /> Tầng trên (1.350K)</span>
      </div>
    </div>
  )
}

const GN4ACSeatMap = ({ seats, selectedNums, onSelect }) => {
  const compartments = Array.from({ length: 10 }, (_, i) => {
    const cs = seats.filter(s => s.compartment === i + 1)
    return { num: i + 1, get: (pos) => cs.find(b => b.pos === pos) || null }
  })
  const tiers = [
    { label: 'Tầng trên', posL: 2, posR: 3, color: 'bg-indigo-50' },
    { label: 'Tầng dưới', posL: 0, posR: 1, color: 'bg-green-50' },
  ]
  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-max pb-1">
          <div className="flex items-center gap-2 mb-2 pl-[84px] pr-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">← Đầu tàu</span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">Cuối tàu →</span>
          </div>
          <div className="flex items-end mb-0.5">
            <div className="w-[84px] shrink-0" />
            {compartments.map(c => (
              <div key={c.num} className="w-[84px] text-center text-[10px] font-bold text-gray-600 border-b border-gray-200 pb-0.5">K{c.num}</div>
            ))}
          </div>
          {tiers.map(({ label, posL, posR, color }) => (
            <div key={label} className="flex items-center mb-1">
              <div className="w-[84px] text-[10px] text-gray-500 font-medium shrink-0 text-right pr-2">{label}</div>
              {compartments.map(c => {
                const bL = c.get(posL); const bR = c.get(posR)
                return (
                  <div key={c.num} className="w-[84px] flex gap-1 justify-center">
                    <BerthBtnH berth={bL} selected={!!(bL && selectedNums.includes(bL.number))} onSelect={onSelect} tierColor={color} />
                    <BerthBtnH berth={bR} selected={!!(bR && selectedNums.includes(bR.number))} onSelect={onSelect} tierColor={color} />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 text-[10px] justify-center mt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-green-50 border-gray-300 inline-block" /> Tầng dưới (1.870K)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border bg-indigo-50 border-gray-300 inline-block" /> Tầng trên (1.700K)</span>
      </div>
    </div>
  )
}

// ─── SeatMap ─────────────────────────────────────────────────────
// selectedSeats: ordered array of { coachId, coachName, coachType, seat }
// seat at index i belongs to passenger i (adults first, then children)
const SeatMap = ({ train, coach, selectedSeats, totalPassengers, adultTickets, childTickets, onCoachChange, onSeatSelect, onConfirm, onBack, isRoundTrip, isReturnTrip }) => {
  const [activeCoach, setActiveCoach] = useState(coach)
  const currentCoach = activeCoach

  const currentCoachSelectedNums = selectedSeats.filter(s => s.coachId === currentCoach.id).map(s => s.seat.number)
  const isNMCLC = currentCoach.type === COACH_TYPE.NMCLC

  const totalPrice = selectedSeats.reduce((sum, s, idx) => {
    const base = s.seat.price * 1000
    return sum + (idx >= adultTickets ? Math.round(base * 0.75) : base)
  }, 0)

  const isReady = selectedSeats.length === totalPassengers

  const handleCoachClick = (c) => {
    setActiveCoach(c)
    onCoachChange(c)
  }

  const getCoachSelectedCount = (c) => selectedSeats.filter(s => s.coachId === c.id).length

  return (
    <section className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 bg-neutral-50">
        <p className="text-sm text-neutral-700">{train.fromStation} → {train.toStation} | {formatDisplayDate(train.departDate)}</p>
        <p className="text-lg font-bold text-neutral-800">{train.type} {train.code}</p>
        <button onClick={onBack} className="text-2xl text-neutral-400 hover:text-[#8C1D19]"><FaXmark /></button>
      </div>

      {/* Coach tabs */}
      <div className="px-3 pt-2">
        <div className="flex items-stretch gap-1">
          {train.coaches.map(c => {
            const cnt = getCoachSelectedCount(c)
            return (
              <button key={c.id} onClick={() => handleCoachClick(c)}
                className={`flex-1 min-w-0 rounded-sm border bg-white px-2 py-1.5 text-left shadow-sm transition-all ${
                  activeCoach.id === c.id ? 'border-[#8C1D19]/70 border-t-4' : 'border-neutral-200 border-t-4 border-t-neutral-300'
                }`}>
                <p className="text-xs font-medium text-neutral-800 truncate">{c.name}</p>
                {cnt > 0
                  ? <p className="mt-0.5 text-[10px] font-semibold text-[#8C1D19] truncate">✓ {cnt} chỗ</p>
                  : <p className="mt-0.5 text-[10px] text-neutral-500 truncate">Còn {c.availableSeats} | {c.priceRange}</p>
                }
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto mt-1 h-px w-64 rounded-full bg-neutral-300" />

      {/* Seat map */}
      <div className="overflow-x-auto px-2 py-2">
        <h3 className="text-center text-sm font-bold text-neutral-800 mb-2">{currentCoach.name}</h3>
        {isNMCLC && <NMCLCSeatMap seats={currentCoach.seats} selectedNums={currentCoachSelectedNums} onSelect={onSeatSelect} />}
        {currentCoach.type === COACH_TYPE.GN6AC && <GN6ACSeatMap seats={currentCoach.seats} selectedNums={currentCoachSelectedNums} onSelect={onSeatSelect} />}
        {currentCoach.type === COACH_TYPE.GN4AC && <GN4ACSeatMap seats={currentCoach.seats} selectedNums={currentCoachSelectedNums} onSelect={onSeatSelect} />}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        {/* Per-passenger cards */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from({ length: totalPassengers }, (_, idx) => {
            const sel = selectedSeats[idx]
            const isChild = idx >= adultTickets
            const label = isChild ? `Trẻ em ${childTickets > 1 ? idx - adultTickets + 1 : ''}` : `Người lớn ${adultTickets > 1 ? idx + 1 : ''}`
            const isNext = !sel && idx === selectedSeats.length
            const seatTypeLabel = sel ? (sel.coachType === COACH_TYPE.NMCLC ? 'Ghế' : 'Giường') : ''
            const displayPrice = sel ? (isChild ? Math.round(sel.seat.price * 1000 * 0.75) : sel.seat.price * 1000) : 0
            return (
              <div key={idx} className={`rounded-md border p-2 flex-1 min-w-[130px] transition-colors ${
                isNext ? 'border-[#8C1D19] bg-[#8C1D19]/5' : sel ? 'border-green-400 bg-green-50' : 'border-gray-200'
              }`}>
                <p className="text-xs font-bold text-neutral-700 flex items-center gap-1 flex-wrap">
                  {label}
                  {isChild && <span className="text-green-600 text-[10px] font-semibold bg-green-100 px-1 rounded">-25%</span>}
                </p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {sel ? `${seatTypeLabel} ${sel.seat.number} · Toa ${sel.coachId}` : 'Chưa chọn'}
                </p>
                {sel && <p className="text-[10px] text-[#ff8a00] font-semibold">{formatPrice(displayPrice)}</p>}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-sm border bg-white border-neutral-300 inline-block" /><span className="text-neutral-700">Chỗ trống</span></div>
          <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-sm border bg-[#e8eef4] border-neutral-300 inline-block" /><span className="text-neutral-700">Chỗ đã bán</span></div>
          <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-sm border bg-white border-[#8C1D19] inline-block" /><span className="text-[#8C1D19]">Đang chọn</span></div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-600">Đã chọn: <span className="font-bold">{selectedSeats.length}/{totalPassengers} chỗ</span></p>
            {totalPrice > 0 && <p className="text-xs text-[#ff8a00] font-semibold">Tổng: {formatPrice(totalPrice)}</p>}
            {!selectedSeats.length && <p className="text-xs text-[#ff8a00]">Vui lòng chọn chỗ trống</p>}
          </div>
          <button onClick={onConfirm} disabled={!isReady}
            className={`h-10 min-w-[200px] rounded-md px-4 text-sm font-bold flex items-center justify-center gap-1 transition ${
              isReady ? 'bg-[#ff8a00] text-white hover:bg-[#f47c00] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}>
            {isReady ? (isRoundTrip && !isReturnTrip ? 'Tiếp tục chọn chiều về' : 'Xác nhận') : `Chọn thêm ${totalPassengers - selectedSeats.length} chỗ`}
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Component chính ─────────────────────────────────────────────
const TrainSelection = ({ fromStation, toStation, travelDate, onComplete, onBack, title, totalPassengers, adultTickets = 1, childTickets = 0, isReturnTrip, isRoundTrip = false }) => {
  const [mode, setMode] = useState('list')
  const [trainList, setTrainList] = useState([])
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedCoach, setSelectedCoach] = useState(null)
  // Ordered array: { coachId, coachName, coachType, seat }
  const [selectedSeats, setSelectedSeats] = useState([])

  useEffect(() => {
    setTrainList(searchTrains(fromStation, toStation))
  }, [fromStation, toStation])

  const handleSelectTrain = (train) => {
    setSelectedTrain(train)
    setSelectedCoach(train.coaches[0])
    setSelectedSeats([])
    setMode('seat')
  }

  const handleSeatSelect = (seat) => {
    if (seat.status !== 'empty') return
    const coachId = selectedCoach.id
    const existingIdx = selectedSeats.findIndex(s => s.coachId === coachId && s.seat.number === seat.number)
    if (existingIdx >= 0) {
      setSelectedSeats(prev => prev.filter((_, i) => i !== existingIdx))
    } else if (selectedSeats.length < totalPassengers) {
      setSelectedSeats(prev => [...prev, {
        coachId,
        coachName: selectedCoach.name,
        coachType: selectedCoach.type,
        seat
      }])
    }
  }

  const handleCoachChange = (coach) => setSelectedCoach(coach)

  const handleConfirm = () => {
    if (selectedSeats.length !== totalPassengers) {
      alert(`Vui lòng chọn đủ ${totalPassengers} chỗ`)
      return
    }

    const totalPrice = selectedSeats.reduce((sum, s, idx) => {
      const base = s.seat.price * 1000
      return sum + (idx >= adultTickets ? Math.round(base * 0.75) : base)
    }, 0)

    const passengerSeats = selectedSeats.map((s, idx) => {
      const basePrice = s.seat.price * 1000
      const isChild = idx >= adultTickets
      return {
        coachId: s.coachId,
        coachName: s.coachName,
        coachType: s.coachType,
        seatNumber: s.seat.number,
        basePrice,
        seatPrice: isChild ? Math.round(basePrice * 0.75) : basePrice,
        isChild
      }
    })

    onComplete(selectedTrain, passengerSeats, totalPrice)
  }

  if (mode === 'seat') {
    return (
      <SeatMap
        train={selectedTrain}
        coach={selectedCoach}
        selectedSeats={selectedSeats}
        totalPassengers={totalPassengers}
        adultTickets={adultTickets}
        childTickets={childTickets}
        onCoachChange={handleCoachChange}
        onSeatSelect={handleSeatSelect}
        onConfirm={handleConfirm}
        onBack={() => setMode('list')}
        isRoundTrip={isRoundTrip}
        isReturnTrip={isReturnTrip}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
        <button onClick={onBack} className="text-gray-500 hover:text-[#8C1D19] text-sm">
          ← {isReturnTrip ? 'Quay lại chọn chiều đi' : 'Quay lại trang chủ'}
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#8C1D19]">{title}</h2>
          <p className="text-sm text-gray-500">
            {fromStation} → {toStation}{travelDate && ` • ${formatDisplayDate(travelDate)}`}
          </p>
        </div>
        <div className="w-24" />
      </div>

      {trainList.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <FaTrain className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy chuyến tàu từ {fromStation} đến {toStation}</p>
          <button onClick={onBack} className="mt-4 text-[#8C1D19] underline text-sm">← Quay lại</button>
        </div>
      ) : (
        <div className="space-y-3">
          {trainList.map(train => (
            <div key={train.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-5 gap-3 items-center">
                <div>
                  <div className="text-xs text-gray-500">{train.type}</div>
                  <div className="text-2xl font-bold text-[#8C1D19]">{train.code}</div>
                  <div className="mt-1 inline-block px-2 py-0.5 bg-orange-50 text-orange-500 text-xs rounded-full border border-orange-200">
                    Còn {train.availableSeats} chỗ
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{train.departTime}</div>
                  <div className="text-sm text-gray-600">{train.fromStation}</div>
                  <div className="text-xs text-gray-400">{train.departDate}</div>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                  <div className="text-xs mb-1">{train.duration}</div>
                  <FaArrowRightLong />
                  <div className="text-xs mt-1">Suốt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{train.arriveTime}</div>
                  <div className="text-sm text-gray-600">{train.toStation}</div>
                  <div className="text-xs text-gray-400">{train.arriveDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Từ</div>
                  <div className="text-xl font-bold text-[#8C1D19]">{formatPrice(train.priceFrom)}</div>
                  <button onClick={() => handleSelectTrain(train)}
                    className="mt-2 px-4 py-1.5 bg-[#8C1D19] text-white rounded-md text-sm hover:bg-[#6a1613] transition-colors">
                    Chọn chỗ
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                {train.coaches.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
                    <span className="text-gray-600">{c.name.replace(`Toa ${c.id}: `, 'Toa ' + c.id + ' - ')}</span>
                    <span className={`font-semibold ${c.availableSeats <= 5 ? 'text-red-500' : 'text-green-600'}`}>{c.availableSeats} chỗ</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrainSelection
