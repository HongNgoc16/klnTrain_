// pages/trainSchedule/components/SearchForm.jsx
import React, { useRef, useState, useEffect } from 'react'
import { FaMagnifyingGlass, FaCalendarDays, FaTrainSubway, FaArrowsLeftRight } from 'react-icons/fa6'
import { getStations } from '../../../api/trains'

const SearchForm = ({ onSearch }) => {
  const dateRef = useRef(null)
  const [stations, setStations]       = useState([])
  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation]     = useState('')
  const [date, setDate]               = useState('')
  const [fromInput, setFromInput]     = useState('')
  const [toInput, setToInput]         = useState('')
  const [showFromSug, setShowFromSug] = useState(false)
  const [showToSug, setShowToSug]     = useState(false)
  const [errors, setErrors]           = useState({})

  useEffect(() => {
    getStations()
      .then(data => setStations(Array.isArray(data) ? data : data?.data || []))
      .catch(() => {})
  }, [])

  const filteredFrom = stations
    .filter(s => s.ten_ga !== toStation && s.ten_ga?.toLowerCase().includes(fromInput.toLowerCase()))
    .slice(0, 10)

  const filteredTo = stations
    .filter(s => s.ten_ga !== fromStation && s.ten_ga?.toLowerCase().includes(toInput.toLowerCase()))
    .slice(0, 10)

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!fromStation) errs.fromStation = 'Vui lòng chọn ga đi'
    if (!toStation)   errs.toStation   = 'Vui lòng chọn ga đến'
    if (fromStation && toStation && fromStation === toStation) errs.toStation = 'Ga đến phải khác ga đi'
    if (!date)        errs.date        = 'Vui lòng chọn ngày đi'
    setErrors(errs)
    if (Object.keys(errs).length) return
    onSearch({ fromStation, toStation, date })
  }

  const handleSwap = () => {
    setFromStation(toStation); setFromInput(toInput)
    setToStation(fromStation); setToInput(fromInput)
  }

  const pickFrom = (s) => { setFromStation(s.ten_ga); setFromInput(s.ten_ga); setShowFromSug(false); setErrors(p => ({ ...p, fromStation: '' })) }
  const pickTo   = (s) => { setToStation(s.ten_ga);   setToInput(s.ten_ga);   setShowToSug(false);   setErrors(p => ({ ...p, toStation: '' })) }

  const inputCls = (field) =>
    `h-11 w-full rounded-md bg-white pl-10 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#FFD15A] ${errors[field] ? 'border-2 border-red-500' : ''}`

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <form onSubmit={handleSubmit}
        className="w-full rounded-md bg-[#FDF2D6]/90 p-5 shadow-xl">

        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-[#8C1D19]">LỊCH TÀU – GIÁ VÉ</h2>
          <p className="text-[#8C1D19]/70 text-xs">Tìm kiếm lịch chạy tàu và xem giá vé</p>
        </div>

        {/* Ga đi */}
        <div className="relative mb-3">
          <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 z-10" />
          <input type="text" value={fromInput}
            onChange={e => { setFromInput(e.target.value); setFromStation(e.target.value); setShowFromSug(true); setErrors(p => ({ ...p, fromStation: '' })) }}
            onFocus={() => setShowFromSug(true)}
            onBlur={() => setTimeout(() => setShowFromSug(false), 200)}
            placeholder="Nhập hoặc chọn ga đi..."
            className={inputCls('fromStation')} />
          {showFromSug && filteredFrom.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredFrom.map(s => (
                <div key={s.id_ga} className="px-3 py-2 hover:bg-[#FDF2D6] cursor-pointer text-sm text-neutral-800"
                  onMouseDown={() => pickFrom(s)}>
                  {s.ten_ga}
                </div>
              ))}
            </div>
          )}
          {errors.fromStation && <p className="text-red-600 text-xs mt-1">{errors.fromStation}</p>}
        </div>

        {/* Swap */}
        <div className="flex justify-center mb-3">
          <button type="button" onClick={handleSwap}
            className="flex items-center gap-1.5 text-xs text-[#8C1D19] font-medium hover:underline">
            <FaArrowsLeftRight className="h-3 w-3 rotate-90" />
            Đổi ga đi và ga đến
          </button>
        </div>

        {/* Ga đến */}
        <div className="relative mb-3">
          <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 z-10" />
          <input type="text" value={toInput}
            onChange={e => { setToInput(e.target.value); setToStation(e.target.value); setShowToSug(true); setErrors(p => ({ ...p, toStation: '' })) }}
            onFocus={() => setShowToSug(true)}
            onBlur={() => setTimeout(() => setShowToSug(false), 200)}
            placeholder="Nhập hoặc chọn ga đến..."
            className={inputCls('toStation')} />
          {showToSug && filteredTo.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredTo.map(s => (
                <div key={s.id_ga} className="px-3 py-2 hover:bg-[#FDF2D6] cursor-pointer text-sm text-neutral-800"
                  onMouseDown={() => pickTo(s)}>
                  {s.ten_ga}
                </div>
              ))}
            </div>
          )}
          {errors.toStation && <p className="text-red-600 text-xs mt-1">{errors.toStation}</p>}
        </div>

        {/* Ngày đi */}
        <div className="mb-4">
          <div className={`relative h-11 rounded-md overflow-hidden ${errors.date ? 'border-2 border-red-500' : ''}`}>
            <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 z-10"
              onClick={() => { dateRef.current?.showPicker?.(); dateRef.current?.focus() }}>
              <FaCalendarDays className="h-4 w-4" />
            </button>
            <div className="absolute inset-0 flex items-center pl-10 pr-3 bg-white pointer-events-none select-none">
              {date
                ? <span className="text-sm text-neutral-900">{date.slice(8,10)}/{date.slice(5,7)}/{date.slice(0,4)}</span>
                : <span className="text-sm text-neutral-400">Ngày đi</span>
              }
            </div>
            <input ref={dateRef} type="date" value={date}
              onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer outline-none" />
          </div>
          {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Nút tìm kiếm */}
        <button type="submit"
          className="w-full flex h-11 items-center justify-center gap-2 rounded-md bg-[#FFD15A] text-sm font-bold text-[#8C1D19] hover:bg-[#ffe082] transition-colors">
          <FaMagnifyingGlass className="h-4 w-4" />
          Tìm kiếm
        </button>

        <div className="mt-3 border-t border-amber-300/40 pt-2 text-center">
          <p className="text-[#8C1D19] text-xs">THE KLN TRAIN — #Hành trình trở về</p>
        </div>
      </form>
    </div>
  )
}

export default SearchForm
