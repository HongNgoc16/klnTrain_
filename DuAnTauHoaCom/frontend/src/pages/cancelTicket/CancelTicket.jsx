// pages/cancelTicket/CancelTicket.jsx
import React, { useState } from 'react'
import RootLayout from '../../layout/RootLayout'
import CancelSearch from './cancelSearch/CancelSearch'
import CancelResult from './cancelResult/CancelResult'
import CancelConfirm from './cancelConfirm/CancelConfirm'
import CancelSuccess from './cancelSuccess/CancelSuccess'
import { calculateRefund } from '../../data/bookingMock'
import { cancelTickets as apiCancelTickets } from '../../api/cancel'
import background from '../../assets/background.jpg'

const CancelTicket = () => {
  const [step, setStep]               = useState('search')
  const [booking, setBooking]         = useState(null)
  const [searchError, setSearchError] = useState(null)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [cancelRef, setCancelRef]     = useState('')
  const [totalRefund, setTotalRefund] = useState(0)
  const [cancelError, setCancelError] = useState(null)

  const reset = () => {
    setStep('search')
    setBooking(null)
    setSearchError(null)
    setSelectedKeys([])
    setCancelRef('')
    setTotalRefund(0)
    setCancelError(null)
  }

  const handleFound = (data)  => { setBooking(data); setSearchError(null); setStep('result') }
  const handleError = (msg)   => { setSearchError(msg); setBooking(null); setStep('result') }
  const handleContinue = (keys) => { setSelectedKeys(keys); setCancelError(null); setStep('confirm') }

  const handleConfirm = async () => {
    // Tính tiền hoàn (hiển thị trước khi API xác nhận)
    const refund = booking.trips.flatMap(trip =>
      trip.passengers
        .filter(p => selectedKeys.includes(`${trip.tripId}_${p.id}`))
        .map(p => Math.round(p.price * calculateRefund(trip.departDate, trip.departTime).refundRate))
    ).reduce((a, b) => a + b, 0)

    // Lấy danh sách idVe từ selectedKeys (p.id = idVe khi dùng API)
    const idVeList = booking.trips.flatMap(trip =>
      trip.passengers
        .filter(p => selectedKeys.includes(`${trip.tripId}_${p.id}`))
        .map(p => p.id)
    ).filter(id => typeof id === 'number')

    if (idVeList.length > 0) {
      try {
        await apiCancelTickets(booking.bookingCode, idVeList)
      } catch (err) {
        setCancelError(err.message || 'Hủy vé thất bại. Vui lòng thử lại.')
        setStep('confirm')
        return
      }
    }

    setTotalRefund(refund)
    setCancelRef('HUY' + Date.now())
    setStep('success')
  }

  // Bước tra cứu → dùng background image như BookingLookup
  if (step === 'search') {
    return (
      <div
        className="relative mt-[var(--nav-h)] min-h-[calc(100vh-var(--nav-h))] w-full bg-cover bg-center bg-no-repeat"
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
    <div className="min-h-screen bg-gray-100 pt-[var(--nav-h)]">
      <div className="container mx-auto px-4 py-8">
        {cancelError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm text-center">
            {cancelError}
          </div>
        )}
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
