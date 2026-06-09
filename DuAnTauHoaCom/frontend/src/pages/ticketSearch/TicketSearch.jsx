// pages/ticketSearch/TicketSearch.jsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RootLayout from '../../layout/RootLayout'
import TrainSelection from './trainSelection/TrainSelection'
import SearchForm from './searchForm/SearchForm'
import background from '../../assets/background.jpg'
import { FaSpinner } from 'react-icons/fa6'

const TicketSearch = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [step, setStep]               = useState('search')
  const [departureInfo, setDepartureInfo] = useState(null)
  const [searchParams, setSearchParams] = useState(null)
  const [holdError, setHoldError]       = useState(null)

  // Auto-advance to departure selection when arriving from home with pre-filled state
  useEffect(() => {
    if (state) {
      setSearchParams(state)
      setStep('departure')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    fromStation, toStation,
    departureDate, returnDate,
    tripType,
    adultTickets   = 1,
    childTickets   = 0,
    elderlyTickets = 0,
    studentTickets = 0,
    ticketTotal,
  } = searchParams || {}

  const totalPassengers = ticketTotal || (adultTickets + childTickets + elderlyTickets + studentTickets) || 1
  const isRoundTrip = tripType === 'round-trip'

  const handleSearch = (params) => {
    setSearchParams(params)
    setDepartureInfo(null)
    setStep('departure')
  }

  const buildTripData = (train, passengerSeats, totalPrice, from, to, depDate) => ({
    idChuyen:   train.idChuyen,
    idGaLen:    train.gaDiId,
    idGaXuong:  train.gaDenId,
    train: {
      code:       train.code,
      type:       train.type,
      departDate: train.departDate,
      arriveDate: train.arriveDate,
    },
    coach: {
      id:     passengerSeats[0]?.coachId,
      number: passengerSeats[0]?.coachId,
      name:   passengerSeats[0]?.coachName,
      type:   passengerSeats[0]?.coachType,
    },
    seats:          passengerSeats.map(ps => ps.seatNumber),
    passengerSeats,
    totalPrice,
    fromStation:    from,
    toStation:      to,
    departTime:     train.departTime,
    arriveTime:     train.arriveTime,
    departDate:     depDate,
    arriveDate:     train.arriveDate,
    duration:       train.duration,
  })

  // onComplete từ TrainSelection trả về: (train, passengerSeats, totalPrice, sessionId, hetHan, legAdults, legChildren, legElderly, legStudent)
  const handleDepartureDone = (train, passengerSeats, totalPrice, sessionId, hetHan, legAdults, legChildren, legElderly = 0, legStudent = 0) => {
    const tripData = buildTripData(train, passengerSeats, totalPrice, fromStation, toStation, departureDate)
    if (isRoundTrip) {
      setDepartureInfo({ ...tripData, sessionId: null, legAdults, legChildren, legElderly, legStudent })
      setHoldError(null)
      setStep('return')
    } else {
      navigate('/checkout', {
        state: {
          trips: [{ ...tripData, sessionId }],
          totalPassengers: legAdults + legChildren + legElderly + legStudent,
          adultTickets:    legAdults,
          childTickets:    legChildren,
          elderlyTickets:  legElderly,
          studentTickets:  legStudent,
          tripType: 'one-way',
          hetHan,
        },
      })
    }
  }

  const handleReturnDone = (train, passengerSeats, totalPrice, sessionId, hetHan, legAdults, legChildren, legElderly = 0, legStudent = 0) => {
    const returnTripData = buildTripData(train, passengerSeats, totalPrice, toStation, fromStation, returnDate)

    const depAdults   = departureInfo?.legAdults   ?? adultTickets
    const depChildren = departureInfo?.legChildren ?? childTickets
    const depElderly  = departureInfo?.legElderly  ?? elderlyTickets
    const depStudent  = departureInfo?.legStudent  ?? studentTickets
    const totalA = depAdults  + legAdults
    const totalC = depChildren + legChildren
    const totalE = depElderly + legElderly
    const totalS = depStudent + legStudent

    navigate('/checkout', {
      state: {
        trips: [{ ...departureInfo, sessionId }, { ...returnTripData, sessionId }],
        totalPassengers: totalA + totalC + totalE + totalS,
        adultTickets:    totalA,
        childTickets:    totalC,
        elderlyTickets:  totalE,
        studentTickets:  totalS,
        tripType: 'round-trip',
        hetHan,
      },
    })
  }

  if (step === 'search') {
    return (
      <div
        className="relative mt-[var(--nav-h)] min-h-[calc(100vh-var(--nav-h))] w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5 pointer-events-none" />
        <div className="relative z-10 flex min-h-[calc(100vh-var(--nav-h))] items-center justify-center px-4 py-10">
          <div className="w-full max-w-2xl">
            <SearchForm onSearch={handleSearch} initialValues={searchParams || {}} />
          </div>
        </div>
      </div>
    )
  }

  if (step === 'departure') {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
        <div className="container mx-auto px-4">
          <TrainSelection
            fromStation={fromStation} toStation={toStation} travelDate={departureDate}
            onComplete={handleDepartureDone}
            onBack={() => setStep('search')}
            title="CHỌN CHIỀU ĐI"
            totalPassengers={totalPassengers}
            adultTickets={adultTickets} childTickets={childTickets}
            elderlyTickets={elderlyTickets} studentTickets={studentTickets}
            isReturnTrip={false} isRoundTrip={isRoundTrip}
          />
        </div>
      </RootLayout>
    )
  }

  if (step === 'return') {
    const depSeats    = departureInfo?.passengerSeats || []
    const depAdults   = departureInfo?.legAdults   ?? adultTickets
    const depChildren = departureInfo?.legChildren ?? childTickets
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
        <div className="container mx-auto px-4">
          {/* Tóm tắt chiều đi đã chọn */}
          <div className="max-w-2xl mx-auto mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm flex justify-between items-center flex-wrap gap-2">
            <span className="text-green-700 font-medium">✅ Chiều đi: {departureInfo?.train?.code}</span>
            <span className="text-gray-600 text-xs">
              {depSeats.map((ps, i) =>
                `${ps.isChild ? 'TE' : 'NL'}${i + 1}: ${ps.coachType === 'NMCLC' ? 'Ghế' : 'Giường'} ${ps.seatNumber}`
              ).join(' · ')}
            </span>
          </div>

          {holdError && (
            <div className="max-w-2xl mx-auto mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {holdError} — Vui lòng thử lại.
            </div>
          )}

          <TrainSelection
            fromStation={toStation} toStation={fromStation} travelDate={returnDate}
            onComplete={handleReturnDone}
            onBack={() => { setHoldError(null); setStep('departure') }}
            title="CHỌN CHIỀU VỀ"
            totalPassengers={adultTickets + childTickets + elderlyTickets + studentTickets}
            adultTickets={adultTickets} childTickets={childTickets}
            elderlyTickets={elderlyTickets} studentTickets={studentTickets}
            isReturnTrip={true} isRoundTrip={isRoundTrip}
            depIdChuyen={departureInfo?.idChuyen}
            depPassengerSeats={depSeats}
            depGaDiId={departureInfo?.idGaLen}
            depGaDenId={departureInfo?.idGaXuong}
          />
        </div>
      </RootLayout>
    )
  }

  return null
}

export default TicketSearch
