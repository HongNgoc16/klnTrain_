const { v4: uuidv4 } = require('uuid')

// Sinh mã đặt chỗ 6 ký tự (chữ in hoa + số, bỏ ký tự dễ nhầm)
const genBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Sinh mã đơn hàng KLN + 6 chữ số
const genOrderCode = () => 'KLN' + String(Math.floor(100000 + Math.random() * 900000))

// Sinh mã giao dịch UUID
const genTransactionCode = () => uuidv4().replace(/-/g, '').substring(0, 20).toUpperCase()

// Sinh số hóa đơn
const genInvoiceNumber = () => {
  const now = new Date()
  return `HD${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
}

// Format giá tiền VND
const formatVND = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' đ'

// Tính phí hủy vé theo số giờ còn lại
const calcCancelFee = (departDateStr, departTimeStr) => {
  const [d, m, y] = departDateStr.split('/')
  const [h, min] = departTimeStr.split(':')
  const departAt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min))
  const hoursLeft = (departAt - new Date()) / (1000 * 60 * 60)

  if (hoursLeft < 0)   return { refundRate: 0,    feeRate: 1,    canCancel: false, label: 'Tàu đã khởi hành' }
  if (hoursLeft >= 72) return { refundRate: 0.9,  feeRate: 0.1,  canCancel: true,  label: 'Trước 3 ngày — hoàn 90%' }
  if (hoursLeft >= 24) return { refundRate: 0.75, feeRate: 0.25, canCancel: true,  label: 'Trước 1–3 ngày — hoàn 75%' }
  if (hoursLeft >= 4)  return { refundRate: 0.5,  feeRate: 0.5,  canCancel: true,  label: 'Trước 4h–1 ngày — hoàn 50%' }
  return                      { refundRate: 0,    feeRate: 1,    canCancel: false, label: 'Dưới 4 giờ — không hoàn' }
}

// Phí đổi vé (5% giá vé, tối thiểu 20.000đ)
const calcExchangeFee = (originalPrice) => Math.max(Math.round(originalPrice * 0.05), 20000)

module.exports = { genBookingCode, genOrderCode, genTransactionCode, genInvoiceNumber, formatVND, calcCancelFee, calcExchangeFee }
