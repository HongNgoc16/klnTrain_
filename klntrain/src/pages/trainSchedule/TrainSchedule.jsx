// pages/trainSchedule/TrainSchedule.jsx
import React, { useState } from 'react'
import RootLayout from '../../layout/RootLayout'
import SearchForm from './searchForm/SearchForm'
import TrainList from './trainList/TrainList'
import TrainDetail from './trainDetail/TrainDetail'
import { searchTrainsByRoute, getTrainDetail } from '../../data/trainSchedule'
import background from '../../assets/background.jpg'

const TrainSchedule = () => {
  const [step, setStep] = useState('search') // 'search', 'list', 'detail'
  const [searchParams, setSearchParams] = useState(null)
  const [trains, setTrains] = useState([])
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [trainDetail, setTrainDetail] = useState(null)

  const handleSearch = (params) => {
    const results = searchTrainsByRoute(params.fromStation, params.toStation, params.date)
    setSearchParams(params)
    setTrains(results)
    setStep('list')
  }

  const handleSelectTrain = (train) => {
    setSelectedTrain(train)
    const detail = getTrainDetail(train.code)
    setTrainDetail(detail)
    setStep('detail')
  }

  const handleBackToList = () => {
    setStep('list')
    setSelectedTrain(null)
    setTrainDetail(null)
  }

  const handleBackToSearch = () => {
    setStep('search')
    setSearchParams(null)
    setTrains([])
    setSelectedTrain(null)
    setTrainDetail(null)
  }

  // Hiển thị kết quả (list / detail) -> layout không có background
  if (step === 'list' || step === 'detail') {
    return (
      <div className="min-h-screen bg-gray-100 pt-[13.4ch]">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {step === 'list' && (
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

          {step === 'detail' && (
            <TrainDetail
              trainDetail={trainDetail}
              onBack={handleBackToList}
            />
          )}
        </div>
      </div>
    )
  }

  // Bước tìm kiếm -> background ảnh + SearchForm overlay
  return (
    <div
      className="relative mt-[13.4ch] min-h-[calc(100vh-13.4ch)] w-full bg-cover bg-center bg-no-repeat"
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