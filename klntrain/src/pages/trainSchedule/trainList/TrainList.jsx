// pages/trainSchedule/components/TrainList.jsx
import React from 'react'
import { formatDate } from '../../../utils/dateUtils'

const TrainList = ({ trains, onSelectTrain, fromStation, toStation, date }) => {

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Thông tin hành trình: {fromStation} → {toStation}
      </h3>
      <div className="text-sm text-gray-500 mb-4">
        Ngày đi: {formatDate(date)} | {fromStation}
      </div>

      <div className="space-y-3">
        {trains.map((train, index) => (
          <div
            key={train.code}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectTrain(train)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-[#8C1D19]">{train.name}</p>
                <p className="text-sm text-gray-500 mt-1">{train.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Khởi hành: {train.departTime}</p>
                <p className="text-sm text-gray-500">Đến nơi: {train.arriveTime}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              Ga đi: {train.fromStation} ({formatDate(train.departDate)} {train.departTime})<br />
              Ga đến: {train.toStation} ({formatDate(train.arriveDate)} {train.arriveTime})
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrainList