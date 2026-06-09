// pages/exchangeTicket/ExchangeTicket.jsx
// Container quản lý các bước: search → result → select → confirm
// (success nằm ở /thanh-toan/thanh-cong sau khi thanh toán xong)
import React, { useState } from 'react'
import RootLayout from '../../layout/RootLayout'
import ExchangeSearch from './exchangeSearch/ExchangeSearch'
import ExchangeResult from './exchangeResult/ExchangeResult'
import ExchangeSelect from './exchangeSelect/ExchangeSelect'
import ExchangeConfirm from './exchangeConfirm/ExchangeConfirm'
import background from '../../assets/background.jpg'

const ExchangeTicket = () => {
  const [step, setStep]               = useState('search') // search|result|select|confirm
  const [booking, setBooking]         = useState(null)
  const [searchError, setSearchError] = useState(null)
  const [chosenTicket, setChosenTicket]   = useState(null) // { key, trip, passenger }
  const [newSelection, setNewSelection]   = useState(null) // { train, coach, seatNumber, seatPrice, newDate }

  const reset = () => {
    setStep('search')
    setBooking(null)
    setSearchError(null)
    setChosenTicket(null)
    setNewSelection(null)
  }

  const handleFound = (data) => { setBooking(data); setSearchError(null); setStep('result') }
  const handleError = (msg)  => { setSearchError(msg); setBooking(null); setStep('result') }

  const handleSelect    = (ticket)    => { setChosenTicket(ticket);    setStep('select') }
  const handleNewSelect = (selection) => { setNewSelection(selection); setStep('confirm') }

  // Bước tra cứu → background image
  if (step === 'search') {
    return (
      <div
        className="relative mt-[13.4ch] min-h-[calc(100vh-13.4ch)] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      >
        <RootLayout className="absolute top-0 left-0 w-full h-full py-8 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5">
          <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full flex justify-start pl-2 sm:pl-6 md:pl-0">
              <ExchangeSearch onFound={handleFound} onError={handleError} />
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
        {step === 'result' && (
          <ExchangeResult
            booking={booking}
            error={searchError}
            onBack={() => { reset(); setStep('search') }}
            onSelect={handleSelect}
          />
        )}
        {step === 'select' && (
          <ExchangeSelect
            chosenTicket={chosenTicket}
            onBack={() => setStep('result')}
            onContinue={handleNewSelect}
          />
        )}
        {step === 'confirm' && (
          <ExchangeConfirm
            booking={booking}
            chosenTicket={chosenTicket}
            newSelection={newSelection}
            onBack={() => setStep('select')}
          />
        )}
      </div>
    </div>
  )
}

export default ExchangeTicket
