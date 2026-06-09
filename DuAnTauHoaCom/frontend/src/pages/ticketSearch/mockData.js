// pages/ticketSearch/mockData.js
const createSeats = (sold = [], held = []) =>
  Array.from({ length: 56 }, (_, i) => ({
    number: i + 1,
    price: (i + 1) % 7 === 0 ? 1127 : 1107,
    status: sold.includes(i + 1) ? 'sold' : held.includes(i + 1) ? 'held' : 'empty'
  }))

export const trainsFromBackend = [
  {
    id: 'se7', type: 'Tàu Tốc Hành', code: 'SE7',
    fromStation: 'Ga Hà Nội', toStation: 'Ga Sài Gòn',
    departTime: '17:35', arriveTime: '05:10 + 2',
    departDate: '07/05/2026', arriveDate: '09/05/2026',
    duration: '35h35p', availableSeats: 135, priceFrom: 1107000,
    coaches: [
      { id: 4, name: 'Toa 4: Giường nằm khoang 6', availableSeats: 8, priceRange: '1311K - 1670K', seats: createSeats([1,2,6,7,8,11,12,17,18,24,30,36,40,41,48,49], [16,23,31]) },
      { id: 3, name: 'Toa 3: Giường nằm khoang 6', availableSeats: 12, priceRange: '1311K - 1670K', seats: createSeats([1,2,3,4,9,10,14,15,19,20,25,29,30,33,34,38], [22,27]) },
      { id: 2, name: 'Toa 2: Ngồi mềm chất lượng cao', availableSeats: 44, priceRange: '1107K - 1127K', seats: createSeats([1,2,6,7,10,15,18,25,30,37,42,43,50], [8,23,28,32]) },
      { id: 1, name: 'Toa 1: Ngồi mềm chất lượng cao', availableSeats: 25, priceRange: '1107K - 1127K', seats: createSeats([1,2,7,8,10,15,17,18,25,31,40,44,45,52], [24,32,56]) }
    ]
  },
  {
    id: 'se5', type: 'Tàu Tốc Hành', code: 'SE5',
    fromStation: 'Ga Hà Nội', toStation: 'Ga Sài Gòn',
    departTime: '20:20', arriveTime: '07:45 + 2',
    departDate: '07/05/2026', arriveDate: '09/05/2026',
    duration: '35h25p', availableSeats: 206, priceFrom: 1107000,
    coaches: [
      { id: 4, name: 'Toa 4: Giường nằm khoang 6', availableSeats: 18, priceRange: '1311K - 1670K', seats: createSeats([1,2,5,6,11,12,19,24,25,30,36], [23,24]) },
      { id: 3, name: 'Toa 3: Giường nằm khoang 6', availableSeats: 22, priceRange: '1311K - 1670K', seats: createSeats([8,9,16,17,24,25,32,33,40], [22,27]) },
      { id: 2, name: 'Toa 2: Ngồi mềm chất lượng cao', availableSeats: 48, priceRange: '1107K - 1127K', seats: createSeats([1,2,7,8,10,15,18,25,31,40,47,48], [23,28,32,56]) },
      { id: 1, name: 'Toa 1: Ngồi mềm chất lượng cao', availableSeats: 40, priceRange: '1107K - 1127K', seats: createSeats([1,2,6,7,8,9,10,15,17,18,25,30,36,37,43,44,51], [23,24,31,32]) }
    ]
  }
]