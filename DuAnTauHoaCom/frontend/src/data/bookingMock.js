// src/data/bookingMock.js

const KLN_BOOKINGS_KEY = 'KLN_BOOKINGS'

// Tạo mã vé 9 chữ số — phải giống hệt hàm trong PaymentSuccess.jsx
const genTicketCode = (seed) => {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = (((h << 5) + h) ^ seed.charCodeAt(i)) >>> 0
  return String((h % 900000000) + 100000000)
}

// ─── Mock bookings cố định (đã thanh toán) ──────────────────────
export const MOCK_BOOKINGS = {
  'KLN001': {
    bookingCode: 'KLN001',
    contactPhone: '0912 345 678',
    contactEmail: 'nguyenvanan@gmail.com',
    bookingDate: '08/05/2026',
    paymentMethod: 'Chuyển khoản QR',
    status: 'da_thanh_toan',
    trips: [
      {
        tripId: 1,
        trainCode: 'SE8',
        trainType: 'Tàu Tốc Hành',
        fromStation: 'Sài Gòn',
        toStation: 'Hà Nội',
        departDate: '20/06/2026',
        departTime: '06:00',
        arriveDate: '21/06/2026',
        arriveTime: '16:10',
        duration: '1 ngày 10 giờ 10 phút',
        coachNumber: '4',
        coachName: 'Toa 4: Giường nằm khoang 4 điều hòa',
        coachType: 'GN4AC',
        passengers: [
          { id: 1, fullName: 'Nguyễn Văn An', idCard: '012345678901', birthDate: '15/03/1990', seat: '12', type: 'adult', price: 2246000 },
          { id: 2, fullName: 'Trần Thị Bình', idCard: '098765432100', birthDate: '22/07/1992', seat: '13', type: 'adult', price: 2246000 }
        ],
        totalPrice: 4492000
      }
    ]
  },
  'VTL002': {
    bookingCode: 'VTL002',
    contactPhone: '0987 654 321',
    contactEmail: 'lethi@email.com',
    bookingDate: '05/05/2026',
    paymentMethod: 'Ví MoMo',
    status: 'da_thanh_toan',
    trips: [
      {
        tripId: 1,
        trainCode: 'SE6',
        trainType: 'Tàu Tốc Hành',
        fromStation: 'Sài Gòn',
        toStation: 'Hà Nội',
        departDate: '12/05/2026',
        departTime: '08:40',
        arriveDate: '13/05/2026',
        arriveTime: '19:12',
        duration: '1 ngày 10 giờ 32 phút',
        coachNumber: '3',
        coachName: 'Toa 3: Giường nằm khoang 6 điều hòa',
        coachType: 'GN6AC',
        passengers: [
          { id: 1, fullName: 'Lê Thị Cúc', idCard: '112233445566', birthDate: '10/01/1995', seat: '5', type: 'adult', price: 1350000 }
        ],
        totalPrice: 1350000
      }
    ]
  }
}

// ─── Đọc bookings từ localStorage ───────────────────────────────
export const getLocalBooking = (bookingCode) => {
  try {
    const bookings = JSON.parse(localStorage.getItem(KLN_BOOKINGS_KEY) || '{}')
    const booking = bookings[bookingCode?.toUpperCase?.()?.trim() || bookingCode]
    if (!booking) return null

    // Kiểm tra hết hạn
    if (booking.status === 'cho_thanh_toan' && Date.now() > booking.expiresAt) {
      booking.status = 'het_han'
      bookings[booking.bookingCode] = booking
      localStorage.setItem(KLN_BOOKINGS_KEY, JSON.stringify(bookings))
    }

    return booking
  } catch {
    return null
  }
}

// ─── Tìm booking theo mã + sđt + email (cả hai bắt buộc khớp) ──
export const findBookingUnified = (bookingCode, phone = '', email = '') => {
  const code = bookingCode.trim().toUpperCase()
  const phoneNorm = phone.trim().replace(/\s/g, '')
  const emailNorm = email.trim().toLowerCase()

  // 1. Kiểm tra localStorage trước (theo bookingCode)
  const local = getLocalBooking(code)
  if (local) {
    const storedPhone = (local.contactInfo?.phone || '').replace(/\s/g, '')
    const storedEmail = (local.contactInfo?.email || '').toLowerCase()
    const phoneMatch = storedPhone.includes(phoneNorm) || phoneNorm.includes(storedPhone.slice(-7))
    const emailMatch = storedEmail === emailNorm
    return (phoneMatch && emailMatch) ? { source: 'local', data: local } : null
  }

  // 2. Kiểm tra mock data
  const mock = MOCK_BOOKINGS[code]
  if (mock) {
    const storedPhone = (mock.contactPhone || '').replace(/\s/g, '')
    const storedEmail = (mock.contactEmail || '').toLowerCase()
    const phoneMatch = storedPhone.includes(phoneNorm) || phoneNorm.includes(storedPhone.slice(-7))
    const emailMatch = storedEmail === emailNorm
    return (phoneMatch && emailMatch) ? { source: 'mock', data: mock } : null
  }

  return null
}

