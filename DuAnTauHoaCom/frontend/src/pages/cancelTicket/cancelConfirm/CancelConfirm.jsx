// pages/cancelTicket/cancelConfirm/CancelConfirm.jsx
// Xác nhận hủy vé + nhập thông tin tài khoản để hoàn tiền.
//
// Theo quy định ĐSVN:
//   - Đặt vé online (QR, MoMo, Thẻ): tiền tự động hoàn về phương thức gốc
//     trong 3–7 ngày làm việc. Khách KHÔNG cần nhập tài khoản.
//   - Đặt vé tại quầy / nộp tiền mặt: BẮT BUỘC cung cấp tài khoản ngân
//     hàng để hệ thống chuyển khoản hoàn tiền.
//   - Trường hợp muốn hoàn về tài khoản khác phương thức gốc: điền vào
//     phần "Tài khoản hoàn tiền khác" (tùy chọn cho online).
import React, { useState } from 'react'
import { FaArrowLeft, FaChevronDown, FaChevronUp, FaUniversity } from 'react-icons/fa'
import { calculateRefund } from '../../../data/bookingMock'

const fmt = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const ONLINE_METHODS = ['qr', 'momo', 'thẻ', 'visa', 'master', 'jcb', 'atm', 'vnpay', 'zalopay']

const isOnlinePayment = (paymentMethod) =>
  ONLINE_METHODS.some(m => paymentMethod.toLowerCase().includes(m)) ||
  paymentMethod.toLowerCase().includes('chuyển khoản') ||
  paymentMethod.toLowerCase().includes('ví')

const BANKS = [
  'Vietcombank', 'BIDV', 'VietinBank', 'Agribank', 'Techcombank',
  'MB Bank', 'ACB', 'Sacombank', 'VPBank', 'TPBank', 'SHB', 'MSB',
  'OCB', 'HDBank', 'VIB', 'SeABank', 'Eximbank', 'NamABank'
]

