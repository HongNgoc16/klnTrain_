// pages/bookingLookup/bookingSearch/BookingSearch.jsx
import React, { useState } from 'react'
import { FaMagnifyingGlass, FaTrash, FaTicket, FaPhone, FaEnvelope } from 'react-icons/fa6'
import { findBookingUnified, normalizeLocalBooking, normalizeMockBooking } from '../../../data/bookingMock'

const BookingSearch = ({ onSuccess, onError, setIsLoading }) => {
  const [form, setForm] = useState({ bookingCode: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.bookingCode.trim()) newErrors.bookingCode = 'Vui lòng nhập mã đặt chỗ'
    if (!form.phone.trim())       newErrors.phone       = 'Vui lòng nhập số điện thoại'
    if (!form.email.trim())       newErrors.email       = 'Vui lòng nhập email'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const result = findBookingUnified(form.bookingCode.trim(), form.phone.trim(), form.email.trim())

      if (!result) {
        onError('Không tìm thấy thông tin đặt chỗ. Vui lòng kiểm tra lại mã đặt chỗ, số điện thoại và email.')
        return
      }

      const normalized = result.source === 'local'
        ? normalizeLocalBooking(result.data)
        : normalizeMockBooking(result.data)

      onSuccess(normalized)
    } catch {
      onError('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ bookingCode: '', phone: '', email: '' })
    setErrors({})
  }

  return (
    <form className="w-full max-w-[420px] rounded-md bg-[#FDF2D6]/80 p-5 shadow-xl" onSubmit={handleSubmit}>
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-[#8C1D19]">CHUYẾN TÀU CỦA TÔI</h2>
        <p className="text-[#8C1D19]/70 text-sm">Nhập thông tin để tra cứu vé đã đặt</p>
      </div>

      {/* Mã đặt chỗ */}
      <div className="relative mb-4">
        <FaTicket className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black" />
        <input type="text" name="bookingCode" value={form.bookingCode} onChange={handleChange}
          placeholder="Mã đặt chỗ (ví dụ: ABC123)"
          
          className={`h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-[#FFD15A] ${errors.bookingCode ? 'border-2 border-red-500' : ''}`} />
        {errors.bookingCode && <p className="text-[#ff0800] text-xs mt-1 ml-1">{errors.bookingCode}</p>}
      </div>

      {/* Số điện thoại */}
      <div className="relative mb-4">
        <FaPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
          placeholder="Số điện thoại đặt vé"
          className={`h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-[#FFD15A] ${errors.phone ? 'border-2 border-red-500' : ''}`} />
        {errors.phone && <p className="text-[#ff0800] text-xs mt-1 ml-1">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div className="relative mb-6">
        <FaEnvelope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
        <input type="email" name="email" value={form.email} onChange={handleChange}
          placeholder="Email đặt vé"
          className={`h-12 w-full rounded-md bg-white pl-11 pr-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-[#FFD15A] ${errors.email ? 'border-2 border-red-500' : ''}`} />
        {errors.email && <p className="text-[#ff0800] text-xs mt-1 ml-1">{errors.email}</p>}
      </div>

      <div className="flex gap-3">
        <button type="submit"
          className="flex-1 flex h-12 items-center justify-center gap-2 rounded-md bg-[#FFD15A] text-base font-bold text-[#8C1D19] transition-colors hover:bg-[#ffe082]">
          <FaMagnifyingGlass className="h-4 w-4" /> Tra cứu
        </button>
        <button type="button" onClick={handleReset}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#8C1D19] px-4 text-base font-bold text-white transition-colors hover:bg-[#8C1D19]/60">
          <FaTrash className="h-4 w-4" /> Xóa
        </button>
      </div>

      <div className="mt-2 pt-1 border-t border-white/20 text-center">
        <p className="text-[#8C1D19] text-xs">THE KLN TRAIN — #Hành trình trở về</p>
      </div>
    </form>
  )
}

export default BookingSearch
