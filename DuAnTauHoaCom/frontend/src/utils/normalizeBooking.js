// Chuyển đổi response từ BookingService.formatDon → format BookingResult / CancelFlow
import { mapLoaiHKToType } from './passengerUtils'

const genTicketCode = (seed) => {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = (((h << 5) + h) ^ seed.charCodeAt(i)) >>> 0
  return String((h % 900000000) + 100000000)
}

// YYYY-MM-DD hoặc ISO datetime → DD/MM/YYYY
const toVNDate = (iso) => {
  if (!iso) return ''
  const s = String(iso)
  // Khớp YYYY-MM-DD ở đầu hoặc trong chuỗi ISO
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return s.slice(0, 10)
  return `${m[3]}/${m[2]}/${m[1]}`
}

// TIME từ Sequelize có thể là Date epoch "1970-01-01T08:00:00.000Z" hoặc string "08:00:00"
const toHHMM = (t) => {
  if (!t) return ''
  const s = String(t)
  // ISO datetime có T: lấy HH:MM từ phần sau T
  const iso = s.match(/T(\d{2}):(\d{2})/)
  if (iso) return `${iso[1]}:${iso[2]}`
  // Plain time "HH:MM..." hoặc "HH:MM:SS..."
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5)
  return ''
}

const statusPaymentMap = {
  cho_thanh_toan: 'cho_thanh_toan',
  da_thanh_toan:  'da_thanh_toan',
  da_huy:         'da_huy',
  het_han:        'het_han',
}
const statusBookingMap = {
  cho_thanh_toan: 'cho_xac_nhan',
  da_thanh_toan:  'da_xac_nhan',
  da_huy:         'da_huy',
  het_han:        'het_han',
}

// ─── Chuẩn hóa API don → format BookingResult ───────────────────
export const normalizeApiBooking = (don) => {
  if (!don) return null

  // Chỉ lấy vé còn hiệu lực — bỏ vé đã đổi (da_doi) và đã hủy (da_huy)
  const veList = [...(don.ve || [])]
    .filter(v => v.trangThai !== 'da_doi' && v.trangThai !== 'da_huy')
    .sort((a, b) => (a.idVe || 0) - (b.idVe || 0))

  // Gộp vé theo chuyến (gaDi|gaDen|ngayChay là key)
  const tripMap = new Map()
  veList.forEach(v => {
    const key = v.chuyen
      ? `${v.chuyen.gaDi}|${v.chuyen.gaDen}|${v.chuyen.ngayChay}`
      : `unknown|${v.soToa}`
    if (!tripMap.has(key)) tripMap.set(key, [])
    tripMap.get(key).push(v)
  })
  const tripGroups = Array.from(tripMap.values())

  const numPassengers = tripGroups[0]?.length || 0

  // Xây dựng danh sách hành khách từ nhóm chuyến đầu tiên
  const passengers = (tripGroups[0] || []).map((v, idx) => {
    const priceByTrip = tripGroups.map(tg => tg[idx]?.giaVe || 0)
    const pType = mapLoaiHKToType(v.loaiHanhKhach)
    return {
      fullName:  v.hanhKhach?.hoTen    || '--',
      idCard:    v.hanhKhach?.cccd     || '',
      birthDate: toVNDate(v.hanhKhach?.ngaySinh),
      type:      pType,
      isChild:   pType === 'child',
      isElderly: pType === 'elderly',
      price:     priceByTrip.reduce((s, p) => s + p, 0),
      priceByTrip,
    }
  })

  const journeys = tripGroups.map((tg, jIdx) => ({
    fromStation: tg[0]?.chuyen?.gaDi       || '',
    toStation:   tg[0]?.chuyen?.gaDen      || '',
    departDate:  toVNDate(tg[0]?.chuyen?.ngayChay),
    departTime:  toHHMM(tg[0]?.chuyen?.gioKhoiHanh),
    arriveTime:  toHHMM(tg[0]?.chuyen?.gioDen),
    trainCode:   tg[0]?.chuyen?.maTau      || '',
    coachNumber: String(tg[0]?.soToa       || ''),
    coachName:   '',
    coachType:   '',
    seats:       tg.map(v => String(v.soGhe || '--')),
    idChuyen:    tg[0]?.idChuyen           || null,
    priceByPassenger: tg.map(v => parseFloat(v.giaVe) || 0),
  }))

  const totalSeatPrice = passengers.reduce((s, p) => s + (p.price || 0), 0)
  const serviceFee     = Math.max(0, (don.tienThanhToan || 0) - totalSeatPrice)

  return {
    source:        'api',
    bookingCode:   don.maDatCho     || '',
    orderCode:     don.maDon        || '',
    idDon:         don.idDon,
    status:        don.trangThai,
    paymentStatus: statusPaymentMap[don.trangThai] || don.trangThai,
    bookingStatus: statusBookingMap[don.trangThai] || don.trangThai,
    bookingDate:   don.thoiGianDat
      ? new Date(don.thoiGianDat).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      : '--',
    expiresAt: don.thoiGianHetHan
      ? new Date(don.thoiGianHetHan).getTime()
      : null,
    customer: {
      fullName: don.hoTenLienLac || passengers[0]?.fullName || '',
      email:    don.emailDatCho  || '',
      phone:    don.sdtDatCho    || '',
    },
    passengers,
    journeys,
    totalPrice:  don.tienThanhToan || 0,
    serviceFee,
    contactInfo: {
      phone: don.sdtDatCho   || '',
      email: don.emailDatCho || '',
    },
    veList: veList.map(v => ({
      idVe:          v.idVe,
      idChuyen:      v.idChuyen,
      soToa:         Number(v.soToa),
      soGhe:         Number(v.soGhe),
      giaVe:         parseFloat(v.giaVe) || 0,
      loaiHanhKhach: v.loaiHanhKhach,
      trangThai:     v.trangThai,
      fullName:      v.hanhKhach?.hoTen    || '--',
      cccd:          v.hanhKhach?.cccd     || '',
      ngaySinh:      toVNDate(v.hanhKhach?.ngaySinh),
      gaDi:          v.chuyen?.gaDi        || '',
      gaDen:         v.chuyen?.gaDen       || '',
      departDate:    toVNDate(v.chuyen?.ngayChay),
      departTime:    toHHMM(v.chuyen?.gioKhoiHanh),
      arriveTime:    toHHMM(v.chuyen?.gioDen),
      maTau:         v.chuyen?.maTau       || '',
    })),
  }
}

