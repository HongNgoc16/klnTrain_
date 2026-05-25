// pages/ticketSearch/TicketSearch.jsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RootLayout from '../../layout/RootLayout'
import TrainSelection from './trainSelection/TrainSelection'
import SearchForm from './searchForm/SearchForm'

const TicketSearch = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [step, setStep] = useState('search')
  const [departureInfo, setDepartureInfo] = useState(null)
  const [searchParams, setSearchParams] = useState(null)

  if (state && !searchParams && step === 'search') {
    setSearchParams(state)
    setStep('departure')
    return null
  }

  const {
    fromStation, toStation,
    departureDate, returnDate,
    tripType,
    adultTickets = 1, childTickets = 0,
    ticketTotal
  } = searchParams || state || {}

  const totalPassengers = ticketTotal || (adultTickets + childTickets) || 1
  const isRoundTrip = tripType === 'round-trip'

  // passengerSeats: [{ coachId, coachName, coachType, seatNumber, basePrice, seatPrice, isChild }]
  const buildTripData = (train, passengerSeats, totalPrice, from, to, depDate) => ({
    train: {
      code: train.code,
      type: train.type,
      departDate: train.departDate,
      arriveDate: train.arriveDate
    },
    // backward-compat fields for payment pages
    coach: {
      id: passengerSeats[0]?.coachId,
      number: passengerSeats[0]?.coachId,
      name: passengerSeats[0]?.coachName,
      type: passengerSeats[0]?.coachType
    },
    seats: passengerSeats.map(ps => ps.seatNumber),
    // full per-passenger data
    passengerSeats,
    totalPrice,
    fromStation: from,
    toStation: to,
    departTime: train.departTime,
    arriveTime: train.arriveTime,
    departDate: depDate,
    arriveDate: train.arriveDate,
    duration: train.duration
  })

  const handleDepartureDone = (train, passengerSeats, totalPrice) => {
    const tripData = buildTripData(train, passengerSeats, totalPrice, fromStation, toStation, departureDate)
    if (isRoundTrip) {
      setDepartureInfo(tripData)
      setStep('return')
    } else {
      navigate('/checkout', {
        state: { trips: [tripData], totalPassengers, adultTickets, childTickets, tripType: 'one-way' }
      })
    }
  }

  const handleReturnDone = (train, passengerSeats, totalPrice) => {
    const returnTripData = buildTripData(train, passengerSeats, totalPrice, toStation, fromStation, returnDate)
    navigate('/checkout', {
      state: { trips: [departureInfo, returnTripData], totalPassengers, adultTickets, childTickets, tripType: 'round-trip' }
    })
  }

  const goHome = () => navigate('/')

  if (step === 'search') {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[14ch]">
        <div className="container mx-auto px-4"><SearchForm /></div>
      </RootLayout>
    )
  }

  if (step === 'departure') {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[14ch]">
        <div className="container mx-auto px-4">
          <TrainSelection
            fromStation={fromStation} toStation={toStation} travelDate={departureDate}
            onComplete={handleDepartureDone} onBack={goHome}
            title="CHỌN CHIỀU ĐI" totalPassengers={totalPassengers}
            adultTickets={adultTickets} childTickets={childTickets} isReturnTrip={false} isRoundTrip={isRoundTrip}
          />
        </div>
      </RootLayout>
    )
  }

  if (step === 'return') {
    const depSeats = departureInfo?.passengerSeats || []
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[14ch]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-4 p-3 bg-green-50 rounded-lg text-sm flex justify-between items-center flex-wrap gap-2">
            <span className="text-green-700 font-medium">✅ Đã chọn chiều đi: {departureInfo?.train?.code}</span>
            <span className="text-gray-600">
              {depSeats.map((ps, i) => `${ps.isChild ? 'Trẻ em' : 'Người lớn'} ${i + 1}: ${ps.coachType === 'NMCLC' ? 'Ghế' : 'Giường'} ${ps.seatNumber}`).join(' · ')}
            </span>
          </div>
          <TrainSelection
            fromStation={toStation} toStation={fromStation} travelDate={returnDate}
            onComplete={handleReturnDone} onBack={() => setStep('departure')}
            title="CHỌN CHIỀU VỀ" totalPassengers={totalPassengers}
            adultTickets={adultTickets} childTickets={childTickets} isReturnTrip={true} isRoundTrip={isRoundTrip}
          />
        </div>
      </RootLayout>
    )
  }

  return null
}

export default TicketSearch
