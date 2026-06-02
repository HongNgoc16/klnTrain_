// pages/ticketSearch/SearchForm.jsx
import React, { useRef, useState } from 'react'
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

const SearchForm = () => {
  const navigate = useNavigate()
  const departureDateRef = useRef(null)
  const returnDateRef = useRef(null)

  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [tripType, setTripType] = useState('one-way')
  const [adultTickets, setAdultTickets] = useState(1)
  const [childTickets, setChildTickets] = useState(0)
  const [showTicketBox, setShowTicketBox] = useState(false)

  const ticketTotal = adultTickets + childTickets

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
      setAdultTickets((current) => Math.max(1, current + step))
      return
    }
    setChildTickets((current) => Math.max(0, current + step))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!fromStation || !toStation) {
      alert('Vui lòng chọn ga đi và ga đến')
      return
    }

    if (fromStation === toStation) {
      alert('Ga đi và ga đến không được trùng nhau')
      return
    }

    if (!departureDate) {
      alert('Vui lòng chọn ngày đi')
      return
    }

    navigate('/tim-ve', {
      state: {
        fromStation,
        toStation,
        departureDate,
        returnDate: tripType === 'round-trip' ? returnDate : null,
        tripType,
        adultTickets,
        childTickets,
        ticketTotal
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        className="w-full rounded-lg bg-white shadow-xl overflow-hidden"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <div className="bg-[#8C1D19] px-6 py-4">
          <h2 className="text-xl font-bold text-white">Tìm vé tàu</h2>
          <p className="text-white/70 text-sm mt-1">Vui lòng nhập thông tin hành trình</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Radio Một chiều / Khứ hồi */}
          <div className="flex items-center gap-6 pb-2 border-b border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'one-way'}
                onChange={() => setTripType('one-way')}
                className="h-4 w-4 accent-[#8C1D19]"
              />
              <span className="text-gray-700 font-medium">Một chiều</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'round-trip'}
                onChange={() => setTripType('round-trip')}
                className="h-4 w-4 accent-[#8C1D19]"
              />
              <span className="text-gray-700 font-medium">Khứ hồi</span>
            </label>
            <div className="flex-1 text-right">
              <span className="text-sm text-gray-500">{ticketTotal} khách</span>
            </div>
          </div>

          {/* Ga đi - Ga đến */}
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 relative">
              <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-base focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 cursor-pointer appearance-none"
              >
                <option value="" disabled>Chọn ga đi</option>
                {stations.map((station) => (
                  <option key={station.code} value={station.name}>{station.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwapStation}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 sm:static sm:translate-x-0 sm:translate-y-0"
            >
              <FaArrowsLeftRight className="h-3 w-3 rotate-90 sm:rotate-0 text-gray-500" />
            </button>

            <div className="flex-1 relative">
              <FaTrainSubway className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-base focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 cursor-pointer appearance-none"
              >
                <option value="" disabled>Chọn ga đến</option>
                {stations.map((station) => (
                  <option key={station.code} value={station.name}>{station.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngày đi - Ngày về */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                onClick={() => openCalendar(departureDateRef)}
              >
                <FaCalendarDays className="h-4 w-4" />
              </button>
              <input
                ref={departureDateRef}
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-base focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                onClick={() => openCalendar(returnDateRef)}
              >
                <FaCalendarDays className="h-4 w-4" />
              </button>
              <input
                ref={returnDateRef}
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                disabled={tripType === 'one-way'}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-base focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Số lượng vé */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTicketBox(!showTicketBox)}
              className="flex items-center justify-between w-full h-12 px-4 border border-gray-300 rounded-lg bg-white hover:border-[#8C1D19] transition-colors"
            >
              <span className="flex items-center gap-2 text-gray-600">
                <FaUsers className="h-4 w-4" />
                Số lượng vé
              </span>
              <span className="font-semibold text-[#8C1D19]">{ticketTotal}</span>
            </button>

            {showTicketBox && (
              <div className="absolute left-0 top-full mt-2 z-20 w-full bg-white border rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700">Người lớn</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => changeTicketCount('adult', -1)}
                      disabled={adultTickets <= 1}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                    >
                      <FaMinus className="h-3 w-3 mx-auto" />
                    </button>
                    <span className="w-8 text-center font-semibold">{adultTickets}</span>
                    <button
                      type="button"
                      onClick={() => changeTicketCount('adult', 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <FaPlus className="h-3 w-3 mx-auto" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Trẻ em</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => changeTicketCount('child', -1)}
                      disabled={childTickets <= 0}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                    >
                      <FaMinus className="h-3 w-3 mx-auto" />
                    </button>
                    <span className="w-8 text-center font-semibold">{childTickets}</span>
                    <button
                      type="button"
                      onClick={() => changeTicketCount('child', 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <FaPlus className="h-3 w-3 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nút tìm kiếm */}
          <button
            type="submit"
            className="w-full h-12 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] transition-colors flex items-center justify-center gap-2"
          >
            <FaMagnifyingGlass className="h-4 w-4" />
            Tìm kiếm chuyến
          </button>
        </div>
      </form>
    </div>
  )
}

export default SearchForm