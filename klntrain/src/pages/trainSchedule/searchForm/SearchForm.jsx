// pages/trainSchedule/components/SearchForm.jsx
import React, { useState, useRef } from 'react'
import { FaSearch, FaCalendar, FaTrain } from 'react-icons/fa'
import { stations } from '../../../data/trainSchedule' // Giả sử bạn có danh sách các ga trong file này

const SearchForm = ({ onSearch }) => {
  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation] = useState('')
  const [date, setDate] = useState('')
  const [fromStationInput, setFromStationInput] = useState('')
  const [toStationInput, setToStationInput] = useState('')
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const filteredFromStations = stations.filter(s => 
    s.toLowerCase().includes(fromStationInput.toLowerCase())
  ).slice(0, 10)

  const filteredToStations = stations.filter(s => 
    s.toLowerCase().includes(toStationInput.toLowerCase())
  ).slice(0, 10)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!fromStation || !toStation) {
      alert('Vui lòng chọn ga đi và ga đến')
      return
    }
    if (!date) {
      alert('Vui lòng chọn ngày đi')
      return
    }
    onSearch({ fromStation, toStation, date })
  }

  const handleSwap = () => {
    setFromStation(toStation)
    setToStation(fromStation)
    setFromStationInput(toStation)
    setToStationInput(fromStation)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-[#8C1D19] mb-6">Thông tin hành trình</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Cột trái */}
          <div className="space-y-4">
            {/* Ga đi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. Ga đi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaTrain className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fromStationInput}
                  onChange={(e) => {
                    setFromStationInput(e.target.value)
                    setFromStation(e.target.value)
                    setShowFromSuggestions(true)
                  }}
                  onFocus={() => setShowFromSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                  placeholder="Nhập hoặc chọn ga đi bên dưới..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30"
                />
                {showFromSuggestions && filteredFromStations.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredFromStations.map(station => (
                      <div
                        key={station}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setFromStation(station)
                          setFromStationInput(station)
                          setShowFromSuggestions(false)
                        }}
                      >
                        {station}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ga đến */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. Ga đến <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaTrain className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={toStationInput}
                  onChange={(e) => {
                    setToStationInput(e.target.value)
                    setToStation(e.target.value)
                    setShowToSuggestions(true)
                  }}
                  onFocus={() => setShowToSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                  placeholder="Nhập hoặc chọn ga đến bên dưới..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30"
                />
                {showToSuggestions && filteredToStations.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredToStations.map(station => (
                      <div
                        key={station}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setToStation(station)
                          setToStationInput(station)
                          setShowToSuggestions(false)
                        }}
                      >
                        {station}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Nút đổi ga */}
            <button
              type="button"
              onClick={handleSwap}
              className="text-sm text-[#8C1D19] hover:underline"
            >
              ↕ Đổi ga đi và ga đến
            </button>
          </div>

          {/* Cột phải */}
          <div className="space-y-4">
            {/* Ngày đi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3. Ngày đi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-[#8C1D19] focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30"
                />
              </div>
            </div>

            {/* Nút tìm kiếm */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-2 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] transition-colors flex items-center justify-center gap-2"
              >
                <FaSearch /> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SearchForm