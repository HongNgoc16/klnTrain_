// pages/exchangeTicket/ExchangeTicket.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa'
import RootLayout from '../../layout/RootLayout'
import ExchangeSearch from './exchangeSearch/ExchangeSearch'
import ExchangeResult from './exchangeResult/ExchangeResult'
import ExchangeSelect from './exchangeSelect/ExchangeSelect'
import ExchangeConfirm from './exchangeConfirm/ExchangeConfirm'
import { exchangeTicket as apiExchangeTicket } from '../../api/exchange'
import { formatDate as fmtDate } from '../../utils/dateUtils'
import background from '../../assets/background.jpg'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const ExchangeTicket = () => {
  const navigate = useNavigate()
  const [step, setStep]                   = useState('search')
  const [booking, setBooking]             = useState(null)
  const [searchError, setSearchError]     = useState(null)
  const [chosenTicket, setChosenTicket]   = useState(null)
  const [newSelection, setNewSelection]   = useState(null)
  const [exchangeResult, setExchangeResult] = useState(null)

  const reset = () => {
    setStep('search')
    setBooking(null)
    setSearchError(null)
    setChosenTicket(null)
    setNewSelection(null)
    setExchangeResult(null)
  }

  const handleFound     = (data)      => { setBooking(data); setSearchError(null); setStep('result') }
  const handleError     = (msg)       => { setSearchError(msg); setBooking(null); setStep('result') }
  const handleSelect    = (ticket)    => { setChosenTicket(ticket); setStep('select') }
  const handleNewSelect = (selection) => { setNewSelection(selection); setStep('confirm') }

  const handleExchange = async (idVeCu, newTicketData) => {
    const res = await apiExchangeTicket(idVeCu, newTicketData)
    const result = res.data || res
    setExchangeResult(result)

    if (result.tongPhaitra > 0 && result.idThanhToan) {
      // Có phí đổi vé → navigate sang QR thanh toán
      const { train: newTrain, coach: newCoach, seatNumber, newDate } = newSelection || {}
      navigate('/thanh-toan/qr', {
        state: {
          bookingCode:      booking?.bookingCode,
          orderCode:        booking?.orderCode,
          idDon:            result.idDon,
          idThanhToan:      result.idThanhToan,
          qrUrlFromExchange: result.qrUrl,
          totalAmount:      result.tongPhaitra,
          isExchange:       true,
          exchangeInfo: {
            bookingCode: booking?.bookingCode,
            oldTrain:    chosenTicket?.trip?.trainCode,
            oldDate:     chosenTicket?.trip?.departDate,
          },
          trips: newTrain ? [{
            fromStation: newTrain.fromStation,
            toStation:   newTrain.toStation,
            departTime:  newTrain.departTime,
            arriveTime:  newTrain.arriveTime || '',
            departDate:  newDate || newTrain.departDate,
            train:       { code: newTrain.code, type: newTrain.type },
            coach:       { name: newCoach?.name, id: newCoach?.id },
            seats:       [seatNumber],
          }] : [],
          passengersInfo: booking?.passengers?.slice(0, 1) || [],
          contactInfo:    booking?.contactInfo || {},
          tripType:       'one-way',
        }
      })
    } else {
      setStep('success')
    }
  }

  // Bước thành công
  if (step === 'success' && newSelection) {
    const { train: newTrain, coach: newCoach, seatNumber, seatPrice, newDate } = newSelection
    const { passenger: oldPassenger } = chosenTicket
    const totalPayable = exchangeResult?.tongPhaitra ?? 0

    return (
      <div className="min-h-screen bg-gray-100 pt-[var(--nav-h)]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đổi vé thành công!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Vé mới đã được phát hành. Xác nhận gửi về <strong>{booking.contactEmail}</strong>.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Vé mới</p>
                <p className="font-semibold">{oldPassenger.fullName}</p>
                <p className="text-sm text-gray-600">
                  {newTrain.code} · {newTrain.fromStation} → {newTrain.toStation}
                </p>
                <p className="text-sm text-gray-600">
                  {fmtDate(newDate)} {newTrain.departTime} · Toa {newCoach.id} · Ghế {seatNumber}
                </p>
                <p className="text-sm font-semibold text-[#8C1D19] mt-1">{fmt(seatPrice)}</p>
              </div>
              {totalPayable > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Phí đổi vé cần thanh toán</p>
                  <p className="font-bold text-[#ff8a00] text-lg">{fmt(totalPayable)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Vui lòng thanh toán phí tại quầy hoặc theo hướng dẫn qua email.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={reset}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Đổi vé khác
              </button>
              <a href="/chuyen-tau-cua-toi"
                className="flex-1 py-2.5 bg-[#8C1D19] text-white rounded-lg font-semibold hover:bg-[#7a1916] transition-colors flex items-center justify-center gap-2">
                Xem lịch sử <FaArrowRight />
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Bước tra cứu → dùng background image
  if (step === 'search') {
    return (
      <div
        className="relative mt-[var(--nav-h)] min-h-[calc(100vh-var(--nav-h))] w-full bg-cover bg-center bg-no-repeat"
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

  return (
    <div className="min-h-screen bg-gray-100 pt-[var(--nav-h)]">
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
            onExchange={handleExchange}
          />
        )}
      </div>
    </div>
  )
}

export default ExchangeTicket
