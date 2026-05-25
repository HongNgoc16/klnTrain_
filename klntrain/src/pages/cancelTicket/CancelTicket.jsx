// pages/cancelTicket/CancelTicket.jsx
// Container quản lý các bước: search → result → confirm → success
import React, { useState } from 'react'
import RootLayout from '../../layout/RootLayout'
import CancelSearch from './cancelSearch/CancelSearch'
import CancelResult from './cancelResult/CancelResult'
import CancelConfirm from './cancelConfirm/CancelConfirm'
import CancelSuccess from './cancelSuccess/CancelSuccess'
import { calculateRefund, updateLocalBookingStatus } from '../../data/bookingMock'
import background from '../../assets/background.jpg'

const CancelTicket = () => {
  const [step, setStep] = useState('search') // search | result | confirm | success
  const [booking, setBooking]           = useState(null)
  const [searchError, setSearchError]   = useState(null)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [cancelRef, setCancelRef]       = useState('')
  const [totalRefund, setTotalRefund]   = useState(0)

  const reset = () => {
    setStep('search')
    setBooking(null)
    setSearchError(null)
    setSelectedKeys([])
    setCancelRef('')
    setTotalRefund(0)
  }

  const handleFound = (data)  => { setBooking(data); setSearchError(null); setStep('result') }
  const handleError = (msg)   => { setSearchError(msg); setBooking(null); setStep('result') }
  const handleContinue = (keys) => { setSelectedKeys(keys); setStep('confirm') }

  const handleConfirm = () => {
    // Tính tổng tiền hoàn trước khi chuyển sang success
    const refund = booking.trips.flatMap(trip =>
      trip.passengers
        .filter(p => selectedKeys.includes(`${trip.tripId}_${p.id}`))
        .map(p => Math.round(p.price * calculateRefund(trip.departDate, trip.departTime).refundRate))
    ).reduce((a, b) => a + b, 0)

    setTotalRefund(refund)
    setCancelRef('HUY' + Date.now())
    updateLocalBookingStatus(booking.bookingCode, 'da_huy', { cancelledAt: Date.now() })
    setStep('success')
  }

  // Bước tra cứu → dùng background image như BookingLookup
  if (step === 'search') {
    return (
      <div
        className="relative mt-[13.4ch] min-h-[calc(100vh-13.4ch)] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      >
        <RootLayout className="absolute top-0 left-0 w-full h-full py-8 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5">
          <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full flex justify-start pl-2 sm:pl-6 md:pl-0">
              <CancelSearch onFound={handleFound} onError={handleError} />
            </div>
          </div>
        </RootLayout>
      </div>
    )
  }

  // Các bước sau → nền xám
  return (
    <div className="min-h-screen bg-gray-100 pt-[13.4ch]">
      <div className="container mx-auto px-4 py-8">
        {step === 'result'  && (
          <CancelResult
            booking={booking}
            error={searchError}
            onBack={() => setStep('search')}
            onContinue={handleContinue}
          />
        )}
        {step === 'confirm' && (
          <CancelConfirm
            booking={booking}
            selectedKeys={selectedKeys}
            onBack={() => setStep('result')}
            onConfirm={handleConfirm}
          />
        )}
        {step === 'success' && (
          <CancelSuccess
            booking={booking}
            cancelRef={cancelRef}
            totalRefund={totalRefund}
            onReset={reset}
          />
        )}
      </div>
    </div>
  )
}

export default CancelTicket