// ─── Chuẩn hóa API don → format CancelFlow ──────────────────────
// passenger.id = idVe (để gọi cancel API)
export const normalizeApiForCancel = (don) => {
  if (!don) return null

  // Chỉ lấy vé có thể hủy — bỏ vé đã đổi (da_doi) và đã hủy (da_huy)
  const veList = [...(don.ve || [])]
    .filter(v => v.trangThai !== 'da_doi' && v.trangThai !== 'da_huy')
    .sort((a, b) => (a.idVe || 0) - (b.idVe || 0))

  // Gộp theo chuyến
  const tripMap = new Map()
  veList.forEach(v => {
    const key = v.chuyen
      ? `${v.chuyen.gaDi}|${v.chuyen.gaDen}|${v.chuyen.ngayChay}`
      : `unknown|${v.soToa}`
    if (!tripMap.has(key)) tripMap.set(key, [])
    tripMap.get(key).push(v)
  })

  const tripGroups = Array.from(tripMap.values())
  const tt = (don.thanhToan || []).find(t => t.trangThai === 'thanh_cong') || don.thanhToan?.[0]

  return {
    bookingCode:   don.maDatCho || '',
    orderCode:     don.maDon    || '',
    idDon:         don.idDon,
    bookingDate:   don.thoiGianDat
      ? new Date(don.thoiGianDat).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      : '--',
    paymentMethod: tt?.phuongThuc || 'Chuyển khoản QR',
    contactPhone:  don.sdtDatCho   || '--',
    contactEmail:  don.emailDatCho || '--',
    status:        don.trangThai,
    trips: tripGroups.map((tg, tIdx) => {
      const maTau    = tg[0]?.chuyen?.maTau       || ''
      const depDate  = toVNDate(tg[0]?.chuyen?.ngayChay)
      const depTime  = toHHMM(tg[0]?.chuyen?.gioKhoiHanh)
      return {
        tripId:      tIdx + 1,
        trainCode:   maTau,
        trainType:   '',
        trainName:   maTau,
        fromStation: tg[0]?.chuyen?.gaDi  || '',
        toStation:   tg[0]?.chuyen?.gaDen || '',
        departDate:  depDate,
        departTime:  depTime,
        arriveDate:  toVNDate(tg[0]?.chuyen?.ngayChay),
        arriveTime:  toHHMM(tg[0]?.chuyen?.gioDen),
        duration:    '',
        coachNumber: String(tg[0]?.soToa  || ''),
        coachName:   '',
        coachType:   '',
        passengers: tg.map(v => ({
          id:        v.idVe,         // idVe — dùng cho cancel API
          fullName:  v.hanhKhach?.hoTen || '--',
          idCard:    v.hanhKhach?.cccd  || '',
          birthDate: toVNDate(v.hanhKhach?.ngaySinh),
          type:      mapLoaiHKToType(v.loaiHanhKhach),
          seat:      String(v.soGhe || '--'),
          price:     v.giaVe || 0,
        })),
      }
    }),
  }
}
