// pages/cancelTicket/cancelSearch/CancelSearch.jsx
import React, { useState } from 'react'
import { FaMagnifyingGlass, FaTrash, FaTicket, FaPhone, FaEnvelope } from 'react-icons/fa6'

const CancelSearch = ({ onFound, onError }) => {
  const [form, setForm] = useState({ bookingCode: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'bookingCode' ? value.toUpperCase() : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.bookingCode.trim()) errs.bookingCode = 'Vui lòng nhập mã đặt chỗ'
    if (!form.phone.trim())       errs.phone       = 'Vui lòng nhập số điện thoại'
    if (!form.email.trim())       errs.email       = 'Vui lòng nhập email'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const { findBookingUnified, normalizeCancelExchangeBooking } = await import('../../../data/bookingMock')
    await new Promise(r => setTimeout(r, 800))
    const result = findBookingUnified(form.bookingCode.trim(), form.phone.trim(), form.email.trim())
    setLoading(false)

    if (!result) return onError('Không tìm thấy thông tin đặt chỗ. Vui lòng kiểm tra lại mã đặt chỗ, số điện thoại và email.')
    const booking = normalizeCancelExchangeBooking(result)
    if (booking.status === 'da_huy') return onError('Đơn đặt vé này đã được hủy trước đó.')
    onFound(booking)
  }

  const handleReset = () => { setForm({ bookingCode: '', phone: '', email: '' }); setErrors({}) }

  const inputCls = (field) =>
    `h-11 w-full rounded-md bg-white pl-10 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#FFD15A] ${errors[field] ? 'border-2 border-red-500' : ''}`

  return (
    <form onSubmit={handleSubmit}
      className="w-full max-w-[400px] rounded-md bg-[#FDF2D6]/90 p-5 shadow-xl">

      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-[#8C1D19]">HỦY VÉ TÀU</h2>
        <p className="text-[#8C1D19]/70 text-xs">Nhập thông tin để tra cứu vé cần hủy</p>
      </div>

      {/* Mã đặt chỗ */}
      <div className="relative mb-3">
        <FaTicket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input type="text" name="bookingCode" value={form.bookingCode}
          onChange={handleChange} placeholder="Mã đặt chỗ (6 ký tự)"
          style={{ textTransform: 'uppercase' }}
          className={inputCls('bookingCode')} />
        {errors.bookingCode && <p className="text-red-600 text-xs mt-1 ml-1">{errors.bookingCode}</p>}
      </div>

      {/* Số điện thoại */}
      <div className="relative mb-3">
        <FaPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input type="tel" name="phone" value={form.phone}
          onChange={handleChange} placeholder="Số điện thoại đặt vé"
          className={inputCls('phone')} />
        {errors.phone && <p className="text-red-600 text-xs mt-1 ml-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div className="relative mb-4">
        <FaEnvelope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input type="email" name="email" value={form.email}
          onChange={handleChange} placeholder="Email đặt vé"
          className={inputCls('email')} />
        {errors.email && <p className="text-red-600 text-xs mt-1 ml-1">{errors.email}</p>}
      </div>

      <div className="flex gap-3 mb-4">
        <button type="submit" disabled={loading}
          className="flex-1 flex h-11 items-center justify-center gap-2 rounded-md bg-[#FFD15A] text-sm font-bold text-[#8C1D19] hover:bg-[#ffe082] disabled:opacity-60">
          <FaMagnifyingGlass className="h-4 w-4" />
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
        <button type="button" onClick={handleReset}
          className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#8C1D19] px-4 text-sm font-bold text-white hover:bg-[#7a1916]">
          <FaTrash className="h-4 w-4" /> Xóa
        </button>
      </div>

      {/* Chính sách */}
      <div className="rounded-md bg-amber-50/80 border border-amber-300 p-3 text-xs text-amber-800">
        <p className="font-semibold mb-1">Chính sách hủy vé (theo ĐSVN):</p>
        <ul className="space-y-0.5">
          <li>• Trước ≥ 3 ngày: <strong>hoàn 90%</strong></li>
          <li>• Trước 1–3 ngày: <strong>hoàn 75%</strong></li>
          <li>• Trước 4 giờ – 1 ngày: <strong>hoàn 50%</strong></li>
          <li>• Dưới 4 giờ / sau khởi hành: <strong>không hoàn</strong></li>
        </ul>
      </div>

      <div className="mt-3 border-t border-amber-300/40 pt-2 text-center">
        <p className="text-[#8C1D19] text-xs">THE KLN TRAIN — #Hành trình trở về</p>
      </div>
    </form>
  )
}

export default CancelSearch
