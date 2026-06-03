// pages/cancelTicket/cancelSuccess/CancelSuccess.jsx
import React from 'react'
import { FaCircleCheck } from 'react-icons/fa6'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const CancelSuccess = ({ booking, cancelRef, totalRefund, onReset }) => (
  <div className="max-w-xl mx-auto">
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <FaCircleCheck className="text-green-500 text-6xl mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Hủy vé thành công!</h2>
      <p className="text-gray-500 text-sm mb-1">Mã yêu cầu hủy</p>
      <p className="text-2xl font-bold text-[#8C1D19] mb-6">{cancelRef}</p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-1.5 text-sm text-gray-700 mb-4">
        <p className="font-semibold text-green-700 mb-2">Thông tin hoàn tiền:</p>
        <p>• Số tiền hoàn: <strong className="text-green-700">{fmt(totalRefund)}</strong></p>
        <p>• Phương thức hoàn: <strong>{booking.paymentMethod}</strong></p>
        <p>• Thời gian xử lý: <strong>3–7 ngày làm việc</strong></p>
        <p>• Xác nhận gửi về: <strong>{booking.contactEmail}</strong></p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500 mb-6">
        Lưu mã yêu cầu <strong>{cancelRef}</strong> để kiểm tra trạng thái hoàn tiền qua
        hotline <strong>1900 2087</strong> (8h–20h hàng ngày).
      </div>

      <button onClick={onReset}
        className="px-6 py-2.5 bg-[#ff8a00] text-white rounded-lg font-semibold hover:bg-[#e07a00] transition-colors">
        Hủy vé khác
      </button>
    </div>
  </div>
)

export default CancelSuccess
