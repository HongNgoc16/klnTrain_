import React, { useRef, useState, useEffect } from 'react'
import {
  FaArrowsLeftRight, FaCalendarDays, FaMagnifyingGlass,
  FaMinus, FaPlus, FaTrainSubway, FaUsers,
} from 'react-icons/fa6'
import { getStations } from '../../../api/trains'

const MAX_TICKETS = 4

const SearchForm = ({ onSearch, initialValues = {} }) => {
  const departureDateRef = useRef(null)
  const returnDateRef    = useRef(null)
  const ticketBoxRef     = useRef(null)

  const [stations, setStations]             = useState([])
  const [fromStation, setFromStation]       = useState(initialValues.fromStation   || '')
  const [toStation, setToStation]           = useState(initialValues.toStation     || '')
  const [departureDate, setDepartureDate]   = useState(initialValues.departureDate || '')
  const [returnDate, setReturnDate]         = useState(initialValues.returnDate    || '')
  const [tripType, setTripType]             = useState(initialValues.tripType      || 'one-way')
  const [adultTickets, setAdultTickets]     = useState(initialValues.adultTickets     || 1)
  const [childTickets, setChildTickets]     = useState(initialValues.childTickets     || 0)
  const [elderlyTickets, setElderlyTickets] = useState(initialValues.elderlyTickets   || 0)
  const [studentTickets, setStudentTickets] = useState(initialValues.studentTickets   || 0)
  const [showTicketBox, setShowTicketBox]   = useState(false)
  const [errors, setErrors]                 = useState({})

  const ticketTotal = adultTickets + childTickets + elderlyTickets + studentTickets

  useEffect(() => {
    getStations().then(data => setStations(Array.isArray(data) ? data : data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!showTicketBox) return
    const handleClickOutside = (e) => {
      if (ticketBoxRef.current && !ticketBoxRef.current.contains(e.target)) setShowTicketBox(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTicketBox])

  const openCalendar = (ref) => { ref.current?.showPicker?.(); ref.current?.focus() }
  const handleSwap   = () => { setFromStation(toStation); setToStation(fromStation) }

  const setters = { adult: setAdultTickets, child: setChildTickets, elderly: setElderlyTickets, student: setStudentTickets }
  const counts  = { adult: adultTickets, child: childTickets, elderly: elderlyTickets, student: studentTickets }

  const changeTicketCount = (type, step) => {
    setters[type](prev => {
      const next = Math.max(type === 'adult' ? 1 : 0, prev + step)
      const otherTotal = ticketTotal - counts[type]
      return otherTotal + next > MAX_TICKETS ? prev : next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!fromStation)   newErrors.fromStation   = 'Vui lòng chọn ga đi'
    if (!toStation)     newErrors.toStation     = 'Vui lòng chọn ga đến'
    if (fromStation && toStation && fromStation === toStation) newErrors.toStation = 'Ga đến phải khác ga đi'
    if (!departureDate) newErrors.departureDate = 'Vui lòng chọn ngày đi'
    if (tripType === 'round-trip' && !returnDate) newErrors.returnDate = 'Vui lòng chọn ngày về'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    onSearch({
      fromStation, toStation, departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      tripType,
      adultTickets, childTickets, elderlyTickets, studentTickets,
      ticketTotal,
    })
  }

  const today       = new Date().toISOString().slice(0, 10)
  const fromOptions = stations.filter(s => s.ten_ga !== toStation)
  const toOptions   = stations.filter(s => s.ten_ga !== fromStation)

  const inputCls = (field) =>
    `h-11 w-full rounded-md bg-white pl-10 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#FFD15A] ${errors[field] ? 'border-2 border-red-500' : ''}`

  const ROWS = [
    { key: 'adult',   label: 'Người lớn',     sub: 'Từ 10 – 59 tuổi',  badge: null,   count: adultTickets,   minV: 1 },
    { key: 'elderly', label: 'Người cao tuổi', sub: 'Từ 60 tuổi',       badge: '-15%', count: elderlyTickets, minV: 0 },
    { key: 'student', label: 'Sinh viên',      sub: 'Thẻ SV hợp lệ',    badge: '-10%', count: studentTickets, minV: 0 },
    { key: 'child',   label: 'Trẻ em',         sub: '6 – 9 tuổi',       badge: '-25%', count: childTickets,   minV: 0 },
  ]

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <form className="w-full rounded-md bg-[#FDF2D6]/90 p-5 shadow-xl" onSubmit={handleSubmit}>

        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-[#8C1D19]">TÌM VÉ TÀU</h2>
          <p className="text-[#8C1D19]/70 text-xs">Nhập thông tin hành trình để tìm chuyến</p>
        </div>

        {/* Loại chuyến */}
        <div className="flex items-center gap-6 pb-3 mb-3 border-b border-[#8C1D19]/20">
          {[{ val: 'one-way', label: 'Một chiều' }, { val: 'round-trip', label: 'Khứ hồi' }].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="tripType" checked={tripType === val}
                onChange={() => setTripType(val)} className="h-4 w-4 accent-[#8C1D19]" />
              <span className="text-[#8C1D19] font-medium text-sm">{label}</span>
            </label>
          ))}
        </div>

        {/* Ga đi / Ga đến */}
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start mb-3">
          <div className="flex-1">
            <div className="relative">
              <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 z-10" />
              <select value={fromStation}
                onChange={e => { setFromStation(e.target.value); setErrors(p => ({ ...p, fromStation: '' })) }}
                className={inputCls('fromStation')}>
                <option value="" disabled>Chọn ga đi</option>
                {fromOptions.map(s => <option key={s.id_ga} value={s.ten_ga}>{s.ten_ga}</option>)}
              </select>
            </div>
            {errors.fromStation && <p className="text-red-600 text-xs mt-1">{errors.fromStation}</p>}
          </div>

          <button type="button" onClick={handleSwap}
            className="self-center flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-amber-300 shadow-sm hover:bg-[#FDF2D6] transition-colors">
            <FaArrowsLeftRight className="h-3 w-3 rotate-90 sm:rotate-0 text-[#8C1D19]" />
          </button>

          <div className="flex-1">
            <div className="relative">
              <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 z-10" />
              <select value={toStation}
                onChange={e => { setToStation(e.target.value); setErrors(p => ({ ...p, toStation: '' })) }}
                className={inputCls('toStation')}>
                <option value="" disabled>Chọn ga đến</option>
                {toOptions.map(s => <option key={s.id_ga} value={s.ten_ga}>{s.ten_ga}</option>)}
              </select>
            </div>
            {errors.toStation && <p className="text-red-600 text-xs mt-1">{errors.toStation}</p>}
          </div>
        </div>

        {/* Ngày đi / Ngày về */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { ref: departureDateRef, val: departureDate, field: 'departureDate', min: today, placeholder: 'Ngày đi',
              onChange: e => { setDepartureDate(e.target.value); setErrors(p => ({ ...p, departureDate: '' })) }, disabled: false },
            { ref: returnDateRef, val: returnDate, field: 'returnDate', min: departureDate || today, placeholder: 'Ngày về',
              onChange: e => { setReturnDate(e.target.value); setErrors(p => ({ ...p, returnDate: '' })) }, disabled: tripType === 'one-way' },
          ].map(({ ref, val, field, min, placeholder, onChange, disabled }) => (
            <div key={field}>
              <div className={`relative h-11 rounded-md overflow-hidden ${errors[field] ? 'border-2 border-red-500' : ''} ${disabled ? 'opacity-60' : ''}`}>
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 z-10"
                  onClick={() => openCalendar(ref)}>
                  <FaCalendarDays className="h-4 w-4" />
                </button>
                <div className="absolute inset-0 flex items-center pl-10 pr-3 bg-white pointer-events-none select-none">
                  {val && !disabled
                    ? <span className="text-sm text-neutral-900">{val.slice(8,10)}/{val.slice(5,7)}/{val.slice(0,4)}</span>
                    : <span className="text-sm text-neutral-400">{placeholder}</span>}
                </div>
                <input ref={ref} type="date" value={val} min={min} disabled={disabled} onChange={onChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed outline-none" />
              </div>
              {errors[field] && <p className="text-red-600 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>

        {/* Số lượng vé */}
        <div ref={ticketBoxRef} className="mb-4">
          <button type="button" onClick={() => setShowTicketBox(v => !v)}
            className="flex items-center justify-between w-full h-11 px-4 rounded-md bg-white text-sm outline-none focus:ring-2 focus:ring-[#FFD15A] hover:ring-2 hover:ring-[#FFD15A] transition-all">
            <span className="flex items-center gap-2 text-neutral-500">
              <FaUsers className="h-4 w-4" />Hành khách
            </span>
            <span className="font-semibold text-[#8C1D19]">{ticketTotal} / {MAX_TICKETS}</span>
          </button>

          {showTicketBox && (
            <div className="mt-1 rounded-md border border-amber-200 bg-white/95 px-4 pb-4 pt-3 shadow-lg">
              <p className="text-xs text-gray-400 mb-3">Tối đa {MAX_TICKETS} vé mỗi lần đặt</p>
              {ROWS.map(({ key, label, sub, badge, count, minV }) => (
                <div key={key} className="flex items-center justify-between mt-3 first:mt-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-neutral-900 text-sm">{label}</span>
                    <span className="text-xs text-gray-400">{sub}</span>
                    {badge && <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded px-1">{badge}</span>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button type="button" onClick={() => changeTicketCount(key, -1)} disabled={count <= minV}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900">{count}</span>
                    <button type="button" onClick={() => changeTicketCount(key, 1)} disabled={ticketTotal >= MAX_TICKETS}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit"
          className="w-full flex h-11 items-center justify-center gap-2 rounded-md bg-[#FFD15A] text-sm font-bold text-[#8C1D19] hover:bg-[#ffe082] transition-colors">
          <FaMagnifyingGlass className="h-4 w-4" />
          Tìm kiếm chuyến
        </button>

        <div className="mt-3 border-t border-amber-300/40 pt-2 text-center">
          <p className="text-[#8C1D19] text-xs">THE KLN TRAIN — #Hành trình trở về</p>
        </div>
      </form>
    </div>
  )
}

export default SearchForm
