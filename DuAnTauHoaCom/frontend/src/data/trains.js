// src/data/trains.js

const r = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

export const COACH_TYPE = {
  NMCLC: 'NMCLC',
  GN6AC: 'GN6AC',
  GN4AC: 'GN4AC'
}

const COACH_NAMES = {
  NMCLC: 'Ngồi mềm chất lượng cao',
  GN6AC: 'Giường nằm khoang 6 điều hòa',
  GN4AC: 'Giường nằm khoang 4 điều hòa'
}

// ── Ngồi mềm chất lượng cao: 56 ghế, 14 hàng × 4 (2+2) ──
const createNMCLCSeats = (sold = [], held = [], price = 1107) =>
  Array.from({ length: 56 }, (_, i) => ({
    number: i + 1,
    price,
    status: sold.includes(i + 1) ? 'sold' : held.includes(i + 1) ? 'held' : 'empty'
  }))

// ── Giường nằm khoang 6: 60 giường, 10 khoang × 6 ──
// pos: 0=dưới-trái, 1=dưới-phải, 2=giữa-trái, 3=giữa-phải, 4=trên-trái, 5=trên-phải
const createGN6ACSeats = (sold = [], held = []) =>
  Array.from({ length: 60 }, (_, i) => {
    const n = i + 1
    const pos = i % 6
    const prices = [1670, 1670, 1490, 1490, 1350, 1350]
    return {
      number: n,
      price: prices[pos],
      status: sold.includes(n) ? 'sold' : held.includes(n) ? 'held' : 'empty',
      compartment: Math.floor(i / 6) + 1,
      pos
    }
  })

// ── Giường nằm khoang 4: 40 giường, 10 khoang × 4 ──
// pos: 0=dưới-trái, 1=dưới-phải, 2=trên-trái, 3=trên-phải
const createGN4ACSeats = (sold = [], held = []) =>
  Array.from({ length: 40 }, (_, i) => {
    const n = i + 1
    const pos = i % 4
    const prices = [1870, 1870, 1700, 1700]
    return {
      number: n,
      price: prices[pos],
      status: sold.includes(n) ? 'sold' : held.includes(n) ? 'held' : 'empty',
      compartment: Math.floor(i / 4) + 1,
      pos
    }
  })

const countEmpty = (seats) => seats.filter(s => s.status === 'empty').length

// Tạo toa tàu với ghế nhúng sẵn
const mc = (id, type, sold = [], held = [], priceK = null) => {
  const seats = type === 'GN6AC' ? createGN6ACSeats(sold, held)
              : type === 'GN4AC' ? createGN4ACSeats(sold, held)
              : createNMCLCSeats(sold, held, priceK || 1107)

  const priceRanges = {
    NMCLC: priceK ? `${priceK}K` : '1.107K',
    GN6AC: '1.350K - 1.670K',
    GN4AC: '1.700K - 1.870K'
  }

  return {
    id,
    type,
    name: `Toa ${id}: ${COACH_NAMES[type]}`,
    seats,
    availableSeats: countEmpty(seats),
    priceRange: priceRanges[type]
  }
}

// Tạo tàu với tổng availableSeats tự tính
const mt = (base) => ({
  ...base,
  availableSeats: base.coaches.reduce((s, c) => s + c.availableSeats, 0)
})

// ========== TUYẾN HÀ NỘI - SÀI GÒN ==========
const trainsDeparture = [
  mt({
    id: 'se1', code: 'SE1', type: 'Tàu Tốc Hành',
    fromStation: 'Hà Nội', toStation: 'Sài Gòn',
    departTime: '06:00', arriveTime: '05:45',
    departDate: '07/05/2026', arriveDate: '09/05/2026',
    duration: '23h45p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 28), r(29, 31)),                      // avail=25
      mc(2, 'NMCLC', [1,2,5,7,10,15,18,25], [8,23,28,32]),      // avail=44
      mc(3, 'GN6AC', r(1, 46), [47, 48]),                        // avail=12
      mc(4, 'GN4AC', r(1, 31), [32]),                            // avail=8
    ]
  }),
  mt({
    id: 'se3', code: 'SE3', type: 'Tàu Tốc Hành',
    fromStation: 'Hà Nội', toStation: 'Sài Gòn',
    departTime: '14:30', arriveTime: '14:15',
    departDate: '07/05/2026', arriveDate: '09/05/2026',
    duration: '23h45p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 31), r(32, 35)),   // avail=21
      mc(2, 'NMCLC', r(1, 12), r(13, 16)),   // avail=40
      mc(3, 'GN6AC', r(1, 48), [49, 50]),     // avail=10
    ]
  }),
  mt({
    id: 'se5', code: 'SE5', type: 'Tàu Tốc Hành',
    fromStation: 'Hà Nội', toStation: 'Sài Gòn',
    departTime: '20:20', arriveTime: '07:45',
    departDate: '07/05/2026', arriveDate: '09/05/2026',
    duration: '35h25p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 8),  r(9, 12)),    // avail=44
      mc(2, 'NMCLC', r(1, 4),  r(5, 8)),     // avail=48
      mc(3, 'GN6AC', r(1, 32), r(33, 36)),   // avail=24
      mc(4, 'GN4AC', r(1, 18), r(19, 22)),   // avail=18
    ]
  }),
  mt({
    id: 'se7', code: 'SE7', type: 'Tàu Tốc Hành',
    fromStation: 'Hà Nội', toStation: 'Sài Gòn',
    departTime: '17:35', arriveTime: '05:10',
    departDate: '07/05/2026', arriveDate: '09/05/2026',
    duration: '35h35p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 24), r(25, 28)),   // avail=28
      mc(2, 'NMCLC', r(1, 8),  r(9, 12)),    // avail=44
      mc(3, 'GN6AC', r(1, 42), r(43, 44)),   // avail=16
      mc(4, 'GN4AC', r(1, 28), r(29, 32)),   // avail=8
    ]
  }),
]