// ─── Chuẩn hóa dữ liệu local booking sang format BookingResult ──
export const normalizeLocalBooking = (booking) => {
  const passengersInfo = booking.passengersInfo || []
  const trips = booking.trips || []

  // Tính giá mỗi hành khách theo từng chuyến
  const passengers = passengersInfo.map((p, idx) => {
    const priceByTrip = trips.map(t => t.passengerSeats?.[idx]?.seatPrice || 0)
    const seatTotal = priceByTrip.reduce((s, v) => s + v, 0)
    const fallback = Math.round((booking.totalAmount || 0) / (passengersInfo.length || 1))
    return {
      fullName: p.fullName,
      idCard: p.idCard,
      birthDate: p.birthDate,
      type: p.isChild ? 'child' : 'adult',
      price: seatTotal > 0 ? seatTotal : fallback,
      priceByTrip: priceByTrip.some(v => v > 0) ? priceByTrip : null
    }
  })

  // Tính phí dịch vụ = tổng đã thanh toán - tổng giá vé thuần
  const totalSeatPrices = passengers.reduce((s, p) => s + (p.price || 0), 0)
  const serviceFee = Math.max(0, (booking.totalAmount || 0) - totalSeatPrices)

  return {
    source: 'local',
    bookingCode: booking.bookingCode,
    ticketCode: genTicketCode(`${booking.bookingCode}00`),
    status: booking.status,
    expiresAt: booking.expiresAt,
    createdAt: booking.createdAt,
    paidAt: booking.paidAt,
    customer: {
      fullName: passengersInfo[0]?.fullName || '',
      email: booking.contactInfo?.email || '',
      phone: booking.contactInfo?.phone || ''
    },
    bookingDate: booking.createdAt
      ? new Date(booking.createdAt).toLocaleString('vi-VN')
      : '--',
    paymentStatus: booking.status === 'da_thanh_toan' ? 'da_thanh_toan'
      : booking.status === 'het_han' ? 'het_han'
      : booking.status === 'da_huy' ? 'da_huy'
      : 'cho_thanh_toan',
    bookingStatus: booking.status === 'da_thanh_toan' ? 'da_xac_nhan'
      : booking.status === 'da_huy' ? 'da_huy'
      : 'cho_xac_nhan',
    orderCode: booking.orderCode || '',
    passengers,
    serviceFee,
    journeys: trips.map(t => ({
      fromStation: t.fromStation,
      toStation: t.toStation,
      departDate: t.departDate || t.departureDate || t.train?.departDate,
      departTime: t.departTime || t.train?.departTime,
      arriveDate: t.arriveDate || t.train?.arriveDate,
      arriveTime: t.arriveTime || t.train?.arriveTime,
      duration: t.duration,
      trainCode: t.train?.code,
      trainType: t.train?.type,
      coachNumber: t.coach?.id || t.coach?.number,
      coachName: t.coach?.name,
      coachType: t.coach?.type,
      seats: t.seats
    })),
    totalPrice: booking.totalAmount,
    contactInfo: booking.contactInfo,
    rawTrips: trips,
    rawPassengers: passengersInfo
  }
}

// ─── Chuẩn hóa mock booking sang format BookingResult ────────────
export const normalizeMockBooking = (booking) => ({
  source: 'mock',
  bookingCode: booking.bookingCode,
  ticketCode: genTicketCode(`${booking.bookingCode}00`),
  status: 'da_thanh_toan',
  expiresAt: null,
  customer: {
    fullName: booking.trips[0]?.passengers[0]?.fullName || '',
    email: booking.contactEmail || '',
    phone: booking.contactPhone || ''
  },
  bookingDate: booking.bookingDate,
  paymentStatus: 'da_thanh_toan',
  bookingStatus: 'da_xac_nhan',
  passengers: booking.trips.flatMap(t => t.passengers.map(p => ({
    fullName: p.fullName,
    idCard: p.idCard,
    birthDate: p.birthDate,
    type: p.type || 'adult',
    price: p.price
  }))),
  journeys: booking.trips.map(t => ({
    fromStation: t.fromStation,
    toStation: t.toStation,
    departDate: t.departDate,
    departTime: t.departTime,
    arriveDate: t.arriveDate,
    arriveTime: t.arriveTime,
    duration: t.duration,
    trainCode: t.trainCode,
    trainType: t.trainType,
    coachNumber: t.coachNumber,
    coachName: t.coachName,
    coachType: t.coachType,
    seats: t.passengers.map(p => p.seat)
  })),
  totalPrice: booking.trips.reduce((s, t) => s + t.totalPrice, 0),
  serviceFee: 0,
  contactInfo: { phone: booking.contactPhone, email: booking.contactEmail }
})

// ─── Chuẩn hóa dữ liệu cho Cancel / Exchange ────────────────────
export const normalizeCancelExchangeBooking = ({ source, data }) => {
  if (source === 'mock') {
    return {
      ...data,
      contactEmail: data.contactEmail,
      trips: data.trips.map(t => ({
        ...t,
        trainName: `${t.trainType || ''} ${t.trainCode || ''}`.trim(),
      }))
    }
  }
  // localStorage booking
  const b = data
  return {
    bookingCode: b.bookingCode,
    orderCode: b.orderCode,
    bookingDate: b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : '--',
    paymentMethod: 'Chuyển khoản QR',
    contactPhone: b.contactInfo?.phone || '--',
    contactEmail: b.contactInfo?.email || '--',
    status: b.status,
    trips: b.trips?.map((t, tIdx) => {
      const trainCode = t.train?.code || ''
      const trainType = t.train?.type || ''
      return {
        tripId: tIdx + 1,
        trainCode,
        trainType,
        trainName: `${trainType} ${trainCode}`.trim(),
        fromStation: t.fromStation,
        toStation: t.toStation,
        departDate: t.departDate || t.train?.departDate || '',
        departTime: t.departTime || t.train?.departTime || '',
        arriveDate: t.arriveDate || t.train?.arriveDate || '',
        arriveTime: t.arriveTime || t.train?.arriveTime || '',
        duration: t.duration || '',
        coachNumber: t.passengerSeats?.[0]?.coachId || t.coach?.id || '',
        coachName: t.passengerSeats?.[0]?.coachName || t.coach?.name || '',
        coachType: t.passengerSeats?.[0]?.coachType || t.coach?.type || '',
        passengers: b.passengersInfo?.map((p, pIdx) => ({
          id: pIdx + 1,
          fullName: p.fullName,
          idCard: p.idCard || '',
          birthDate: p.birthDate || '',
          type: p.isChild ? 'child' : 'adult',
          seat: t.passengerSeats?.[pIdx]?.seatNumber || t.seats?.[pIdx] || '--',
          price: t.passengerSeats?.[pIdx]?.seatPrice ||
            Math.round((t.totalPrice || b.totalAmount || 0) / (b.passengersInfo?.length || 1))
        })) || []
      }
    }) || []
  }
}

// ─── Cập nhật trạng thái booking trong localStorage ─────────────
export const updateLocalBookingStatus = (bookingCode, status, extra = {}) => {
  try {
    const bookings = JSON.parse(localStorage.getItem(KLN_BOOKINGS_KEY) || '{}')
    const key = bookingCode?.toUpperCase?.()?.trim() || bookingCode
    if (bookings[key]) {
      bookings[key] = { ...bookings[key], status, ...extra }
      localStorage.setItem(KLN_BOOKINGS_KEY, JSON.stringify(bookings))
    }
  } catch {}
}

// ─── Legacy functions (dùng bởi cancelTicket / exchangeTicket) ──
export const findBooking = (bookingCode, lastName, middleAndFirstName = '') => {
  const booking = MOCK_BOOKINGS[bookingCode.toUpperCase().trim()]
  if (!booking) return null
  const inputName = `${lastName} ${middleAndFirstName}`.toLowerCase().trim()
  const allNames = booking.trips.flatMap(t => t.passengers.map(p => p.fullName.toLowerCase()))
  const matched = allNames.some(name =>
    name.includes(lastName.toLowerCase().trim()) ||
    inputName.split(' ').some(word => word.length > 1 && name.includes(word))
  )
  return matched ? booking : null
}

export const calculateRefund = (departDateStr, departTimeStr) => {
  const [d, m, y] = departDateStr.split('/')
  const [h, min] = departTimeStr.split(':')
  const departAt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min))
  const hoursLeft = (departAt - new Date()) / (1000 * 60 * 60)
  if (hoursLeft < 0)   return { refundRate: 0,    feeRate: 1,    label: 'Tàu đã khởi hành',                        canAct: false }
  if (hoursLeft >= 72) return { refundRate: 0.9,  feeRate: 0.1,  label: 'Trước 3 ngày trở lên — hoàn 90%',         canAct: true  }
  if (hoursLeft >= 24) return { refundRate: 0.75, feeRate: 0.25, label: 'Trước 1 đến dưới 3 ngày — hoàn 75%',      canAct: true  }
  if (hoursLeft >= 4)  return { refundRate: 0.5,  feeRate: 0.5,  label: 'Trước 4 giờ đến dưới 1 ngày — hoàn 50%', canAct: true  }
  return               { refundRate: 0,    feeRate: 1,    label: 'Dưới 4 giờ trước giờ khởi hành — không hoàn',    canAct: false }
}

export const isExchangeable = (departDateStr, departTimeStr) => {
  const [d, m, y] = departDateStr.split('/')
  const [h, min] = departTimeStr.split(':')
  const departAt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min))
  return (departAt - new Date()) / (1000 * 60 * 60) >= 24
}

export const calculateExchangeFee = (originalPrice) =>
  Math.max(Math.round(originalPrice * 0.05), 20000)
