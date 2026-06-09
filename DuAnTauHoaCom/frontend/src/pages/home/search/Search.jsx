import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowsLeftRight, FaCalendarDays, FaMagnifyingGlass,
  FaMinus, FaPlus, FaTrainSubway, FaUsers, FaChevronDown,
} from 'react-icons/fa6'
import { getStations } from '../../../api/trains'

const MAX_TICKETS = 4

const DatePickerInput = ({ value, onChange, disabled, min, placeholder }) => {
  const nativeRef = useRef(null)
  const display = value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : ''
  const triggerPicker = () => { if (disabled) return; nativeRef.current?.showPicker?.(); nativeRef.current?.focus() }
  return (
    <div className={`relative h-11 overflow-hidden rounded-lg border transition-colors ${disabled ? 'border-gray-200 bg-gray-100/80' : 'border-amber-200 bg-white hover:border-[#FFD15A] focus-within:border-[#FFD15A]'}`}>
      <button type="button" className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" onClick={triggerPicker} tabIndex={-1}>
        <FaCalendarDays className="h-3.5 w-3.5" />
      </button>
      <div className="absolute inset-0 flex items-center pl-9 pr-3 pointer-events-none select-none">
        {display ? <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-neutral-800'}`}>{display}</span>
                 : <span className="text-gray-400 text-sm">{placeholder || 'DD/MM/YYYY'}</span>}
      </div>
      <input ref={nativeRef} type="date" value={value} onChange={onChange} disabled={disabled} min={min}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed outline-none" />
    </div>
  )
}

const Search = () => {
  const navigate = useNavigate()
  const ticketBoxRef = useRef(null)

  const [stations, setStations]             = useState([])
  const [fromStation, setFromStation]       = useState('')
  const [toStation, setToStation]           = useState('')
  const [departureDate, setDepartureDate]   = useState('')
  const [returnDate, setReturnDate]         = useState('')
  const [tripType, setTripType]             = useState('one-way')
  const [adultTickets, setAdultTickets]     = useState(1)
  const [childTickets, setChildTickets]     = useState(0)
  const [elderlyTickets, setElderlyTickets] = useState(0)
  const [studentTickets, setStudentTickets] = useState(0)
  const [showTicketBox, setShowTicketBox]   = useState(false)

  const ticketTotal = adultTickets + childTickets + elderlyTickets + studentTickets

  useEffect(() => {
    getStations().then(data => setStations(Array.isArray(data) ? data : data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!showTicketBox) return
    const handler = (e) => { if (ticketBoxRef.current && !ticketBoxRef.current.contains(e.target)) setShowTicketBox(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showTicketBox])

  const handleSwapStation = () => { setFromStation(toStation); setToStation(fromStation) }

  const setters = { adult: setAdultTickets, child: setChildTickets, elderly: setElderlyTickets, student: setStudentTickets }
  const counts  = { adult: adultTickets, child: childTickets, elderly: elderlyTickets, student: studentTickets }

  const changeTicketCount = (type, step) => {
    setters[type](prev => {
      const next = Math.max(type === 'adult' ? 1 : 0, prev + step)
      const otherTotal = ticketTotal - counts[type]
      return otherTotal + next > MAX_TICKETS ? prev : next
    })
  }

  const fromOptions = stations.filter(s => s.ten_ga !== toStation)
  const toOptions   = stations.filter(s => s.ten_ga !== fromStation)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/tim-ve', {
      state: { fromStation, toStation, departureDate, returnDate, tripType,
               adultTickets, childTickets, elderlyTickets, studentTickets, ticketTotal },
    })
  }

  const ROWS = [
    { key: 'adult',   label: 'Người lớn',    sub: 'Từ 10 – 59 tuổi',       badge: null,    count: adultTickets,   min: 1 },
    { key: 'elderly', label: 'Người cao tuổi',sub: 'Từ 60 tuổi',            badge: '-15%',  count: elderlyTickets, min: 0 },
    { key: 'student', label: 'Sinh viên',     sub: 'Thẻ SV hợp lệ',         badge: '-10%',  count: studentTickets, min: 0 },
    { key: 'child',   label: 'Trẻ em',        sub: '6 – 9 tuổi',            badge: '-25%',  count: childTickets,   min: 0 },
  ]

  return (
    <form className="w-full max-w-sm rounded-md bg-[#FDF2D6]/90 p-5 shadow-xl sm:max-w-[420px]" onSubmit={handleSubmit}>
      {/* Trip type */}
      <div className="mb-4 flex items-center gap-6 pb-3 border-b border-[#8C1D19]/20">
        {['one-way', 'round-trip'].map((type) => (
          <label key={type} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#8C1D19]">
            <input type="radio" name="tripType" checked={tripType === type}
              onChange={() => setTripType(type)} className="h-4 w-4 accent-[#8C1D19]" />
            {type === 'one-way' ? 'Một chiều' : 'Khứ hồi'}
          </label>
        ))}
      </div>

      {/* Stations */}
      <div className="relative flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2">
        <div className="relative">
          <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 z-10" />
          <select value={fromStation} onChange={(e) => setFromStation(e.target.value)}
            className="h-11 w-full rounded-lg border border-amber-200 bg-white pl-9 pr-3 text-sm text-neutral-800 outline-none transition-colors hover:border-white focus:ring-2 focus:ring-[#FFD15A] cursor-pointer appearance-none">
            <option value="" disabled>Ga đi</option>
            {fromOptions.map((s) => <option key={s.id_ga} value={s.ten_ga}>{s.ten_ga}</option>)}
          </select>
        </div>
        <button type="button" onClick={handleSwapStation}
          className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#8C1D19] shadow transition-all hover:bg-white hover:scale-110 sm:static sm:translate-y-0 sm:rounded-full sm:h-9 sm:w-9">
          <FaArrowsLeftRight className="h-3.5 w-3.5 rotate-90 sm:rotate-0" />
        </button>
        <div className="relative">
          <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 z-10" />
          <select value={toStation} onChange={(e) => setToStation(e.target.value)}
            className="h-11 w-full rounded-lg border border-amber-200 bg-white pl-9 pr-3 text-sm text-neutral-800 outline-none transition-colors hover:border-white focus:ring-2 focus:ring-[#FFD15A] cursor-pointer appearance-none">
            <option value="" disabled>Ga đến</option>
            {toOptions.map((s) => <option key={s.id_ga} value={s.ten_ga}>{s.ten_ga}</option>)}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <DatePickerInput value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} placeholder="Ngày đi" min={new Date().toISOString().slice(0, 10)} />
        <DatePickerInput value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={tripType === 'one-way'} placeholder="Ngày về" min={departureDate || new Date().toISOString().slice(0, 10)} />
      </div>

      {/* Ticket count */}
      <div className="mt-3" ref={ticketBoxRef}>
        <button type="button"
          className="flex h-11 w-full items-center justify-between rounded-lg border border-amber-200 bg-white px-3 text-sm text-neutral-800 transition-colors hover:border-white focus:ring-2 focus:ring-[#FFD15A] outline-none"
          onClick={() => setShowTicketBox(v => !v)}>
          <span className="flex items-center gap-2"><FaUsers className="h-4 w-4 text-gray-500" />Hành khách</span>
          <span className="flex items-center gap-1.5 font-semibold text-[#8C1D19]">
            {ticketTotal} người
            <FaChevronDown className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${showTicketBox ? 'rotate-180' : ''}`} />
          </span>
        </button>

        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${showTicketBox ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
          <div className="rounded-lg border border-amber-200 bg-white px-4 py-3 shadow-lg">
            <p className="mb-2 text-xs text-gray-400">Tối đa {MAX_TICKETS} vé / lần đặt</p>
            {ROWS.map(({ key, label, sub, badge, count, min }) => (
              <div key={key} className="flex items-center justify-between py-1.5 [&:not(:last-child)]:border-b border-gray-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-neutral-800">{label}</span>
                  <span className="text-xs text-gray-400">{sub}</span>
                  {badge && <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded px-1">{badge}</span>}
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    onClick={() => changeTicketCount(key, -1)} disabled={count <= min}>
                    <FaMinus className="h-2.5 w-2.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-neutral-900">{count}</span>
                  <button type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    onClick={() => changeTicketCount(key, 1)} disabled={ticketTotal >= MAX_TICKETS}>
                    <FaPlus className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button type="submit"
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FFD15A] text-sm font-bold text-[#8C1D19] shadow-md transition-all hover:bg-[#ffe07a] hover:shadow-lg active:scale-[0.98]">
        <FaMagnifyingGlass className="h-4 w-4" />
        Tìm kiếm chuyến tàu
      </button>
    </form>
  )
}

export default Search