// ========== TUYẾN SÀI GÒN - HÀ NỘI ==========
const trainsReturn = [
  mt({
    id: 'se2', code: 'SE2', type: 'Tàu Tốc Hành',
    fromStation: 'Sài Gòn', toStation: 'Hà Nội',
    departTime: '09:00', arriveTime: '08:45',
    departDate: '14/05/2026', arriveDate: '16/05/2026',
    duration: '23h45p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 20), r(21, 24)),   // avail=32
      mc(2, 'NMCLC', r(1, 8),  r(9, 12)),    // avail=44
      mc(3, 'GN6AC', r(1, 42), [43, 44]),     // avail=16
    ]
  }),
  mt({
    id: 'se4', code: 'SE4', type: 'Tàu Tốc Hành',
    fromStation: 'Sài Gòn', toStation: 'Hà Nội',
    departTime: '18:30', arriveTime: '18:15',
    departDate: '14/05/2026', arriveDate: '16/05/2026',
    duration: '23h45p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 36), r(37, 40)),   // avail=16
      mc(2, 'NMCLC', r(1, 24), r(25, 28)),   // avail=28
      mc(3, 'GN6AC', r(1, 46), r(47, 48)),   // avail=12
      mc(4, 'GN4AC', r(1, 28), r(29, 32)),   // avail=8
    ]
  }),
  mt({
    id: 'se6', code: 'SE6', type: 'Tàu Tốc Hành',
    fromStation: 'Sài Gòn', toStation: 'Hà Nội',
    departTime: '22:00', arriveTime: '09:25',
    departDate: '14/05/2026', arriveDate: '16/05/2026',
    duration: '35h25p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 12), r(13, 16)),   // avail=40
      mc(2, 'NMCLC', r(1, 8),  r(9, 12)),    // avail=44
      mc(3, 'GN6AC', r(1, 38), r(39, 42)),   // avail=18
    ]
  }),
  mt({
    id: 'se8', code: 'SE8', type: 'Tàu Tốc Hành',
    fromStation: 'Sài Gòn', toStation: 'Hà Nội',
    departTime: '19:20', arriveTime: '06:55',
    departDate: '14/05/2026', arriveDate: '16/05/2026',
    duration: '35h35p', priceFrom: 1107000,
    coaches: [
      mc(1, 'NMCLC', r(1, 20), r(21, 24)),   // avail=32
      mc(2, 'NMCLC', r(1, 8),  r(9, 12)),    // avail=44
      mc(3, 'GN6AC', r(1, 40), r(41, 44)),   // avail=16
      mc(4, 'GN4AC', r(1, 24), r(25, 28)),   // avail=12
    ]
  }),
]

// ========== CÁC TUYẾN KHÁC ==========
const otherTrains = [
  mt({
    id: 'hp1', code: 'HP1', type: 'Tàu Liên Tỉnh',
    fromStation: 'Hà Nội', toStation: 'Hải Phòng',
    departTime: '08:00', arriveTime: '10:25',
    departDate: '07/05/2026', arriveDate: '07/05/2026',
    duration: '2h25p', priceFrom: 119000,
    coaches: [
      mc(1, 'NMCLC', r(1, 8), r(9, 12), 119),  // avail=44
    ]
  }),
  mt({
    id: 'hp2', code: 'HP2', type: 'Tàu Liên Tỉnh',
    fromStation: 'Hải Phòng', toStation: 'Hà Nội',
    departTime: '11:00', arriveTime: '13:25',
    departDate: '14/05/2026', arriveDate: '14/05/2026',
    duration: '2h25p', priceFrom: 119000,
    coaches: [
      mc(1, 'NMCLC', r(1, 12), r(13, 16), 119), // avail=40
    ]
  }),
  mt({
    id: 'hd2', code: 'HD2', type: 'Tàu Liên Tỉnh',
    fromStation: 'Đà Nẵng', toStation: 'Huế',
    departTime: '09:00', arriveTime: '12:20',
    departDate: '07/05/2026', arriveDate: '07/05/2026',
    duration: '3h20p', priceFrom: 85000,
    coaches: [
      mc(1, 'NMCLC', r(1, 16), r(17, 20), 85),  // avail=36
    ]
  }),
  mt({
    id: 'hd3', code: 'HD3', type: 'Tàu Liên Tỉnh',
    fromStation: 'Huế', toStation: 'Đà Nẵng',
    departTime: '13:30', arriveTime: '16:50',
    departDate: '14/05/2026', arriveDate: '14/05/2026',
    duration: '3h20p', priceFrom: 85000,
    coaches: [
      mc(1, 'NMCLC', r(1, 20), r(21, 24), 85),  // avail=32
    ]
  }),
]

export const trains = [...trainsDeparture, ...trainsReturn, ...otherTrains]

export const searchTrains = (fromStation, toStation) =>
  trains.filter(t => t.fromStation === fromStation && t.toStation === toStation)

export const getCoachWithSeats = (trainId, coachId) => {
  const train = trains.find(t => t.id === trainId)
  return train?.coaches.find(c => c.id === coachId) || null
}

export const getAvailableRoutes = () => {
  const seen = new Set()
  return trains.reduce((acc, t) => {
    const key = `${t.fromStation}-${t.toStation}`
    if (!seen.has(key)) {
      seen.add(key)
      acc.push({ from: t.fromStation, to: t.toStation, price: t.priceFrom, duration: t.duration })
    }
    return acc
  }, [])
}
