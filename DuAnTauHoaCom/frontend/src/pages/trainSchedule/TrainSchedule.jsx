// pages/trainSchedule/TrainSchedule.jsx
import React, { useState } from 'react'
import RootLayout from '../../layout/RootLayout'
import SearchForm from './searchForm/SearchForm'
import TrainList from './trainList/TrainList'
import TrainDetail from './trainDetail/TrainDetail'
import { searchTrains as searchTrainsApi, getTrainDetail as getTrainDetailApi } from '../../api/trains'
import background from '../../assets/background.jpg'

// TIME từ Sequelize có thể là Date epoch "1970-01-01T08:00:00.000Z" hoặc string "08:00:00"
const toHHMM = (t) => {
  if (!t) return ''
  const s = String(t)
  // ISO datetime có T: lấy HH:MM từ phần sau T
  const iso = s.match(/T(\d{2}):(\d{2})/)
  if (iso) return `${iso[1]}:${iso[2]}`
  // Plain time "HH:MM..." hoặc "HH:MM:SS..."
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5)
  return ''
}

const computeDuration = (start, end) => {
  if (!start || !end) return ''
  const [h1, m1] = toHHMM(start).split(':').map(Number)
  const [h2, m2] = toHHMM(end).split(':').map(Number)
  let mins = h2 * 60 + m2 - (h1 * 60 + m1)
  if (mins < 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h} giờ${m > 0 ? ` ${m} phút` : ''}`
}

const TrainSchedule = () => {
  const [step, setStep]               = useState('search')
  const [searchParams, setSearchParams] = useState(null)
  const [trains, setTrains]           = useState([])
  const [trainDetail, setTrainDetail] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  const handleSearch = async (params) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchTrainsApi(params.fromStation, params.toStation, params.date)
      const list = (Array.isArray(data) ? data : data?.data || []).map(ct => ({
        idChuyen:   ct.idChuyen,
        idLichChay: ct.idLichChay,
        gaDi:       ct.gaDi,
        gaDen:      ct.gaDen,
        code:       ct.maTau,
        name:       ct.tenTau,
        fromStation: ct.gaDi?.ten,
        toStation:   ct.gaDen?.ten,
        departTime:  toHHMM(ct.gioKhoiHanh),
        arriveTime:  toHHMM(ct.gioDuKienDen),
        duration:    computeDuration(ct.gioKhoiHanh, ct.gioDuKienDen),
        departDate:  params.date,
        arriveDate:  params.date,
      }))
      setSearchParams(params)
      setTrains(list)
      setStep('list')
    } catch (err) {
      setError(err.message || 'Không tìm được chuyến tàu.')
      setTrains([])
      setStep('list')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTrain = async (train) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTrainDetailApi(
        train.idLichChay,
        train.gaDi?.id,
        train.gaDen?.id,
        searchParams?.date
      )
      const detail = data?.data || data
      setTrainDetail({
        code:        detail.maTau,
        name:        detail.tenTau,
        fromStation: detail.gaDi,
        toStation:   detail.gaDen,
        departTime:  toHHMM(detail.gioKhoiHanh),
        arriveTime:  toHHMM(detail.gioDuKienDen),
        departDate:  searchParams?.date,
        arriveDate:  searchParams?.date,
        duration:    computeDuration(detail.gioKhoiHanh, detail.gioDuKienDen),
        stations: (detail.stops || []).map(s => ({
          stt:        s.stt,
          name:       s.tenGa,
          distance:   s.km,
          date:       searchParams?.date,
          arriveTime: toHHMM(s.gioDen),
          departTime: toHHMM(s.gioDi),
        })),
        prices: (detail.prices || []).map(p => ({
          stt:   p.stt,
          code:  p.ma,
          name:  p.ten,
          price: p.gia,
        })),
      })
      setStep('detail')
    } catch (err) {
      setError(err.message || 'Không tải được thông tin chi tiết.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    setStep('list')
    setTrainDetail(null)
    setError(null)
  }

  const handleBackToSearch = () => {
    setStep('search')
    setSearchParams(null)
    setTrains([])
    setTrainDetail(null)
    setError(null)
  }

  if (step === 'list' || step === 'detail') {
    return (
      <div className="min-h-screen bg-gray-100 pt-[var(--nav-h)]">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#8C1D19] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
              {error}
            </div>
          )}

          {!loading && step === 'list' && (
            <div className="space-y-6">
              <button
                onClick={handleBackToSearch}
                className="text-gray-600 hover:text-[#8C1D19] transition-colors flex items-center gap-2"
              >
                ← Quay lại tìm kiếm
              </button>
              <TrainList
                trains={trains}
                onSelectTrain={handleSelectTrain}
                fromStation={searchParams?.fromStation}
                toStation={searchParams?.toStation}
                date={searchParams?.date}
              />
            </div>
          )}

          {!loading && step === 'detail' && (
            <TrainDetail
              trainDetail={trainDetail}
              onBack={handleBackToList}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative mt-[var(--nav-h)] min-h-[calc(100vh-var(--nav-h))] w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <RootLayout className="absolute top-0 left-0 w-full h-full py-8 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5">
        <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </RootLayout>
    </div>
  )
}

export default TrainSchedule