const CancelConfirm = ({ booking, selectedKeys, onBack, onConfirm }) => {
  const [confirming, setConfirming] = useState(false)
  const [showAltAccount, setShowAltAccount] = useState(false)
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountHolder: '' })
  const [bankErrors, setBankErrors] = useState({})

  const isOnline = isOnlinePayment(booking.paymentMethod)

  // Thu thập vé đã chọn + chính sách hoàn tiền
  const selectedItems = booking.trips.flatMap(trip =>
    trip.passengers
      .filter(p => selectedKeys.includes(`${trip.tripId}_${p.id}`))
      .map(p => ({ trip, passenger: p, policy: calculateRefund(trip.departDate, trip.departTime) }))
  )

  const totalRefund = selectedItems.reduce(
    (s, { passenger, policy }) => s + Math.round(passenger.price * policy.refundRate), 0)
  const totalFee = selectedItems.reduce(
    (s, { passenger, policy }) => s + Math.round(passenger.price * policy.feeRate), 0)

  const handleBankChange = (field, value) => {
    setBankForm(prev => ({ ...prev, [field]: value }))
    setBankErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateBank = () => {
    if (!showAltAccount && isOnline) return true // không cần validate nếu không chọn tài khoản khác
    const errs = {}
    if (!bankForm.bankName)       errs.bankName       = 'Vui lòng chọn ngân hàng'
    if (!bankForm.accountNumber)  errs.accountNumber  = 'Vui lòng nhập số tài khoản'
    if (!bankForm.accountHolder)  errs.accountHolder  = 'Vui lòng nhập tên chủ tài khoản'
    setBankErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleConfirm = async () => {
    if (!validateBank()) return
    setConfirming(true)
    try {
      await onConfirm()
    } catch {
      setConfirming(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-[#8C1D19] mb-5 transition-colors">
        <FaArrowLeft /> Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h2 className="text-lg font-bold text-[#8C1D19] border-l-4 border-[#8C1D19] pl-3 mb-5">
          Xác nhận hủy vé
        </h2>

        {/* Chi tiết từng vé */}
        <div className="space-y-4 mb-5">
          {selectedItems.map(({ trip, passenger, policy }, idx) => {
            const feeAmt    = Math.round(passenger.price * policy.feeRate)
            const refundAmt = Math.round(passenger.price * policy.refundRate)
            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{passenger.fullName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trip.trainCode} · {trip.fromStation} → {trip.toStation}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trip.departDate} {trip.departTime} · Toa {trip.coachNumber} · Ghế {passenger.seat}
                    </p>
                  </div>
                  <p className="font-medium text-sm shrink-0 ml-3">{fmt(passenger.price)}</p>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
                  <span className="text-red-500">
                    Phí hủy ({(policy.feeRate * 100).toFixed(0)}%): −{fmt(feeAmt)}
                  </span>
                  <span className="text-green-600 font-semibold">Hoàn lại: {fmt(refundAmt)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tổng kết */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Tổng phí hủy vé</span>
            <span className="text-red-500 font-medium">−{fmt(totalFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
            <span>Tổng tiền hoàn lại</span>
            <span className="text-green-600 text-lg">{fmt(totalRefund)}</span>
          </div>
        </div>

        {/* ── Thông tin tài khoản hoàn tiền ────────────────────── */}
        <div className="mb-5">
          {isOnline ? (
            // Thanh toán online → tự động hoàn, nhưng cho phép chỉ định tài khoản khác
            <div>
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 mb-3">
                <FaUniversity className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Hoàn tiền tự động</p>
                  <p className="text-xs mt-0.5">
                    Tiền hoàn sẽ được trả về phương thức thanh toán gốc
                    (<strong>{booking.paymentMethod}</strong>) trong vòng <strong>3–7 ngày làm việc</strong>.
                    Không cần nhập thêm thông tin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAltAccount(v => !v)}
                className="flex items-center gap-2 text-sm text-[#8C1D19] hover:underline"
              >
                {showAltAccount ? <FaChevronUp /> : <FaChevronDown />}
                Hoàn về tài khoản ngân hàng khác (tùy chọn)
              </button>
            </div>
          ) : (
            // Thanh toán tại quầy / tiền mặt → BẮT BUỘC nhập tài khoản
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-3">
              <p className="font-semibold mb-1">Thông tin tài khoản hoàn tiền <span className="text-red-500">*</span></p>
              <p className="text-xs">Vé thanh toán tại quầy — vui lòng cung cấp tài khoản để nhận tiền hoàn.</p>
            </div>
          )}

          {/* Form tài khoản ngân hàng */}
          {(!isOnline || showAltAccount) && (
            <div className="mt-3 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ngân hàng {!isOnline && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={bankForm.bankName}
                  onChange={e => handleBankChange('bankName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 ${bankErrors.bankName ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {bankErrors.bankName && <p className="text-red-500 text-xs mt-1">{bankErrors.bankName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Số tài khoản {!isOnline && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={e => handleBankChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập số tài khoản"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 ${bankErrors.accountNumber ? 'border-red-400' : 'border-gray-300'}`}
                />
                {bankErrors.accountNumber && <p className="text-red-500 text-xs mt-1">{bankErrors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản {!isOnline && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={e => handleBankChange('accountHolder', e.target.value.toUpperCase())}
                  placeholder="Nhập đúng tên in hoa trên thẻ (VD: NGUYEN VAN AN)"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C1D19]/30 ${bankErrors.accountHolder ? 'border-red-400' : 'border-gray-300'}`}
                />
                {bankErrors.accountHolder && <p className="text-red-500 text-xs mt-1">{bankErrors.accountHolder}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Lưu ý */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 mb-6 space-y-1">
          <p className="font-semibold text-sm mb-1.5">Lưu ý quan trọng:</p>
          <p>• Vé sau khi hủy <strong>không thể khôi phục lại</strong></p>
          <p>• Thời gian hoàn tiền: <strong>3–7 ngày làm việc</strong></p>
          <p>• Thông báo xác nhận gửi đến: <strong>{booking.contactEmail}</strong></p>
          <p>• Hotline hỗ trợ: <strong>1900 2087</strong> (8h–20h hàng ngày)</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={handleConfirm} disabled={confirming}
            className="flex-1 py-2.5 bg-[#8C1D19] text-white rounded-lg font-semibold hover:bg-[#7a1916] disabled:opacity-60 transition-colors">
            {confirming ? 'Đang xử lý...' : 'Xác nhận hủy vé'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelConfirm
