import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowsLeftRight,
  FaCalendarDays,
  FaMagnifyingGlass,
  FaMinus,
  FaPlus,
  FaTrainSubway,
  FaUsers
} from 'react-icons/fa6'
import { stations } from '../../../data/stations'

const MAX_TICKETS = 4

const Search = () => {
  const navigate = useNavigate()
  const departureDateRef = useRef(null)
  const returnDateRef = useRef(null)
  const ticketBoxRef = useRef(null)

  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [tripType, setTripType] = useState('one-way')
  const [adultTickets, setAdultTickets] = useState(1)
  const [childTickets, setChildTickets] = useState(0)
  const [showTicketBox, setShowTicketBox] = useState(false)

  const ticketTotal = adultTickets + childTickets

  // Close dropdown on outside click
  useEffect(() => {
    if (!showTicketBox) return
    const handleClickOutside = (e) => {
      if (ticketBoxRef.current && !ticketBoxRef.current.contains(e.target)) {
        setShowTicketBox(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTicketBox])

  const openCalendar = (inputRef) => {
    inputRef.current?.showPicker?.()
    inputRef.current?.focus()
  }

  const handleSwapStation = () => {
    setFromStation(toStation)
    setToStation(fromStation)
  }

  const changeTicketCount = (type, step) => {
    if (type === 'adult') {
      setAdultTickets(prev => {
        const next = Math.max(1, prev + step)
        return next + childTickets > MAX_TICKETS ? prev : next
      })
    } else {
      setChildTickets(prev => {
        const next = Math.max(0, prev + step)
        return adultTickets + next > MAX_TICKETS ? prev : next
      })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/tim-ve', {
      state: {
        fromStation,
        toStation,
        departureDate,
        returnDate,
        tripType,
        adultTickets,
        childTickets,
        ticketTotal
      }
    })
  }

  return (
    <form
      className="w-full max-w-[440px] rounded-md bg-[#8C1D19]/50 p-5 shadow-xl"
      onSubmit={handleSubmit}
    >
      <div className="mb-5 flex items-center gap-8 text-left text-sm font-medium text-white">
        <label className="flex items-center gap-2">
          <input type="radio" name="tripType" checked={tripType === 'one-way'} onChange={() => setTripType('one-way')} className="h-4 w-4 accent-[#FFD15A]" />
          Một chiều
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="tripType" checked={tripType === 'round-trip'} onChange={() => setTripType('round-trip')} className="h-4 w-4 accent-[#FFD15A]" />
          Khứ hồi
        </label>
      </div>

      <div className="relative flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
        <div className="relative">
          <FaTrainSubway className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black z-10" />
          <select value={fromStation} onChange={(e) => setFromStation(e.target.value)}
            className="h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none focus:ring-2 focus:ring-[#FFD15A] cursor-pointer appearance-none">
            <option value="" disabled>Chọn ga đi</option>
            {stations.map((station) => (
              <option key={station.code} value={station.name}>{station.name}</option>
            ))}
          </select>
        </div>

        <button type="button"
          className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[#8C1D19] text-white shadow-md transition-colors hover:bg-[#a82621] sm:static sm:mx-auto sm:h-10 sm:w-10 sm:translate-y-0 sm:border-transparent sm:bg-transparent sm:shadow-none sm:hover:bg-white/10"
          onClick={handleSwapStation}>
          <FaArrowsLeftRight className="h-4 w-4 rotate-90 sm:h-5 sm:w-5 sm:rotate-0" />
        </button>

        <div className="relative">
          <FaTrainSubway className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black z-10" />
          <select value={toStation} onChange={(e) => setToStation(e.target.value)}
            className="h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none focus:ring-2 focus:ring-[#FFD15A] cursor-pointer appearance-none">
            <option value="" disabled>Chọn ga đến</option>
            {stations.map((station) => (
              <option key={station.code} value={station.name}>{station.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <div className="relative">
          <button type="button" className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-black" onClick={() => openCalendar(departureDateRef)}>
            <FaCalendarDays className="h-5 w-5" />
          </button>
          <input ref={departureDateRef} type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
            className="h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none focus:ring-2 focus:ring-[#FFD15A]" />
        </div>

        <div className="relative">
          <button type="button" className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-black" onClick={() => openCalendar(returnDateRef)}>
            <FaCalendarDays className="h-5 w-5" />
          </button>
          <input ref={returnDateRef} type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
            disabled={tripType === 'one-way'}
            className="h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none focus:ring-2 focus:ring-[#FFD15A] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500" />
        </div>
      </div>

      {/* Ticket count — inline collapsible (not absolute) */}
      <div className="mt-3" ref={ticketBoxRef}>
        <button type="button"
          className="flex h-12 w-full items-center justify-between rounded-md bg-white px-3 text-left text-base text-neutral-900 outline-none focus:ring-2 focus:ring-[#FFD15A]"
          onClick={() => setShowTicketBox(v => !v)}>
          <span className="flex items-center gap-3">
            <FaUsers className="h-5 w-5 text-black" />
            Số lượng vé
          </span>
          <span className="font-semibold text-[#8C1D19]">{ticketTotal} / {MAX_TICKETS}</span>
        </button>

        {showTicketBox && (
          <div className="rounded-md bg-white px-4 pb-4 pt-3 shadow-inner border border-gray-100 mt-0.5">
            <p className="text-xs text-gray-400 mb-3">Tối đa {MAX_TICKETS} vé mỗi lần đặt</p>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-neutral-900">Người lớn</span>
                <span className="ml-2 text-xs text-gray-400">Từ 10 tuổi trở lên</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                  onClick={() => changeTicketCount('adult', -1)} disabled={adultTickets <= 1}>
                  <FaMinus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-bold">{adultTickets}</span>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                  onClick={() => changeTicketCount('adult', 1)} disabled={ticketTotal >= MAX_TICKETS}>
                  <FaPlus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-neutral-900">Trẻ em</span>
                <span className="ml-2 text-xs text-gray-400">Từ 6–9 tuổi · giảm 25%</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                  onClick={() => changeTicketCount('child', -1)} disabled={childTickets <= 0}>
                  <FaMinus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-bold">{childTickets}</span>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8C1D19] text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                  onClick={() => changeTicketCount('child', 1)} disabled={ticketTotal >= MAX_TICKETS}>
                  <FaPlus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="submit"
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#FFD15A] text-base font-bold text-[#8C1D19] transition-colors hover:bg-[#ffe082]">
        <FaMagnifyingGlass className="h-4 w-4" />
        Tìm kiếm chuyến
      </button>
    </form>
  )
}

export default Search
