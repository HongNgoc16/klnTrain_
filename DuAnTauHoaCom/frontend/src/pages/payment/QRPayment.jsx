// pages/payment/QRPayment.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaCopy, FaCheck, FaTrain, FaCircleExclamation } from 'react-icons/fa6'
import RootLayout from '../../layout/RootLayout'
import { formatDate as formatDisplayDate } from '../../utils/dateUtils'
import { createPayment, confirmPayment, getPaymentStatus } from '../../api/payments'

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

const METHOD_LABELS = {
  qr:     'Chuyển khoản QR',
  credit: 'Thẻ tín dụng',
  momo:   'Ví MoMo',
  atm:    'Thẻ ATM nội địa',
}
const SIMULATED_METHODS = ['credit', 'momo', 'atm']

const QRPayment = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const pollRef  = useRef(null)
  const paymentCreatedRef = useRef(false)

  const bookingData = state || {}
  const trips       = bookingData.trips
  const isRoundTrip = bookingData.tripType === 'round-trip' && trips?.length === 2
  const orderCode   = bookingData.orderCode   // maDon từ API
  const bookingCode = bookingData.bookingCode || orderCode
  const idDon       = bookingData.idDon
  const passengers  = bookingData.passengersInfo || []
  const contactInfo = bookingData.contactInfo || {}
  const phuongThuc  = bookingData.phuongThuc || 'qr'
  const isSimulated = SIMULATED_METHODS.includes(phuongThuc)

  // Tính thời gian còn lại từ hetHan (DB) nếu có; fallback 15 phút cho đặt mới
  const hetHanMs = bookingData.hetHan ? new Date(bookingData.hetHan).getTime() : null

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!hetHanMs) return 15 * 60
    const remaining = Math.floor((hetHanMs - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  })
  const [copied, setCopied]           = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExpired, setIsExpired]     = useState(() => hetHanMs ? hetHanMs <= Date.now() : false)
  const [idThanhToan, setIdThanhToan] = useState(null)
  const [qrUrlFromApi, setQrUrlFromApi] = useState(null)
  const [totalAmount, setTotalAmount] = useState(bookingData.totalAmount || 0)
  const [paymentError, setPaymentError] = useState(null)
  const [confirmError, setConfirmError] = useState(null)

  // Tạo giao dịch thanh toán khi vào trang
  // Nếu từ luồng đổi vé, ThanhToan đã được tạo sẵn — dùng luôn, không tạo mới
  useEffect(() => {
    const presetId  = bookingData.idThanhToan
    const presetQr  = bookingData.qrUrlFromExchange
    if (presetId) {
      setIdThanhToan(presetId)
      if (presetQr) setQrUrlFromApi(presetQr)
      paymentCreatedRef.current = true
      return
    }
    if (!idDon || paymentCreatedRef.current) return
    paymentCreatedRef.current = true
    createPayment(idDon, phuongThuc)
      .then(res => {
        const d = res.data || res
        setIdThanhToan(d.idThanhToan)
        setQrUrlFromApi(d.qrUrl)
        if (d.soTien) setTotalAmount(d.soTien)
      })
      .catch(err => setPaymentError(err.message || 'Không tạo được giao dịch thanh toán'))
  }, [idDon])

  // Đếm ngược 15 phút
  useEffect(() => {
    if (timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          clearInterval(pollRef.current)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Auto-polling: kiểm tra trạng thái thanh toán mỗi 3 giây
  // Khi ngân hàng/SePay gọi webhook xác nhận → trang tự chuyển sang thành công
  useEffect(() => {
    if (!idThanhToan || isExpired || isSimulated) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await getPaymentStatus(idThanhToan)
        const d = res.data || res
        if (d.trang_thai === 'thanh_cong') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          const rawVes = d.DonDatVe?.Ves || []
          const veList = rawVes.map(v => ({
            idVe:          v.id_ve,
            idChuyen:      v.id_chuyen,
            soToa:         v.so_toa_thu_tu,
            soGhe:         v.so_ghe_trong_toa,
            giaVe:         parseFloat(v.gia_ve),
            loaiHanhKhach: v.loai_hanh_khach,
          }))
          navigate('/thanh-toan/thanh-cong', {
            state: {
              bookingCode,
              orderCode,
              isRoundTrip,
              trips,
              passengersInfo: passengers,
              contactInfo,
              totalAmount,
              tripType:     bookingData.tripType,
              isExchange:   bookingData.isExchange   || false,
              exchangeInfo: bookingData.exchangeInfo || null,
              veList,
            }
          })
        }
      } catch (_) {}
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [idThanhToan, isExpired])

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConfirm = async () => {
    if (isExpired || !idThanhToan) return
    setIsProcessing(true)
    try {
      const res = await confirmPayment(idThanhToan)
      const d = res.data || res
      navigate('/thanh-toan/thanh-cong', {
        state: {
          bookingCode:  d.maDatCho  || bookingCode,
          orderCode,
          isRoundTrip,
          trips,
          passengersInfo: passengers,
          contactInfo,
          totalAmount,
          tripType:     bookingData.tripType,
          isExchange:   bookingData.isExchange   || false,
          exchangeInfo: bookingData.exchangeInfo || null,
          veList:       d.veList    || [],
          soHoaDon:     d.soHoaDon,
        }
      })
    } catch (err) {
      setConfirmError(err.message || 'Xác nhận thanh toán thất bại. Vui lòng thử lại.')
      setIsProcessing(false)
    }
  }

  // QR URL từ API (hoặc fallback tạo tạm)
  const qrUrl = qrUrlFromApi
    || `https://img.vietqr.io/image/BIDV-9630630005144911-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(orderCode || '')}&accountName=KLN%20TRAIN`

  const bankInfo = [
    { label: 'Ngân hàng', value: 'BIDV - Ngân hàng TMCP Đầu tư và Phát triển VN' },
    { label: 'Số tài khoản', value: '9630630005144911', copy: true },
    { label: 'Chủ tài khoản', value: 'KLN TRAIN' },
    { label: 'Số tiền', value: formatPrice(totalAmount), copy: true },
    { label: 'Nội dung', value: orderCode, copy: true }
  ]

  const TripCard = ({ trip, title, isReturn = false }) => {
    if (!trip) return null
    const seatLabel = trip.coach?.type === 'NMCLC' ? 'Ghế' : 'Giường'
    return (
      <div className={`border rounded-lg overflow-hidden ${isReturn ? 'mt-3' : ''}`}>
        <div className={`px-3 py-1.5 text-xs font-bold ${isReturn ? 'bg-blue-50 text-blue-700' : 'bg-[#8C1D19]/10 text-[#8C1D19]'}`}>
          {title}
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-xl font-bold">{trip.departTime}</div>
              <div className="text-sm text-gray-600">{trip.fromStation}</div>
              <div className="text-xs text-gray-400">{formatDisplayDate(trip.departDate || trip.train?.departDate)}</div>
            </div>
            <div className="text-center text-xs text-gray-400">
              <div>{trip.duration}</div>
              <div className="w-10 h-px bg-gray-300 my-1 mx-auto" />
              <FaTrain className="mx-auto" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{trip.arriveTime}</div>
              <div className="text-sm text-gray-600">{trip.toStation}</div>
              <div className="text-xs text-gray-400">{formatDisplayDate(trip.arriveDate || trip.train?.arriveDate)}</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t text-xs text-gray-600 space-y-0.5">
            <div><span className="text-gray-400">Tàu: </span>{trip.train?.type} {trip.train?.code}</div>
            <div><span className="text-gray-400">Toa: </span>{trip.coach?.name}</div>
            <div><span className="text-gray-400">{seatLabel}: </span>{trip.seats?.join(', ')}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaCircleExclamation className="text-5xl text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Không có thông tin thanh toán</h2>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#8C1D19] text-white rounded-lg">Về trang chủ</button>
          </div>
        </div>
      </RootLayout>
    )
  }

  if (paymentError) {
    return (
      <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaCircleExclamation className="text-5xl text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi khởi tạo thanh toán</h2>
            <p className="text-gray-500 mb-4">{paymentError}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#8C1D19] text-white rounded-lg">Quay lại</button>
          </div>
        </div>
      </RootLayout>
    )
  }

  return (
    <RootLayout className="min-h-screen bg-gray-100 py-8 pt-[var(--nav-h)]">
      <div className="container mx-auto px-4 max-w-5xl">

        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#8C1D19] text-sm">
            <FaArrowLeft /> Quay lại
          </button>
          <div className="text-right">
            <div className="text-xs text-gray-400">Mã đặt chỗ</div>
            <div className="text-xl font-bold text-[#8C1D19] tracking-wider">{bookingCode}</div>
            <div className="text-xs text-gray-400">Mã đơn: {orderCode}</div>
          </div>
        </div>

        {/* Banner thời gian */}
        {isExpired ? (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center mb-5">
            <FaCircleExclamation className="text-red-500 text-2xl mx-auto mb-1" />
            <p className="font-bold text-red-700">Hết thời gian thanh toán</p>
            <p className="text-sm text-red-600 mt-1">Đặt chỗ đã hết hạn. Ghế đã được giải phóng. Vui lòng đặt lại.</p>
            <button onClick={() => navigate('/')} className="mt-3 px-5 py-2 bg-[#8C1D19] text-white rounded-lg text-sm">
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className={`border rounded-lg p-3 text-center mb-5 flex items-center justify-center gap-3 ${
            timeLeft <= 120 ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-200'
          }`}>
            <FaClock className={timeLeft <= 120 ? 'text-red-500' : 'text-orange-400'} />
            <span className="text-sm">Thời gian còn lại để thanh toán:</span>
            <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 120 ? 'text-red-600' : 'text-orange-500'}`}>
              {formatTime()}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Cột trái: QR + thông tin chuyển khoản (hoặc cổng thanh toán mô phỏng) */}
          <div className="space-y-4">

            {isSimulated ? (
              /* Cổng thanh toán mô phỏng (chưa tích hợp cổng thật) */
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="font-bold text-gray-800 mb-2">Thanh toán qua {METHOD_LABELS[phuongThuc]}</p>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 my-3">
                  <p className="text-sm text-gray-500">
                    Phương thức <strong>{METHOD_LABELS[phuongThuc]}</strong> hiện được mô phỏng — hệ thống chưa kết nối cổng thanh toán thật.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Nhấn <strong>"Xác nhận thanh toán"</strong> ở cột bên phải để mô phỏng giao dịch thành công.
                  </p>
                </div>
                <p className="text-xs text-gray-400">Mã đơn: {orderCode}</p>
              </div>
            ) : (
              <>
                {/* QR Code VietQR */}
                <div className="bg-white rounded-lg shadow p-5 text-center">
                  <p className="font-bold text-gray-800 mb-3">Quét mã QR để thanh toán</p>
                  <div className="flex justify-center">
                    <img
                      src={qrUrl}
                      alt="QR thanh toán"
                      className="w-52 h-52 object-contain border rounded-lg"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Dùng ứng dụng ngân hàng hoặc VietQR để quét</p>
                  <p className="text-xs text-orange-500 mt-1 font-medium">Nhập đúng nội dung <strong>{orderCode}</strong> khi chuyển khoản</p>
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="bg-white rounded-lg shadow p-5">
                  <h2 className="font-bold text-gray-800 mb-3">Thông tin chuyển khoản thủ công</h2>
                  <div className="space-y-2">
                    {bankInfo.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b last:border-b-0 py-2">
                        <div>
                          <div className="text-xs text-gray-500">{item.label}</div>
                          <div className="font-medium text-sm">{item.value}</div>
                        </div>
                        {item.copy && (
                          <button onClick={() => copyText(item.value, item.label)} className="text-[#ff8a00] p-1">
                            {copied === item.label ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                    * Chuyển đúng số tiền và nội dung để hệ thống tự động xác nhận vé
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cột phải: Tổng tiền + xác nhận + thông tin chuyến */}
          <div className="space-y-4">

            {/* Xác nhận */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="text-center mb-4">
                <p className="text-gray-500 text-sm">Tổng thanh toán</p>
                <p className="text-3xl font-bold text-[#ff8a00]">{formatPrice(totalAmount)}</p>
              </div>
              {/* Thông báo hệ thống đang tự động kiểm tra (chỉ áp dụng cho QR/chuyển khoản) */}
              {!isSimulated && idThanhToan && !isExpired && !isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg py-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Đang tự động kiểm tra thanh toán...
                </div>
              )}
              <button
                onClick={handleConfirm}
                disabled={isProcessing || isExpired || !idThanhToan}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                  isExpired
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isProcessing || !idThanhToan
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#ff8a00] text-white hover:bg-[#e07a00] shadow-md'
                }`}
              >
                {isProcessing ? 'Đang xử lý...' : isExpired ? 'Đã hết hạn' : !idThanhToan ? 'Đang khởi tạo...' : isSimulated ? '✓ Xác nhận thanh toán' : '✓ Xác nhận thủ công'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                {isSimulated ? 'Mô phỏng giao dịch thành công qua ' + METHOD_LABELS[phuongThuc] : 'Nhấn nếu hệ thống chưa tự xác nhận sau khi chuyển khoản'}
              </p>
              {confirmError && (
                <p className="text-red-600 text-xs text-center mt-2 bg-red-50 rounded p-2">{confirmError}</p>
              )}
            </div>

            {/* Thông tin chuyến tàu */}
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="font-bold text-gray-800 mb-3">Thông tin chuyến</h3>
              {isRoundTrip ? (
                <>
                  <TripCard trip={trips[0]} title="CHIỀU ĐI" />
                  <TripCard trip={trips[1]} title="CHIỀU VỀ" isReturn />
                </>
              ) : (
                <TripCard trip={trips?.[0]} title="CHIỀU ĐI" />
              )}
              <div className="text-xs text-gray-500 mt-2">
                {passengers.length} hành khách · {isRoundTrip ? 'Khứ hồi' : 'Một chiều'}
              </div>
            </div>

            {/* Hành khách */}
            {passengers.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-gray-800 mb-2 text-sm">Hành khách</h3>
                <div className="space-y-1.5">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="text-sm border-b last:border-b-0 pb-1.5">
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-xs text-gray-500">
                        Ngày sinh: {p.birthDate || '--'}
                        {p.idCard && ` | CCCD: ${p.idCard}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 bg-white rounded-lg shadow p-3 text-center text-xs text-gray-500">
          Cần hỗ trợ? Gọi hotline: <a href="tel:19002087" className="text-[#ff8a00] font-semibold">1900 2087</a> (7h30 - 23h hàng ngày)
        </div>
      </div>
    </RootLayout>
  )
}

export default QRPayment
