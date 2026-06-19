// pages/exchangeTicket/exchangeSearch/ExchangeSearch.jsx
import React, { useState } from 'react'
import { FaMagnifyingGlass, FaTrash, FaTicket, FaPhone, FaEnvelope } from 'react-icons/fa6'
import { lookupBooking } from '../../../api/bookings'
import { normalizeApiForCancel } from '../../../utils/normalizeBooking'

const ExchangeSearch = ({ onFound, onError }) => {
  const [form, setForm] = useState({ bookingCode: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    let processed = value
    if (name === 'bookingCode') processed = value.toUpperCase()
    else if (name === 'phone') processed = value.replace(/\D/g, '').slice(0, 10)
    setForm(prev => ({ ...prev, [name]: processed }))
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
    try {
      const res = await lookupBooking(
        form.bookingCode.trim().toUpperCase(),
        form.email.trim(),
        form.phone.trim()
      )
      const don = res.data || res
      if (!don) {
        onError('Không tìm thấy thông tin đặt chỗ. Vui lòng kiểm tra lại.')
        return
      }
      const booking = normalizeApiForCancel(don)
      if (booking.status === 'da_huy') return onError('Đơn đặt vé này đã bị hủy, không thể đổi vé.')
      if (!['da_thanh_toan', 'da_xac_nhan'].includes(booking.status)) {
        return onError('Chỉ có thể đổi vé đã thanh toán.')
      }
      onFound(booking)
    } catch (err) {
      if (err.status === 404 || err.status === 401) {
        onError('Không tìm thấy thông tin đặt chỗ. Vui lòng kiểm tra lại mã đặt chỗ, số điện thoại và email.')
      } else {
        onError(err.message || 'Có lỗi xảy ra, vui lòng thử lại')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setForm({ bookingCode: '', phone: '', email: '' }); setErrors({}) }

  const inputCls = (field) =>
    `h-11 w-full rounded-md bg-white pl-10 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#FFD15A] ${errors[field] ? 'border-2 border-red-500' : ''}`

  return (
    <form onSubmit={handleSubmit}
      className="w-full max-w-[400px] rounded-md bg-[#FDF2D6]/90 p-5 shadow-xl">

      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-[#8C1D19]">ĐỔI VÉ TÀU</h2>
        <p className="text-[#8C1D19]/70 text-xs">Nhập thông tin để tra cứu vé cần đổi</p>
      </div>

      <div className="relative mb-3">
        <FaTicket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input type="text" name="bookingCode" value={form.bookingCode}
          onChange={handleChange} placeholder="Mã đặt chỗ (6 ký tự)"
          style={{ textTransform: 'uppercase' }}
          className={inputCls('bookingCode')} />
        {errors.bookingCode && <p className="text-red-600 text-xs mt-1 ml-1">{errors.bookingCode}</p>}
      </div>

      <div className="relative mb-3">
        <FaPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input type="tel" name="phone" value={form.phone}
          onChange={handleChange} placeholder="Số điện thoại đặt vé" maxLength={10} inputMode="numeric"
          className={inputCls('phone')} />
        {errors.phone && <p className="text-red-600 text-xs mt-1 ml-1">{errors.phone}</p>}
      </div>

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

      <div className="rounded-md bg-amber-50/80 border border-amber-300 p-3 text-xs text-amber-800">
        <p className="font-semibold mb-1">Điều kiện đổi vé (theo ĐSVN):</p>
        <ul className="space-y-0.5">
          <li>Trước giờ khởi hành <strong>ít nhất 24 giờ</strong></li>
          <li>Mỗi vé chỉ được đổi <strong>01 lần duy nhất</strong></li>
          <li>Phí đổi vé: <strong>20.000đ/vé</strong></li>
          <li>Trong vòng 24h trước giờ khởi hành: <strong>không</strong> được phép đổi vé</li>
        </ul>
      </div>

      <div className="mt-2 border-t border-amber-300/40 pt-1 text-center">
        <p className="text-[#8C1D19] text-xs">THE KLN TRAIN - #Hành trình trở về</p>
      </div>
    </form>
  )
}

export default ExchangeSearch
