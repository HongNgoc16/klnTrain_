// pages/ticketSearch/trainSelection/TrainSelection.jsx
import React, { useState, useEffect, useRef } from 'react'
import { FaArrowRightLong, FaTrain, FaXmark, FaChevronRight, FaSpinner } from 'react-icons/fa6'
import { searchTrains as searchTrainsApi, getSeatMap as getSeatMapApi } from '../../../api/trains'
import { holdSeats as holdSeatsApi } from '../../../api/bookings'
import { formatDate as formatDisplayDate } from '../../../utils/dateUtils'

export const COACH_TYPE = { NMCLC: 'NMCLC', GN6AC: 'GN6AC', GN4AC: 'GN4AC' }

// ─── Helpers ánh xạ dữ liệu API ─────────────────────────────────

const COACH_TYPE_MAP = {
  NMCLC: 'NMCLC',
  NMDH: 'NMCLC',  // Ngồi mềm điều hòa → same layout
  NCDH: 'NMCLC',  // Ngồi cứng điều hòa → same layout
  GN6AC: 'GN6AC',
  GN6DH: 'GN6AC',
  GN4AC: 'GN4AC',
  GN4DH: 'GN4AC',
  'GN4_DH': 'GN4AC', // fix cho GN4_DH
  'GN6_DH': 'GN6AC', // fix cho GN6_DH
}

// Sequelize TIME on MSSQL serializes as "1970-01-01T06:00:00.000Z" — extract HH:MM via UTC
const parseHHMM = (t) => {
  if (!t) return ''
  if (t.includes('T')) {
    const d = new Date(t)
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
  }
  return t.slice(0, 5)
}

// Sequelize DATEONLY may serialize as "2026-05-26T00:00:00.000Z" — take first 10 chars
const parseDateOnly = (d) => {
  if (!d) return ''
  return d.includes('T') ? d.slice(0, 10) : d
}

const computeArriveDate = (departDate, departTime, arriveTime) => {
  if (!departDate || !departTime || !arriveTime) return departDate
  const [dH, dM] = departTime.slice(0, 5).split(':').map(Number)
  const [aH, aM] = arriveTime.slice(0, 5).split(':').map(Number)
  if (aH * 60 + aM < dH * 60 + dM) {
    const d = new Date(departDate)
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }
  return departDate
}

const computeDuration = (departTime, arriveTime, departDate, arriveDate) => {
  if (!departTime || !arriveTime) return ''
  const [dH, dM] = departTime.slice(0, 5).split(':').map(Number)
  const [aH, aM] = arriveTime.slice(0, 5).split(':').map(Number)
  let mins = (aH * 60 + aM) - (dH * 60 + dM)
  if (departDate && arriveDate && arriveDate !== departDate) {
    const days = Math.round((new Date(arriveDate) - new Date(departDate)) / 86400000)
    mins += days * 24 * 60
  }
  if (mins < 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}g ${m}p` : `${m}p`
}

// Parse ISO datetime → "HH:MM" theo múi giờ Việt Nam
const isoToHHMM = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh', hour12: false,
    })
  } catch { return '' }
}

// Parse ISO datetime → "YYYY-MM-DD" theo múi giờ Việt Nam
const isoToDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) // en-CA → YYYY-MM-DD
  } catch { return '' }
}

const mapApiTrain = (ct) => {
  // Ưu tiên dùng offset-based ISO time (chính xác cho ga trung gian)
  // Fallback về giờ lịch chạy (gio_khoi_hanh / gio_du_kien_den) nếu chưa có
  const departTime = ct.departureISO ? isoToHHMM(ct.departureISO) : parseHHMM(ct.gioKhoiHanh)
  const arriveTime = ct.arrivalISO   ? isoToHHMM(ct.arrivalISO)   : parseHHMM(ct.gioDuKienDen)
  const departDate = ct.departureISO ? isoToDate(ct.departureISO)  : parseDateOnly(ct.ngayChay)
  const arriveDate = ct.arrivalISO   ? isoToDate(ct.arrivalISO)    : computeArriveDate(departDate, departTime, arriveTime)

  // Thời gian đi tính từ durationPhut (phút) nếu backend cung cấp
  const duration = ct.durationPhut != null
    ? `${Math.floor(ct.durationPhut / 60)}g ${ct.durationPhut % 60}p`
    : computeDuration(departTime, arriveTime, departDate, arriveDate)

  return {
    id: ct.idChuyen,
    idChuyen: ct.idChuyen,
    code: ct.maTau,
    type: ct.loaiTau || 'Tàu Liên Tỉnh',
    fromStation: ct.gaDi?.ten || '',
    toStation: ct.gaDen?.ten || '',
    gaDiId: ct.gaDi?.id,
    gaDenId: ct.gaDen?.id,
    departTime,
    arriveTime,
    departDate,
    arriveDate,
    duration,
    priceFrom:  ct.priceFrom || 0,
    trangThai:  ct.trangThai || '',
    daDiQua:    ct.daDiQua === true,   // true = đã khởi hành → hiển thị nhưng disable đặt vé
    availableSeats: ct.availableSeats
      ?? ct.coaches?.reduce((s, c) => s + (c.soChoTrong ?? c.soChoToiDa ?? 0), 0)
      ?? 0,
    coaches: (ct.coaches || []).map(c => ({
      id: c.soToa,
      name: `Toa ${c.soToa}: ${c.tenLoaiToa}`,
      type: COACH_TYPE_MAP[c.maLoaiToa] || 'NMCLC',
      maLoaiToa: c.maLoaiToa,
      soChoToiDa:     c.soChoToiDa  ?? 0,
      availableSeats: c.soChoTrong  ?? c.soChoToiDa ?? 0,  // chỗ THỰC TẾ còn trống
      priceRange: '',
      seats: null,
    })),
  }
}

const mapApiSeat = (apiSeat, coachType) => ({
  number: apiSeat.soGhe,
  price: apiSeat.gia != null ? Math.round(apiSeat.gia / 1000) : 0,
  status: apiSeat.trangThai || 'empty',
  compartment: apiSeat.khoangSo ?? null,   // từ DB: khoang_so
  pos: apiSeat.ben ?? null,        // từ DB: ben (A hoặc B)
  tang: apiSeat.tang ?? null,       // từ DB: tang (Tren, Giua, Duoi)
})

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ'

// ─── Layout ghế ngồi mềm ──────────────────────────────────────────
const generateSoftSeatRows = (seats) => {
  const totalSeats = seats.length
  if (totalSeats === 0) return []
  const gridTotal = Math.ceil(totalSeats / 8) * 8
  const half = gridTotal / 2
  const numCols = half / 4  // số cột mỗi nửa

  const rowData = [[], [], [], []]

  // Nửa trái — serpentine theo cặp cột
  for (let c = 0; c < numCols; c++) {
    const block = Math.floor(c / 2)
    const inBlock = c % 2
    for (let r = 0; r < 4; r++) {
      const n = inBlock === 0 ? block * 8 + r + 1 : block * 8 + 8 - r
      rowData[r].push(n <= totalSeats ? n : null)
    }
  }

  // Lối đi giữa
  for (let r = 0; r < 4; r++) rowData[r].push('aisle')

  // Nửa phải — serpentine tiếp nối
  for (let c = 0; c < numCols; c++) {
    const isNormal = (numCols + c) % 2 === 0
    const blockBase = half + c * 4 + 1
    for (let r = 0; r < 4; r++) {
      const n = isNormal ? blockBase + r : blockBase + 3 - r
      rowData[r].push(n <= totalSeats ? n : null)
    }
  }

  return [rowData[0], rowData[1], ['space'], rowData[2], rowData[3]]
}

const SeatBtn = ({ seat, selected, onSelect }) => {
  if (!seat) return <div className="w-[38px] h-[42px]" />
  const isSold = seat.status === 'sold'
  const isHeld = seat.status === 'held'
  const disabled = isSold || isHeld
  const cls = selected
    ? 'border-[#8C1D19] bg-white text-[#8C1D19] ring-1 ring-[#8C1D19]'
    : isSold ? 'border-[#cfd5da] bg-[#e8eef4] text-gray-400 cursor-not-allowed'
      : isHeld ? 'border-yellow-300 bg-yellow-50 text-yellow-400 cursor-not-allowed'
        : 'border-[#cfd5da] bg-white text-neutral-700 hover:border-[#8C1D19] cursor-pointer'
  return (
    <button type="button" disabled={disabled}
      onClick={(e) => { e.preventDefault(); !disabled && onSelect(seat) }}
      title={isHeld ? 'Đang giữ chỗ' : isSold ? 'Đã bán' : `Ghế ${seat.number} - ${seat.price}K`}
      className={`relative h-[42px] w-[38px] rounded-md border text-center transition-colors ${cls}`}>
      <span className="block text-xs font-bold leading-4">{seat.number}</span>
      {!disabled && <span className="block text-[10px] leading-3">{seat.price}K</span>}
      <span className="absolute -top-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
      <span className="absolute -bottom-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
    </button>
  )
}

const NMCLCSeatMap = ({ seats, selectedNums, onSelect }) => {
  const rows = generateSoftSeatRows(seats)
  return (
    <div className="overflow-x-auto px-2 py-2">
      <div className="min-w-max">
        <div className="space-y-1.5">
          {rows.map((row, rowIndex) =>
            row[0] === 'space' ? <div key="space" className="h-2" /> : (
              <div key={rowIndex} className="flex justify-center gap-1.5">
                {row.map((item, idx) => {
                  if (item === 'aisle') return (
                    <div key={`aisle-${idx}`} className="w-[38px] flex items-center justify-center text-[10px] text-neutral-400">Bàn</div>
                  )
                  const seat = seats.find(s => s.number === item)
                  return <SeatBtn key={item ?? `null-${rowIndex}-${idx}`} seat={seat || null} selected={!!seat && selectedNums.includes(seat.number)} onSelect={onSelect} />
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Nút giường nằm ──────────────────────────────────────────────
const BerthBtnH = ({ berth, selected, onSelect }) => {
  if (!berth) return <div className="w-[38px] h-[42px]" />
  const isSold = berth.status === 'sold'
  const isHeld = berth.status === 'held'
  const disabled = isSold || isHeld
  const cls = selected
    ? 'border-[#8C1D19] bg-white text-[#8C1D19] ring-1 ring-[#8C1D19]'
    : isSold ? 'border-[#cfd5da] bg-[#e8eef4] text-gray-400 cursor-not-allowed'
      : isHeld ? 'border-yellow-300 bg-yellow-50 text-yellow-400 cursor-not-allowed'
        : 'border-[#cfd5da] bg-white text-neutral-700 hover:border-[#8C1D19] cursor-pointer'
  return (
    <button
      disabled={disabled}
      onClick={() => !disabled && onSelect(berth)}
      title={disabled ? (isHeld ? 'Đang giữ' : 'Đã bán') : `Giường ${berth.number} · ${berth.price}K`}
      className={`relative h-[42px] w-[38px] rounded-md border text-center transition-colors ${cls}`}
    >
      <span className="block text-xs font-bold leading-4">{berth.number}</span>
      {!disabled && <span className="block text-[10px] leading-3">{berth.price}K</span>}
      <span className="absolute -top-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
      <span className="absolute -bottom-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
    </button>
  )
}

// ─── GN4AC Seat Map ──────────────────────────────────────────────
const GN4ACSeatMap = ({ seats, selectedNums, onSelect }) => {
  // Tìm số khoang lớn nhất từ dữ liệu
  const maxCompartment = seats.reduce((max, s) => Math.max(max, s.compartment || 0), 0)
  const compartments = Array.from({ length: maxCompartment }, (_, i) => i + 1)

  const tiers = [
    { label: 'Tầng 2', key: 'Tren' },
    { label: 'Tầng 1', key: 'Duoi' },
  ]

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header: Khoang */}
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div className="font-bold text-center text-xs text-gray-600 py-1 border-b border-gray-200">
            Tầng / Khoang
          </div>
          {compartments.map(c => (
            <div key={c} className="font-bold text-center text-xs text-gray-600 py-1 border-b border-gray-200">
              Khoang {c}
            </div>
          ))}
        </div>

        {/* Các tầng */}
        {tiers.map(({ label, key }) => (
          <div key={key} className="grid grid-cols-8 gap-1 mb-1 items-center">
            <div className="text-right pr-2 text-[10px] font-semibold text-gray-500">{label}</div>
            {compartments.map(c => {
              const berthA = seats.find(s => s.compartment === c && s.tang === key && s.pos === 'A')
              const berthB = seats.find(s => s.compartment === c && s.tang === key && s.pos === 'B')
              return (
                <div key={c} className="flex justify-center gap-0.5">
                  <BerthBtnH
                    berth={berthA}
                    selected={!!(berthA && selectedNums.includes(berthA.number))}
                    onSelect={onSelect}
                  />
                  <BerthBtnH
                    berth={berthB}
                    selected={!!(berthB && selectedNums.includes(berthB.number))}
                    onSelect={onSelect}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── GN6AC Seat Map ──────────────────────────────────────────────
const GN6ACSeatMap = ({ seats, selectedNums, onSelect }) => {
  const maxCompartment = seats.reduce((max, s) => Math.max(max, s.compartment || 0), 0)
  const compartments = Array.from({ length: maxCompartment }, (_, i) => i + 1)

  const tiers = [
    { label: 'Tầng 3', key: 'Tren' },
    { label: 'Tầng 2', key: 'Giua' },
    { label: 'Tầng 1', key: 'Duoi' },
  ]

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header: Khoang */}
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div className="font-bold text-center text-xs text-gray-600 py-1 border-b border-gray-200">
            Tầng / Khoang
          </div>
          {compartments.map(c => (
            <div key={c} className="font-bold text-center text-xs text-gray-600 py-1 border-b border-gray-200">
              Khoang {c}
            </div>
          ))}
        </div>

        {/* Các tầng */}
        {tiers.map(({ label, key }) => (
          <div key={key} className="grid grid-cols-8 gap-1 mb-1 items-center">
            <div className="text-right pr-2 text-[10px] font-semibold text-gray-500">{label}</div>
            {compartments.map(c => {
              const berthA = seats.find(s => s.compartment === c && s.tang === key && s.pos === 'A')
              const berthB = seats.find(s => s.compartment === c && s.tang === key && s.pos === 'B')
              return (
                <div key={c} className="flex justify-center gap-0.5">
                  <BerthBtnH
                    berth={berthA}
                    selected={!!(berthA && selectedNums.includes(berthA.number))}
                    onSelect={onSelect}
                  />
                  <BerthBtnH
                    berth={berthB}
                    selected={!!(berthB && selectedNums.includes(berthB.number))}
                    onSelect={onSelect}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SeatMap ─────────────────────────────────────────────────────
const SeatMap = ({
  train, selectedCoachId, selectedSeats, loadingCoachId,
  totalPassengers,
  adultTickets, elderlyTickets = 0, studentTickets = 0, childTickets,
  adultMax = adultTickets, elderlyMax = elderlyTickets,
  studentMax = studentTickets, childMax = childTickets,
  canAdjust = false, onAdjust,
  onCoachChange, onSeatSelect, onConfirm, onBack,
  isRoundTrip, isReturnTrip,
  confirmLoading, confirmError,
}) => {
  // Dùng tên ngắn để code bên dưới dễ đọc
  const legAdults  = adultTickets
  const legElderly = elderlyTickets
  const legStudent = studentTickets
  const legChildren = childTickets
  // Luôn lấy coach object mới nhất từ train.coaches (sau khi seats được load)
  const currentCoach = train.coaches.find(c => c.id === selectedCoachId) || train.coaches[0]
  const currentSeats = currentCoach?.seats || []

  const currentCoachSelectedNums = selectedSeats
    .filter(s => s.coachId === currentCoach?.id)
    .map(s => s.seat.number)

  const isNMCLC = currentCoach?.type === COACH_TYPE.NMCLC

  const totalPrice = selectedSeats.reduce((sum, s, idx) => {
    const base  = s.seat.price * 1000
    const pType = getPassengerType(idx, legAdults, legElderly, legStudent)
    return sum + Math.round(base * (1 - DISCOUNT[pType]))
  }, 0)

  const isReady = selectedSeats.length === totalPassengers

  const getCoachSelectedCount = (c) => selectedSeats.filter(s => s.coachId === c.id).length

  return (
    <section className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 bg-neutral-50">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8C1D19] transition-colors font-medium">
          <FaXmark className="h-3 w-3" /> Chọn tàu khác
        </button>
        <p className="text-lg font-bold text-neutral-800">{train.type} {train.code}</p>
        <p className="text-sm text-neutral-600">{train.fromStation} → {train.toStation} | {formatDisplayDate(train.departDate)}</p>
      </div>

      <div className="px-3 pt-2">
        <div className="flex items-stretch gap-1">
          {train.coaches.map(c => {
            const cnt = getCoachSelectedCount(c)
            const isActive = c.id === currentCoach?.id
            return (
              <button key={c.id} onClick={() => onCoachChange(c)}
                className={`flex-1 min-w-0 rounded-sm border bg-white px-2 py-1.5 text-left shadow-sm transition-all ${isActive ? 'border-[#8C1D19]/70 border-t-4' : 'border-neutral-200 border-t-4 border-t-neutral-300'
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

      <div className="overflow-x-auto px-2 py-2">
        <h3 className="text-center text-sm font-bold text-neutral-800 mb-2">{currentCoach?.name}</h3>
        {loadingCoachId === currentCoach?.id ? (
          <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
            <FaSpinner className="animate-spin text-2xl" />
            <span className="text-sm">Đang tải sơ đồ ghế...</span>
          </div>
        ) : currentSeats.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Không có dữ liệu ghế</div>
        ) : (
          <>
            {isNMCLC && <NMCLCSeatMap seats={currentSeats} selectedNums={currentCoachSelectedNums} onSelect={onSeatSelect} />}
            {currentCoach?.type === COACH_TYPE.GN6AC && <GN6ACSeatMap seats={currentSeats} selectedNums={currentCoachSelectedNums} onSelect={onSeatSelect} />}
            {currentCoach?.type === COACH_TYPE.GN4AC && <GN4ACSeatMap seats={currentSeats} selectedNums={currentCoachSelectedNums} onSelect={onSeatSelect} />}
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Điều chỉnh số hành khách cho từng chiều (chỉ hiện khi khứ hồi) */}
        {canAdjust && (
          <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-xs font-semibold text-amber-800 mb-2">Số vé chiều này:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {[
                { type: 'adult',   label: 'Người lớn',     cur: legAdults,   max: adultMax,   badge: null    },
                { type: 'elderly', label: 'Người cao tuổi',cur: legElderly,  max: elderlyMax, badge: '-15%'  },
                { type: 'student', label: 'Sinh viên',      cur: legStudent,  max: studentMax, badge: '-10%'  },
                { type: 'child',   label: 'Trẻ em',         cur: legChildren, max: childMax,   badge: '-25%'  },
              ].filter(r => r.max > 0).map(({ type, label, cur, max, badge }) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-700">{label}</span>
                  {badge && <span className="text-[10px] text-green-600 font-semibold">{badge}</span>}
                  <button type="button" onClick={() => onAdjust(type, -1)} disabled={cur <= 0}
                    className="h-6 w-6 rounded-full bg-[#8C1D19] text-white text-xs flex items-center justify-center disabled:bg-gray-300">−</button>
                  <span className="w-5 text-center text-sm font-bold">{cur}</span>
                  <button type="button" onClick={() => onAdjust(type, +1)} disabled={cur >= max}
                    className="h-6 w-6 rounded-full bg-[#8C1D19] text-white text-xs flex items-center justify-center disabled:bg-gray-300">+</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from({ length: totalPassengers }, (_, idx) => {
            const sel      = selectedSeats[idx]
            const pType    = getPassengerType(idx, legAdults, legElderly, legStudent)
            const discount = DISCOUNT[pType]
            // Label: "Người lớn 1", "Người lớn 2", "Người cao tuổi", "Sinh viên", "Trẻ em 1"...
            const typeGroup = { adult: legAdults, elderly: legElderly, student: legStudent, child: legChildren }
            const label = (() => {
              const base = PASSENGER_LABEL[pType]
              if (pType === 'adult') {
                const aIdx = idx + 1
                return legAdults > 1 ? `${base} ${aIdx}` : base
              }
              if (pType === 'elderly') {
                const eIdx = idx - legAdults + 1
                return legElderly > 1 ? `${base} ${eIdx}` : base
              }
              if (pType === 'student') {
                const sIdx = idx - legAdults - legElderly + 1
                return legStudent > 1 ? `${base} ${sIdx}` : base
              }
              // child
              const cIdx = idx - legAdults - legElderly - legStudent + 1
              return legChildren > 1 ? `${base} ${cIdx}` : base
            })()
            const isNext = !sel && idx === selectedSeats.length
            const seatTypeLabel = sel ? (sel.coachType === COACH_TYPE.NMCLC ? 'Ghế' : 'Giường') : ''
            const displayPrice = sel ? Math.round(sel.seat.price * 1000 * (1 - discount)) : 0
            return (
              <div key={idx} className={`rounded-md border p-2 flex-1 min-w-[130px] transition-colors ${isNext ? 'border-[#8C1D19] bg-[#8C1D19]/5' : sel ? 'border-green-400 bg-green-50' : 'border-gray-200'
                }`}>
                <p className="text-xs font-bold text-neutral-700 flex items-center gap-1 flex-wrap">
                  {label}
                  {discount > 0 && (
                    <span className="text-green-600 text-[10px] font-semibold bg-green-100 px-1 rounded">
                      -{Math.round(discount * 100)}%
                    </span>
                  )}
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
          <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-sm border bg-yellow-50 border-yellow-300 inline-block" /><span className="text-neutral-700">Đang giữ</span></div>
          <div className="flex items-center gap-1.5 text-xs"><span className="h-3 w-3 rounded-sm border bg-white border-[#8C1D19] inline-block" /><span className="text-[#8C1D19]">Đang chọn</span></div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-600">Đã chọn: <span className="font-bold">{selectedSeats.length}/{totalPassengers} chỗ</span></p>
            {totalPrice > 0 && <p className="text-xs text-[#ff8a00] font-semibold">Tổng: {formatPrice(totalPrice)}</p>}
            {!selectedSeats.length && <p className="text-xs text-[#ff8a00]">Vui lòng chọn chỗ trống</p>}
          </div>
          <div className="flex flex-col items-end gap-1">
            {confirmError && (
              <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 max-w-[240px] text-right">{confirmError}</p>
            )}
            <button onClick={onConfirm} disabled={!isReady || confirmLoading}
              className={`h-10 min-w-[200px] rounded-md px-4 text-sm font-bold flex items-center justify-center gap-1 transition ${!isReady || confirmLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#ff8a00] text-white hover:bg-[#f47c00] cursor-pointer'
                }`}>
              {confirmLoading
                ? <><FaSpinner className="animate-spin text-xs" /> Đang giữ chỗ...</>
                : isReady
                  ? <>{isRoundTrip && !isReturnTrip ? 'Tiếp tục chọn chiều về' : 'Xác nhận & Giữ chỗ'} <FaChevronRight className="text-xs" /></>
                  : `Chọn thêm ${totalPassengers - selectedSeats.length} chỗ`
              }
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component chính ─────────────────────────────────────────────
// Hệ số giảm giá theo đối tượng hành khách
const DISCOUNT = { adult: 0, elderly: 0.15, student: 0.10, child: 0.25 }

// Xác định loại hành khách theo vị trí trong danh sách đã sắp xếp:
// adult(0..A-1) → elderly(A..A+E-1) → student(A+E..A+E+S-1) → child(A+E+S..total-1)
const getPassengerType = (idx, legAdults, legElderly, legStudent) => {
  if (idx < legAdults)                            return 'adult'
  if (idx < legAdults + legElderly)               return 'elderly'
  if (idx < legAdults + legElderly + legStudent)  return 'student'
  return 'child'
}

const PASSENGER_LABEL = {
  adult:   'Người lớn',
  elderly: 'Người cao tuổi',
  student: 'Sinh viên',
  child:   'Trẻ em',
}

const TrainSelection = ({
  fromStation, toStation, travelDate,
  onComplete, onBack, title,
  totalPassengers, adultTickets = 1, childTickets = 0,
  elderlyTickets = 0, studentTickets = 0,
  isReturnTrip, isRoundTrip = false,
  // Dữ liệu chiều đi (truyền vào chiều về để hold cả 2 cùng lúc)
  depIdChuyen = null, depPassengerSeats = null,
  depGaDiId = null, depGaDenId = null,
}) => {
  const [mode, setMode] = useState('list')
  const [trainList, setTrainList] = useState([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedCoachId, setSelectedCoachId] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loadingCoachId, setLoadingCoachId] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState(null)
  const seatsCache = useRef({})  // key: `${idChuyen}_${coachId}`

  // Số lượng hành khách cho riêng chuyến này (có thể khác tổng tìm kiếm khi khứ hồi)
  const [legAdults,   setLegAdults]   = useState(adultTickets)
  const [legElderly,  setLegElderly]  = useState(elderlyTickets)
  const [legStudent,  setLegStudent]  = useState(studentTickets)
  const [legChildren, setLegChildren] = useState(childTickets)
  const legTotal = legAdults + legElderly + legStudent + legChildren

  const legSetters = { adult: setLegAdults, elderly: setLegElderly, student: setLegStudent, child: setLegChildren }
  const legCounts  = { adult: legAdults,    elderly: legElderly,    student: legStudent,    child: legChildren }
  const legMax     = { adult: adultTickets, elderly: elderlyTickets, student: studentTickets, child: childTickets }

  const adjustLeg = (type, delta) => {
    const isAdult = type === 'adult'
    const next = Math.max(isAdult ? 0 : 0, legCounts[type] + delta)
    if (next > legMax[type]) return          // không vượt tổng tìm kiếm
    const others = legTotal - legCounts[type]
    if (others + next < 1) return            // tối thiểu 1 vé
    legSetters[type](next)
    setSelectedSeats(prev => prev.slice(0, others + next))
  }

  // Tìm kiếm chuyến từ API
  useEffect(() => {
    if (!fromStation || !toStation || !travelDate) return
    setApiLoading(true)
    setApiError(null)
    searchTrainsApi(fromStation, toStation, travelDate)
      .then(res => setTrainList((res.data || res).map(mapApiTrain)))
      .catch(err => setApiError(err.message || 'Lỗi tìm chuyến tàu'))
      .finally(() => setApiLoading(false))
  }, [fromStation, toStation, travelDate])

  // Load sơ đồ ghế cho một toa (có cache)
  const loadCoachSeats = async (train, coach) => {
    const cacheKey = `${train.idChuyen}_${coach.id}`
    if (seatsCache.current[cacheKey]) {
      // Áp dụng từ cache vào selectedTrain
      setSelectedTrain(prev => prev ? {
        ...prev,
        coaches: prev.coaches.map(c => c.id === coach.id ? { ...c, seats: seatsCache.current[cacheKey] } : c)
      } : prev)
      return
    }
    setLoadingCoachId(coach.id)
    try {
      const res = await getSeatMapApi(train.idChuyen, coach.id, train.gaDiId, train.gaDenId)
      const rawSeats = (res.data || res).seats || []
      const mapped = rawSeats.map(s => mapApiSeat(s, coach.type))
      seatsCache.current[cacheKey] = mapped
      setSelectedTrain(prev => prev ? {
        ...prev,
        coaches: prev.coaches.map(c => c.id === coach.id ? { ...c, seats: mapped } : c)
      } : prev)
    } catch (err) {
      console.error('Lỗi load ghế:', err)
    } finally {
      setLoadingCoachId(null)
    }
  }

  const handleSelectTrain = async (train) => {
    setSelectedTrain(train)
    setSelectedCoachId(train.coaches[0]?.id ?? null)
    setSelectedSeats([])
    setMode('seat')
    if (train.coaches[0]) await loadCoachSeats(train, train.coaches[0])
  }

  const handleCoachChange = async (coach) => {
    setSelectedCoachId(coach.id)
    if (selectedTrain) await loadCoachSeats(selectedTrain, coach)
  }

  const handleSeatSelect = (seat) => {
    if (seat.status !== 'empty') return
    const coachId = selectedCoachId
    const coach = selectedTrain?.coaches.find(c => c.id === coachId)
    const existingIdx = selectedSeats.findIndex(s => s.coachId === coachId && s.seat.number === seat.number)
    if (existingIdx >= 0) {
      setSelectedSeats(prev => prev.filter((_, i) => i !== existingIdx))
    } else if (selectedSeats.length < legTotal) {      // dùng legTotal thay vì totalPassengers
      setSelectedSeats(prev => [...prev, {
        coachId,
        coachName: coach?.name || '',
        coachType: coach?.type || COACH_TYPE.NMCLC,
        seat,
      }])
    }
  }

  const handleConfirm = async () => {
    if (selectedSeats.length !== legTotal) return

    const passengerSeats = selectedSeats.map((s, idx) => {
      const basePrice    = s.seat.price * 1000
      const pType        = getPassengerType(idx, legAdults, legElderly, legStudent)
      const discountRate = DISCOUNT[pType]
      return {
        coachId:       s.coachId,
        coachName:     s.coachName,
        coachType:     s.coachType,
        seatNumber:    s.seat.number,
        soToaThuTu:    s.coachId,
        basePrice,
        seatPrice:     Math.round(basePrice * (1 - discountRate)),
        isChild:       pType === 'child',
        isElderly:     pType === 'elderly',
        isStudent:     pType === 'student',
        passengerType: pType,
      }
    })
    const totalPrice = passengerSeats.reduce((s, p) => s + p.seatPrice, 0)

    // Xóa cache toa đã chọn để lần sau reload từ API
    const heldCoachIds = [...new Set(selectedSeats.map(s => s.coachId))]
    heldCoachIds.forEach(id => {
      delete seatsCache.current[`${selectedTrain.idChuyen}_${id}`]
    })

    // ── Chiều đi của vé khứ hồi: KHÔNG giữ ghế ngay ──────────────
    // Chỉ lưu thông tin, hold cả 2 chuyến cùng lúc khi xác nhận chiều về
    if (isRoundTrip && !isReturnTrip) {
      onComplete(selectedTrain, passengerSeats, totalPrice, null, null, legAdults, legChildren, legElderly, legStudent)
      return
    }

    // ── Chiều về (hoặc vé 1 chiều): giữ ghế qua API ──────────────
    setConfirmLoading(true)
    setConfirmError(null)
    try {
      // Tập hợp tất cả chuyến cần hold
      const tripsToHold = []

      // Nếu là chiều về khứ hồi → hold chiều đi đồng thời
      if (isRoundTrip && isReturnTrip && depIdChuyen && depPassengerSeats?.length) {
        tripsToHold.push({
          idChuyen:       depIdChuyen,
          idGaLen:        depGaDiId,   // ga lên của chiều đi
          idGaXuong:      depGaDenId,  // ga xuống của chiều đi
          passengerSeats: depPassengerSeats.map(ps => ({
            soToaThuTu: ps.soToaThuTu,
            seatNumber: ps.seatNumber,
          })),
        })
      }

      // Chuyến hiện tại (chiều về hoặc vé 1 chiều) — gửi kèm ga để backend check segment đúng
      tripsToHold.push({
        idChuyen:       selectedTrain.idChuyen,
        idGaLen:        selectedTrain.gaDiId,   // id ga đi của tìm kiếm này
        idGaXuong:      selectedTrain.gaDenId,  // id ga đến của tìm kiếm này
        passengerSeats: passengerSeats.map(ps => ({
          soToaThuTu: ps.soToaThuTu,
          seatNumber: ps.seatNumber,
        })),
      })

      const holdRes = await holdSeatsApi({ trips: tripsToHold })
      const { sessionId, hetHan } = holdRes.data || holdRes
      onComplete(selectedTrain, passengerSeats, totalPrice, sessionId, hetHan, legAdults, legChildren, legElderly, legStudent)
    } catch (err) {
      const is409 = err.status === 409 || String(err.message).includes('Ghế đã được đặt')
      setConfirmError(
        is409
          ? 'Một số ghế vừa được người khác đặt. Đang cập nhật lại sơ đồ...'
          : (err.message || 'Không thể giữ chỗ, vui lòng thử lại.')
      )
      setConfirmLoading(false)

      if (is409) {
        // Xóa cache + reload lại seat map để hiện trạng thái thực
        setSelectedSeats([])
        if (selectedTrain) {
          const coachIds = [...new Set(selectedTrain.coaches.map(c => c.id))]
          coachIds.forEach(id => delete seatsCache.current[`${selectedTrain.idChuyen}_${id}`])
          // Reload coach đang xem
          const active = selectedTrain.coaches.find(c => c.id === selectedCoachId) || selectedTrain.coaches[0]
          if (active) {
            setTimeout(() => loadCoachSeats(selectedTrain, active), 300)
          }
        }
      }
    }
  }

  // ─── Chế độ sơ đồ ghế ──────────────────────────────────────────
  if (mode === 'seat' && selectedTrain) {
    return (
      <SeatMap
        train={selectedTrain}
        selectedCoachId={selectedCoachId}
        selectedSeats={selectedSeats}
        loadingCoachId={loadingCoachId}
        totalPassengers={legTotal}
        adultTickets={legAdults}
        elderlyTickets={legElderly}
        studentTickets={legStudent}
        childTickets={legChildren}
        adultMax={adultTickets}
        elderlyMax={elderlyTickets}
        studentMax={studentTickets}
        childMax={childTickets}
        canAdjust={isRoundTrip}
        onAdjust={adjustLeg}
        onCoachChange={handleCoachChange}
        onSeatSelect={handleSeatSelect}
        onConfirm={handleConfirm}
        confirmLoading={confirmLoading}
        confirmError={confirmError}
        onBack={() => setMode('list')}
        isRoundTrip={isRoundTrip}
        isReturnTrip={isReturnTrip}
      />
    )
  }

  // ─── Chế độ danh sách tàu ──────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
        <button onClick={onBack} className="text-gray-500 hover:text-[#8C1D19] text-sm">
          ← {isReturnTrip ? 'Quay lại chọn chiều đi' : 'Tìm chuyến khác'}
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#8C1D19]">{title}</h2>
          <p className="text-sm text-gray-500">
            {fromStation} → {toStation}{travelDate && ` • ${formatDisplayDate(travelDate)}`}
          </p>
        </div>
        <div className="w-24" />
      </div>

      {apiLoading && (
        <div className="bg-white rounded-lg p-12 text-center">
          <FaSpinner className="animate-spin text-4xl text-[#8C1D19] mx-auto mb-3" />
          <p className="text-gray-500">Đang tìm chuyến tàu...</p>
        </div>
      )}

      {apiError && !apiLoading && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-red-500 font-medium mb-3">{apiError}</p>
          <button onClick={onBack} className="text-[#8C1D19] underline text-sm">← Quay lại</button>
        </div>
      )}

      {!apiLoading && !apiError && trainList.length === 0 && (
        <div className="bg-white rounded-lg p-12 text-center">
          <FaTrain className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy chuyến tàu từ {fromStation} đến {toStation}</p>
          <button onClick={onBack} className="mt-4 text-[#8C1D19] underline text-sm">← Quay lại</button>
        </div>
      )}

      {!apiLoading && !apiError && trainList.length > 0 && (
        <div className="space-y-3">
          {trainList.map(train => (
            <div key={train.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-5 gap-3 items-center">
                <div>
                  <div className="text-xs text-gray-500">{train.type}</div>
                  <div className="text-2xl font-bold text-[#8C1D19]">{train.code}</div>
                  {train.daDiQua
                    ? <div className="mt-1 inline-block px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full border border-gray-200">
                        Đã khởi hành
                      </div>
                    : <div className="mt-1 inline-block px-2 py-0.5 bg-orange-50 text-orange-500 text-xs rounded-full border border-orange-200">
                        Còn {train.availableSeats} chỗ
                      </div>
                  }
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{train.departTime}</div>
                  <div className="text-sm text-gray-600">{train.fromStation}</div>
                  <div className="text-xs text-gray-400">{formatDisplayDate(train.departDate)}</div>
                </div>
                <div className="flex flex-col items-center text-gray-400">
                  <div className="text-xs mb-1">{train.duration}</div>
                  <FaArrowRightLong />
                  <div className="text-xs mt-1">Suốt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{train.arriveTime}</div>
                  <div className="text-sm text-gray-600">{train.toStation}</div>
                  <div className="text-xs text-gray-400">{formatDisplayDate(train.arriveDate)}</div>
                </div>
                <div className="text-right">
                  {train.daDiQua ? (
                    <div className="text-center">
                      <div className="text-sm text-gray-400 font-medium bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                        🚆 Tàu đã khởi hành
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Không thể đặt vé</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500">Từ</div>
                      <div className="text-xl font-bold text-[#8C1D19]">{formatPrice(train.priceFrom)}</div>
                      <button onClick={() => handleSelectTrain(train)}
                        className="mt-2 px-4 py-1.5 bg-[#8C1D19] text-white rounded-md text-sm hover:bg-[#6a1613] transition-colors">
                        Chọn chỗ
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                {train.daDiQua
                  ? <span className="text-xs text-gray-400 italic">Chuyến này đã khởi hành — không còn nhận đặt vé</span>
                  : train.coaches.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
                      <span className="text-gray-600">Toa {c.id} - {c.name.replace(`Toa ${c.id}: `, '')}</span>
                      <span className={`font-semibold ${c.availableSeats <= 5 ? 'text-red-500' : 'text-green-600'}`}>{c.availableSeats} chỗ</span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrainSelection