// pages/bookingLookup/BookingLookup.jsx
import React, { useState } from 'react'
import BookingSearch from './bookingSearch/BookingSearch'
import BookingResult from './bookingResult/BookingResult'
import BookingHistory from './BookingHistory'
import { getUser } from '../../utils/authUtils'
import background from '../../assets/background.jpg'

const BookingLookup = () => {
  const [activeTab, setActiveTab] = useState(() => getUser() ? 'history' : 'search')
  const [step, setStep]           = useState('search')   // 'search' | 'result'
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState(null)

  const handleSearchSuccess = (data) => {
    setBookingData(data)
    setIsLoading(false)
    setError(null)
    // step đã là 'result' do handleSetIsLoading đặt khi bắt đầu gọi API
  }

  const handleSearchError = (errMsg) => {
    setError(errMsg)
    setIsLoading(false)
    setBookingData(null)
  }

  // Interceptor: khi BookingSearch bắt đầu gọi API → chuyển sang trang kết quả ngay
  const handleSetIsLoading = (loading) => {
    setIsLoading(loading)
    if (loading) setStep('result')
  }

  const handleBackToSearch = () => {
    setBookingData(null)
    setError(null)
    setStep('search')
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setBookingData(null)
    setError(null)
    setStep('search')
  }

  /* ══════════════════════════════════════════════════════
     BƯỚC KẾT QUẢ — trang riêng, nền xám, chỉ hiện kết quả
  ══════════════════════════════════════════════════════ */
  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gray-100 pt-[var(--nav-h)]">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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

  /* ══════════════════════════════════════════════════════
     BƯỚC TRA CỨU — nền ảnh, form + tab căn giữa
  ══════════════════════════════════════════════════════ */
  return (
    <div
      className="relative mt-[var(--nav-h)] min-h-[calc(100vh-var(--nav-h))] w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5 pointer-events-none" />

      <div className="relative z-10 w-full min-h-[calc(100vh-var(--nav-h))] flex flex-col items-center px-4 sm:px-6 lg:px-10 py-8">

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-8 bg-white/90 shadow backdrop-blur-sm">
          {[
            { key: 'search',  label: 'Tra cứu đặt chỗ' },
            { key: 'history', label: 'Lịch sử đặt chỗ' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => switchTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === key
                  ? 'bg-[#8C1D19] text-white shadow'
                  : 'text-gray-600 hover:text-[#8C1D19] hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab tra cứu — form căn giữa */}
        {activeTab === 'search' && (
          <BookingSearch
            onSuccess={handleSearchSuccess}
            onError={handleSearchError}
            setIsLoading={handleSetIsLoading}
          />
        )}

        {/* Tab lịch sử */}
        {activeTab === 'history' && (
          <div className="w-full max-w-2xl">
            <div className="bg-white/95 rounded-xl shadow-lg overflow-hidden">
              <BookingHistory />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default BookingLookup
