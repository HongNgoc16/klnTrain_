// pages/trainSchedule/components/TrainDetail.jsx
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { formatDate } from '../../../utils/dateUtils'

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

const TrainDetail = ({ trainDetail, onBack }) => {
  if (!trainDetail) return null

  const { code, name, fromStation, toStation, departTime, arriveTime, departDate, arriveDate, duration, stations, prices } = trainDetail

  return (
    <div className="space-y-6">
      {/* Nút quay lại */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] transition-colors"
      >
        <FaArrowLeft /> Quay lại danh sách
      </button>

      {/* Thông tin chuyến tàu */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-[#8C1D19] mb-4">{name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Ga đi</p>
            <p className="font-semibold text-lg">{fromStation}</p>
            <p className="text-sm text-gray-500">Ngày đi: {formatDate(departDate)} {departTime}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Ga đến</p>
            <p className="font-semibold text-lg">{toStation}</p>
            <p className="text-sm text-gray-500">Ngày đến: {formatDate(arriveDate)} {arriveTime}</p>
          </div>
        </div>

        <div className="text-center py-3 bg-[#8C1D19]/10 rounded-lg">
          <p className="font-semibold text-[#8C1D19]">Thời gian hành trình: {duration}</p>
        </div>
      </div>

      {/* Các ga trong hành trình */}
      {stations && stations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Các ga trong hành trình</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">STT</th>
                  <th className="px-4 py-2 text-left">Ga đi</th>
                  <th className="px-4 py-2 text-right">Cự ly (Km)</th>
                  <th className="px-4 py-2 text-left">Ngày đi</th>
                  <th className="px-4 py-2 text-center">Giờ đến</th>
                  <th className="px-4 py-2 text-center">Giờ đi</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((station) => (
                  <tr key={station.stt} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{station.stt}</td>
                    <td className="px-4 py-2 font-medium">{station.name}</td>
                    <td className="px-4 py-2 text-right">{station.distance.toLocaleString()}</td>
                    <td className="px-4 py-2">{formatDate(station.date)}</td>
                    <td className="px-4 py-2 text-center">{station.arriveTime}</td>
                    <td className="px-4 py-2 text-center">{station.departTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bảng giá vé */}
      {prices && prices.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Bảng giá vé</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">STT</th>
                  <th className="px-4 py-2 text-left">Mã</th>
                  <th className="px-4 py-2 text-left">Loại chỗ</th>
                  <th className="px-4 py-2 text-right">Giá vé (₫)</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.stt} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{price.stt}</td>
                    <td className="px-4 py-2 font-mono text-sm">{price.code}</td>
                    <td className="px-4 py-2">{price.name}</td>
                    <td className="px-4 py-2 text-right font-semibold text-[#8C1D19]">
                      {formatPrice(price.price)} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainDetail