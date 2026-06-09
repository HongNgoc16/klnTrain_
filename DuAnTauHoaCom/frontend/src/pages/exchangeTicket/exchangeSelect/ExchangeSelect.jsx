// pages/exchangeTicket/exchangeSelect/ExchangeSelect.jsx
// Chọn chuyến mới để đổi vé — dùng API thực thay cho data/trains.js
import React, { useState, useRef } from 'react'
import { FaArrowLeft, FaArrowRightLong, FaSpinner } from 'react-icons/fa6'
import { FaCalendarAlt } from 'react-icons/fa'
import { searchTrains as searchTrainsApi, getSeatMap as getSeatMapApi } from '../../../api/trains'
import { formatDate as fmtDate } from '../../../utils/dateUtils'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

// ─── API data mappers ─────────────────────────────────────────────

// Sequelize trả TIME field dạng "1970-01-01T08:00:00.000Z" hoặc string "08:00:00"
const parseTime = (t) => {
  if (!t) return ''
  const s = String(t)
  const m = s.match(/T(\d{2}):(\d{2})/)
  if (m) return `${m[1]}:${m[2]}`
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5)
  return ''
}

// Sequelize trả DATE field dạng "2026-06-05T00:00:00.000Z" hoặc "2026-06-05"
const parseDate = (d) => {
  if (!d) return ''
  const m = String(d).match(/(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ''
}

const computeArriveDate = (departDate, departTime, arriveTime) => {
  if (!departDate || !departTime || !arriveTime) return departDate
  const [dH, dM] = departTime.split(':').map(Number)
  const [aH, aM] = arriveTime.split(':').map(Number)
  if (isNaN(dH) || isNaN(aH)) return departDate
  if (aH * 60 + aM < dH * 60 + dM) {
    const [y, mo, day] = departDate.split('-').map(Number)
    const d = new Date(Date.UTC(y, mo - 1, day + 1))
    return d.toISOString().slice(0, 10)
  }
  return departDate
}

const computeDuration = (departTime, arriveTime, departDate, arriveDate) => {
  if (!departTime || !arriveTime) return ''
  const [dH, dM] = departTime.split(':').map(Number)
  const [aH, aM] = arriveTime.split(':').map(Number)
  if (isNaN(dH) || isNaN(aH)) return ''
  let mins = (aH * 60 + aM) - (dH * 60 + dM)
  if (departDate && arriveDate && arriveDate !== departDate) {
    mins += Math.round((new Date(arriveDate) - new Date(departDate)) / 86400000) * 24 * 60
  }
  if (mins < 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}g ${m}p` : `${m}p`
}

const mapApiTrain = (ct) => {
  const departTime = parseTime(ct.gioKhoiHanh)
  const arriveTime = parseTime(ct.gioDuKienDen)
  const departDate = parseDate(ct.ngayChay)
  const arriveDate = computeArriveDate(departDate, departTime, arriveTime)
  return {
    id:          ct.idChuyen,
    idChuyen:    ct.idChuyen,
    code:        ct.maTau,
    type:        ct.loaiTau || 'Tàu Liên Tỉnh',
    fromStation: ct.gaDi?.ten || '',
    toStation:   ct.gaDen?.ten || '',
    gaDiId:      ct.gaDi?.id,
    gaDenId:     ct.gaDen?.id,
    departTime,
    arriveTime,
    departDate,
    arriveDate,
    duration:    computeDuration(departTime, arriveTime, departDate, arriveDate),
    priceFrom:   ct.priceFrom || 0,
    coaches: (ct.coaches || []).map(c => ({
      id:             c.soToa,
      name:           `Toa ${c.soToa}: ${c.tenLoaiToa}`,
      type:           COACH_TYPE_MAP[c.maLoaiToa] || 'NMCLC',
      maLoaiToa:      c.maLoaiToa,
      availableSeats: c.soChoTrong ?? c.soChoToiDa ?? 0,
      seats:          null,
    })),
  }
}

// Map mã loại toa DB → loại layout sơ đồ ghế (giống TrainSelection)
const COACH_TYPE_MAP = {
  NMCLC: 'NMCLC', NMDH: 'NMCLC', NCDH: 'NMCLC',
  GN6AC: 'GN6AC', GN6DH: 'GN6AC', 'GN6_DH': 'GN6AC',
  GN4AC: 'GN4AC', GN4DH: 'GN4AC', 'GN4_DH': 'GN4AC',
}

const mapApiSeat = (apiSeat) => ({
  number:      apiSeat.soGhe,
  price:       apiSeat.gia != null ? Math.round(apiSeat.gia / 1000) : 0,
  status:      apiSeat.trangThai || 'empty',
  compartment: apiSeat.khoangSo ?? null,
  pos:         apiSeat.ben      ?? null,   // 'A' hoặc 'B'
  tang:        apiSeat.tang     ?? null,   // 'Tren' | 'Giua' | 'Duoi'
})

// ─── Seat button ─────────────────────────────────────────────────

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

// ─── NMCLC: tạo layout động từ dữ liệu thực (giống TrainSelection) ─

const generateSoftSeatRows = (seats) => {
  const totalSeats = seats.length
  if (totalSeats === 0) return []
  const gridTotal = Math.ceil(totalSeats / 8) * 8
  const half = gridTotal / 2
  const numCols = half / 4
  const rowData = [[], [], [], []]
  for (let c = 0; c < numCols; c++) {
    const block = Math.floor(c / 2)
    const inBlock = c % 2
    for (let r = 0; r < 4; r++) {
      const n = inBlock === 0 ? block * 8 + r + 1 : block * 8 + 8 - r
      rowData[r].push(n <= totalSeats ? n : null)
    }
  }
  for (let r = 0; r < 4; r++) rowData[r].push('aisle')
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

const NMCLCSeatMap = ({ seats, selectedNum, onSelect }) => {
  const rows = generateSoftSeatRows(seats)
  return (
    <div className="overflow-x-auto px-2 py-2">
      <div className="min-w-max">
        <div className="space-y-1.5">
          {rows.map((row, i) =>
            row[0] === 'space' ? <div key="space" className="h-2" /> : (
              <div key={i} className="flex justify-center gap-1.5">
                {row.map((item, j) => {
                  if (item === 'aisle') return (
                    <div key={`a-${j}`} className="w-[38px] flex items-center justify-center text-[10px] text-neutral-400">Bàn</div>
                  )
                  const seat = seats.find(s => s.number === item)
                  return <SeatBtn key={item ?? `n-${i}-${j}`} seat={seat || null} selected={seat?.number === selectedNum} onSelect={onSelect} />
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Berth button (GN6AC / GN4AC) ────────────────────────────────

const BerthBtn = ({ berth, selected, onSelect }) => {
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
    <button type="button" disabled={disabled}
      onClick={() => !disabled && onSelect(berth)}
      title={disabled ? (isHeld ? 'Đang giữ' : 'Đã bán') : `Giường ${berth.number} · ${berth.price}K`}
      className={`relative h-[42px] w-[38px] rounded-md border text-center transition-colors ${cls}`}>
      <span className="block text-xs font-bold leading-4">{berth.number}</span>
      {!disabled && <span className="block text-[10px] leading-3">{berth.price}K</span>}
      <span className="absolute -top-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
      <span className="absolute -bottom-[4px] left-1/2 h-1 w-4 -translate-x-1/2 rounded border border-[#cfd5da] bg-white" />
    </button>
  )
}

// GN6AC: dùng tang ('Tren'/'Giua'/'Duoi') + pos ('A'/'B') từ DB
const GN6ACSeatMap = ({ seats, selectedNum, onSelect }) => {
  const maxK = seats.reduce((m, s) => Math.max(m, s.compartment || 0), 0) || 10
  const khoangList = Array.from({ length: maxK }, (_, i) => i + 1)
  const tiers = [
    { label: 'Tầng 3', tang: 'Tren' },
    { label: 'Tầng 2', tang: 'Giua' },
    { label: 'Tầng 1', tang: 'Duoi' },
  ]
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid mb-1" style={{ gridTemplateColumns: `80px repeat(${maxK}, 1fr)` }}>
          <div className="text-xs font-bold text-gray-600 py-1 border-b border-gray-200 text-center">Tầng / K</div>
          {khoangList.map(k => <div key={k} className="text-xs font-bold text-gray-600 py-1 border-b border-gray-200 text-center">K{k}</div>)}
        </div>
        {tiers.map(({ label, tang }) => (
          <div key={tang} className="grid mb-1 items-center" style={{ gridTemplateColumns: `80px repeat(${maxK}, 1fr)` }}>
            <div className="text-[10px] font-semibold text-gray-500 text-right pr-2">{label}</div>
            {khoangList.map(k => {
              const bA = seats.find(s => s.compartment === k && s.tang === tang && s.pos === 'A')
              const bB = seats.find(s => s.compartment === k && s.tang === tang && s.pos === 'B')
              return (
                <div key={k} className="flex justify-center gap-0.5">
                  <BerthBtn berth={bA} selected={bA?.number === selectedNum} onSelect={onSelect} />
                  <BerthBtn berth={bB} selected={bB?.number === selectedNum} onSelect={onSelect} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// GN4AC: dùng tang ('Tren'/'Duoi') + pos ('A'/'B') từ DB
const GN4ACSeatMap = ({ seats, selectedNum, onSelect }) => {
  const maxK = seats.reduce((m, s) => Math.max(m, s.compartment || 0), 0) || 10
  const khoangList = Array.from({ length: maxK }, (_, i) => i + 1)
  const tiers = [
    { label: 'Tầng 2', tang: 'Tren' },
    { label: 'Tầng 1', tang: 'Duoi' },
  ]
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid mb-1" style={{ gridTemplateColumns: `80px repeat(${maxK}, 1fr)` }}>
          <div className="text-xs font-bold text-gray-600 py-1 border-b border-gray-200 text-center">Tầng / K</div>
          {khoangList.map(k => <div key={k} className="text-xs font-bold text-gray-600 py-1 border-b border-gray-200 text-center">K{k}</div>)}
        </div>
        {tiers.map(({ label, tang }) => (
          <div key={tang} className="grid mb-1 items-center" style={{ gridTemplateColumns: `80px repeat(${maxK}, 1fr)` }}>
            <div className="text-[10px] font-semibold text-gray-500 text-right pr-2">{label}</div>
            {khoangList.map(k => {
              const bA = seats.find(s => s.compartment === k && s.tang === tang && s.pos === 'A')
              const bB = seats.find(s => s.compartment === k && s.tang === tang && s.pos === 'B')
              return (
                <div key={k} className="flex justify-center gap-0.5">
                  <BerthBtn berth={bA} selected={bA?.number === selectedNum} onSelect={onSelect} />
                  <BerthBtn berth={bB} selected={bB?.number === selectedNum} onSelect={onSelect} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Coach seat panel ─────────────────────────────────────────────

const CoachSeatPanel = ({ train, selectedCoachId, loadingCoachId, selectedSeat, onCoachChange, onSeatSelect, onConfirm, onBack }) => {
  const coach = train.coaches.find(c => c.id === selectedCoachId) || train.coaches[0]
  const seats = coach?.seats || []
  const coachType = coach?.type || 'NMCLC'
  const seatPrice = selectedSeat ? selectedSeat.price * 1000 : 0

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
        <button onClick={onBack} className="text-gray-500 hover:text-[#8C1D19] text-sm">← Chọn tàu khác</button>
        <div className="text-center">
          <p className="font-bold text-sm">{train.code} · {train.fromStation} → {train.toStation}</p>
          <p className="text-xs text-gray-500">{train.departTime} · {train.duration}</p>
        </div>
        <div className="w-24" />
      </div>

      {/* Coach tabs */}
      <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1">
        {train.coaches.map(c => (
          <button key={c.id} onClick={() => onCoachChange(c)}
            className={`min-w-[160px] rounded-t-lg border px-3 py-2 text-left text-sm shrink-0 transition-colors ${
              c.id === coach?.id
                ? 'border-[#8C1D19] border-t-4 bg-white'
                : 'border-gray-200 border-t-4 border-t-gray-300 bg-gray-50 hover:bg-white'
            }`}>
            <div className="font-medium text-xs truncate">{c.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">Còn {c.availableSeats} chỗ</div>
          </button>
        ))}
      </div>

      {/* Seat map */}
      <div className="overflow-x-auto p-4">
        <p className="text-center font-bold text-sm mb-3 text-gray-700">{coach?.name}</p>
        {loadingCoachId === coach?.id ? (
          <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
            <FaSpinner className="animate-spin text-2xl" />
            <span className="text-sm">Đang tải sơ đồ ghế...</span>
          </div>
        ) : seats.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Không có dữ liệu ghế</div>
        ) : (
          <>
            {coachType === 'NMCLC' && <NMCLCSeatMap seats={seats} selectedNum={selectedSeat?.number} onSelect={onSeatSelect} />}
            {coachType === 'GN6AC' && <GN6ACSeatMap seats={seats} selectedNum={selectedSeat?.number} onSelect={onSeatSelect} />}
            {coachType === 'GN4AC' && <GN4ACSeatMap seats={seats} selectedNum={selectedSeat?.number} onSelect={onSeatSelect} />}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3 flex flex-wrap justify-between items-center gap-3 bg-gray-50">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-300 bg-white inline-block" />Trống</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-300 bg-gray-100 inline-block" />Đã bán</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-yellow-300 bg-yellow-50 inline-block" />Đang giữ</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-[#8C1D19] bg-white inline-block" />Đang chọn</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            {selectedSeat
              ? <><p>Ghế <strong>{selectedSeat.number}</strong> — Toa {coach?.id}</p><p className="text-[#ff8a00] font-semibold">{fmt(seatPrice)}</p></>
              : <p className="text-gray-400">Chưa chọn ghế</p>
            }
          </div>
          <button
            onClick={() => selectedSeat && onConfirm(selectedSeat, coach)}
            disabled={!selectedSeat}
            className={`px-5 py-2 rounded-md font-semibold text-sm transition-colors ${
              selectedSeat ? 'bg-[#ff8a00] text-white hover:bg-[#e07a00]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}>
            Xác nhận ghế →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Component chính ──────────────────────────────────────────────

const ExchangeSelect = ({ chosenTicket, onBack, onContinue }) => {
  const [newDate, setNewDate]               = useState('')
  const [trains, setTrains]                 = useState([])
  const [loadingTrains, setLoadingTrains]   = useState(false)
  const [trainError, setTrainError]         = useState(null)
  const [mode, setMode]                     = useState('list')
  const [selectedTrain, setSelectedTrain]   = useState(null)
  const [selectedCoachId, setSelectedCoachId] = useState(null)
  const [loadingCoachId, setLoadingCoachId] = useState(null)
  const [selectedSeat, setSelectedSeat]     = useState(null)
  const seatsCache = useRef({})
  const dateInputRef = useRef(null)

  const { trip: oldTrip, passenger: oldPassenger } = chosenTicket
  const today = new Date().toISOString().split('T')[0]

  const handleDateChange = async (date) => {
    setNewDate(date)
    setMode('list')
    setSelectedTrain(null)
    setSelectedSeat(null)
    setTrains([])
    setTrainError(null)
    if (!date) return

    setLoadingTrains(true)
    try {
      const res = await searchTrainsApi(oldTrip.fromStation, oldTrip.toStation, date)
      const data = res.data || res
      const list = Array.isArray(data) ? data : (data.chuyenDi || [])
      setTrains(list.map(mapApiTrain))
    } catch (err) {
      setTrainError(err.message || 'Không thể tải danh sách tàu')
    } finally {
      setLoadingTrains(false)
    }
  }

  const loadCoachSeats = async (train, coach) => {
    const key = `${train.idChuyen}_${coach.id}`
    if (seatsCache.current[key]) return seatsCache.current[key]

    setLoadingCoachId(coach.id)
    try {
      const res = await getSeatMapApi(train.idChuyen, coach.id, train.gaDiId, train.gaDenId)
      const data = res.data || res
      const seats = (data.seats || []).map(mapApiSeat)
      // Dùng COACH_TYPE_MAP để normalize mã loại toa từ DB
      const rawType = data.loaiToa?.ma_loai_toa || coach.maLoaiToa || coach.type || 'NMCLC'
      const coachType = COACH_TYPE_MAP[rawType] || 'NMCLC'
      seatsCache.current[key] = seats
      setSelectedTrain(prev => {
        if (!prev || prev.idChuyen !== train.idChuyen) return prev
        return {
          ...prev,
          coaches: prev.coaches.map(c =>
            c.id === coach.id ? { ...c, seats, type: coachType } : c
          ),
        }
      })
      return seats
    } catch (err) {
      console.error('loadCoachSeats error:', err)
      setTrainError('Không thể tải sơ đồ ghế: ' + (err.message || 'Lỗi không xác định'))
    } finally {
      setLoadingCoachId(null)
    }
  }

  const handleSelectTrain = async (train) => {
    setSelectedTrain(train)
    setMode('seats')
    setSelectedSeat(null)
    setTrainError(null)
    const firstCoach = train.coaches[0]
    setSelectedCoachId(firstCoach?.id ?? null)
    if (firstCoach) await loadCoachSeats(train, firstCoach)
  }

  const handleCoachChange = async (coach) => {
    setSelectedCoachId(coach.id)
    setSelectedSeat(null)
    if (selectedTrain) await loadCoachSeats(selectedTrain, coach)
  }

  const handleSeatSelect = (seat) => {
    setSelectedSeat(prev => prev?.number === seat.number ? null : seat)
  }

  const handleConfirmSeat = (seat, coach) => {
    onContinue({
      train: { ...selectedTrain, departDate: newDate },
      coach: { id: coach.id, name: coach.name },
      seatNumber: seat.number,
      seatPrice:  seat.price * 1000,
      newDate,
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5 transition-colors">
        <FaArrowLeft /> Quay lại chọn vé
      </button>

      {/* Vé cũ */}
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

      {/* Bước 1: Chọn ngày */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h3 className="font-bold text-gray-800 border-l-4 border-[#ff8a00] pl-3 mb-4">
          Bước 1: Chọn ngày đi mới
        </h3>
        <div className="relative max-w-xs h-[42px] rounded-lg border border-gray-300 overflow-hidden">
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
            onClick={() => { dateInputRef.current?.showPicker?.(); dateInputRef.current?.focus() }}>
            <FaCalendarAlt />
          </button>
          <div className="absolute inset-0 flex items-center pl-10 pr-3 bg-white pointer-events-none select-none">
            {newDate
              ? <span className="text-neutral-900">{newDate.slice(8,10)}/{newDate.slice(5,7)}/{newDate.slice(0,4)}</span>
              : <span className="text-gray-400">DD/MM/YYYY</span>
            }
          </div>
          <input
            ref={dateInputRef}
            type="date"
            value={newDate}
            min={today}
            onChange={e => handleDateChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer outline-none"
          />
        </div>
        {newDate && (
          <p className="text-sm text-gray-500 mt-2">
            Tuyến: <strong>{oldTrip.fromStation} → {oldTrip.toStation}</strong> ngày <strong>{fmtDate(newDate)}</strong>
          </p>
        )}
      </div>

      {/* Bước 2: Chọn tàu */}
      {newDate && mode === 'list' && (
        <div className="bg-white rounded-lg shadow-md p-5 mb-4">
          <h3 className="font-bold text-gray-800 border-l-4 border-[#ff8a00] pl-3 mb-4">
            Bước 2: Chọn chuyến tàu mới
          </h3>
          {loadingTrains ? (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
              <FaSpinner className="animate-spin text-2xl" />
              <span className="text-sm">Đang tìm chuyến...</span>
            </div>
          ) : trainError ? (
            <p className="text-center text-red-500 text-sm py-6">{trainError}</p>
          ) : trains.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Không có chuyến tàu cho tuyến {oldTrip.fromStation} → {oldTrip.toStation}
            </p>
          ) : (
            <div className="space-y-3">
              {trains.map(train => {
                const diff = train.priceFrom - oldPassenger.price
                const totalSeats = train.coaches.reduce((s, c) => s + c.availableSeats, 0)
                return (
                  <div key={train.idChuyen}
                    className="border border-gray-200 rounded-lg p-4 flex flex-wrap sm:grid sm:grid-cols-5 gap-3 items-center hover:border-[#8C1D19]/40 transition-colors">
                    <div>
                      <p className="text-xs text-gray-500">{train.type}</p>
                      <p className="text-xl font-bold">{train.code}</p>
                      <p className="text-xs mt-1 inline-block px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full">
                        Còn {totalSeats} chỗ
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{train.fromStation}</p>
                      <p className="text-xl font-bold">{train.departTime}</p>
                      <p className="text-xs text-gray-400">{fmtDate(newDate)}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-400">{train.duration}</p>
                      <FaArrowRightLong className="text-gray-400 mt-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{train.toStation}</p>
                      <p className="text-xl font-bold">{train.arriveTime}</p>
                    </div>
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

      {/* Bước 3: Chọn toa / ghế */}
      {mode === 'seats' && selectedTrain && (
        <div className="mb-4">
          <h3 className="font-bold text-gray-800 border-l-4 border-[#ff8a00] pl-3 mb-4">
            Bước 3: Chọn toa và ghế
          </h3>
          <CoachSeatPanel
            train={selectedTrain}
            selectedCoachId={selectedCoachId}
            loadingCoachId={loadingCoachId}
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
