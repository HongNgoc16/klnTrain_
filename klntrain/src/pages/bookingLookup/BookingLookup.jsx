// pages/bookingLookup/BookingLookup.jsx
import React, { useState } from 'react'
import RootLayout from '../../layout/RootLayout'
import BookingSearch from './bookingSearch/BookingSearch'
import BookingResult from './bookingResult/BookingResult'
import BookingHistory from './BookingHistory'
import { getUser } from '../../utils/authUtils'
import background from '../../assets/background.jpg'

const TabBar = ({ activeTab, onSwitch, invert = false }) => (
  <div className={`flex gap-1 p-1 rounded-xl w-fit mx-auto mb-5 ${invert ? 'bg-black/20 backdrop-blur-sm' : 'bg-white shadow'}`}>
    {[
      { key: 'search', label: 'Tra cứu đặt chỗ' },
      { key: 'history', label: 'Lịch sử đặt chỗ' },
    ].map(({ key, label }) => (
      <button key={key} onClick={() => onSwitch(key)}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
          activeTab === key
            ? 'bg-[#8C1D19] text-white shadow'
            : invert
              ? 'text-white/80 hover:text-white hover:bg-white/15'
              : 'text-gray-600 hover:text-[#8C1D19] hover:bg-gray-50'
        }`}>
        {label}
      </button>
    ))}
  </div>
)

const BookingLookup = () => {
  const [activeTab, setActiveTab] = useState(() => getUser() ? 'history' : 'search')
  const [showResult, setShowResult] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearchSuccess = (data) => {
    setBookingData(data)
    setShowResult(true)
    setIsLoading(false)
    setError(null)
  }

  const handleSearchError = (errMsg) => {
    setError(errMsg)
    setShowResult(true)
    setIsLoading(false)
    setBookingData(null)
  }

  const handleBackToSearch = () => {
    setShowResult(false)
    setBookingData(null)
    setError(null)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setShowResult(false)
    setBookingData(null)
    setError(null)
  }

  // Search tab — result view (no background)
  if (activeTab === 'search' && showResult) {
    return (
      <div className="min-h-screen bg-gray-100 pt-[13.4ch]">
        <div className="container mx-auto px-4 py-8">
          <TabBar activeTab={activeTab} onSwitch={switchTab} />
          <BookingResult
            data={bookingData}
            error={error}
            isLoading={isLoading}
            onBack={handleBackToSearch}
          />
        </div>
      </div>
    )
  }

  // History tab
  if (activeTab === 'history') {
    return (
      <div className="min-h-screen bg-gray-100 pt-[13.4ch]">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <TabBar activeTab={activeTab} onSwitch={switchTab} />
          <BookingHistory />
        </div>
      </div>
    )
  }

  // Search tab — form view (with background image)
  return (
    <div
      className='relative mt-[13.4ch] min-h-[calc(100vh-13.4ch)] w-full flex-1 bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${background})` }}
    >
      <RootLayout className="absolute top-0 left-0 w-full h-full py-8 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5">
        <div className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <TabBar activeTab={activeTab} onSwitch={switchTab} invert />
          <div className="w-full flex justify-start pl-2 sm:pl-6 md:pl-0">
            <BookingSearch
              onSuccess={handleSearchSuccess}
              onError={handleSearchError}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>
      </RootLayout>
    </div>
  )
}

export default BookingLookup
