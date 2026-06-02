// pages/trainSchedule/data/mockData.js

// Danh sách các ga (từ ảnh)
export const stations = [
  'An Hòa', 'Ám Thượng', 'Bảo Sơn', 'Bắc Thủy', 'Bản Cờ', 'Bắc Giang', 'Bảo Hà',
  'Biên Hòa', 'Bắc Kinh Tây', 'Bắc Lệ', 'Bắc Ninh', 'Bồng Sơn', 'Bỉm Sơn', 'Bản Thí',
  'Bằng Tường', 'Chí Chủ', 'Cẩm Giàng', 'Cầu Giát', 'Cầu Hai', 'Chi Lăng', 'Chu Lễ',
  'Chí Linh', 'Cổ Loa', 'Cẩm Lý', 'Cà Ná', 'Cổ Phúc', 'Chợ Sy', 'Đông Anh',
  'Đa Phúc', 'Đà Lạt', 'Đồng Chuối', 'Đồng Đăng', 'Đồng Hà', 'Đồng Hới', 'Dĩ An',
  'Đại Lãnh', 'Đồng Lê', 'Đồng Mô', 'Đà Nẵng', 'Đồng Triều', 'Đức Phổ', 'Diên Sanh',
  'Đông Tác', 'Đoan Thượng', 'Diêu Trì', 'Đức Lạc', 'Giáp Bát', 'Gia Huynh', 'Sài Gòn',
  'Hà Nội', 'Hải Phòng', 'Hạ Long', 'Hương Canh', 'Hương Phố', 'Hương Sơn',
  'Hồng Lĩnh', 'Hồng Phúc', 'Hồng Vân', 'Hồng Ngự', 'Hồng Lý', 'Hồng Phong',
]

// Dữ liệu hành trình của các ga
export const trainRoutes = {
  'SE8': {
    code: 'SE8',
    name: 'Tàu SE8',
    fromStation: 'Sài Gòn',
    toStation: 'Hà Nội',
    departTime: '06:00',
    arriveTime: '16:10',
    departDate: '10/05/2026',
    arriveDate: '11/05/2026',
    duration: '1 ngày 10 giờ 10 phút',
    stations: [
      { stt: 1, name: 'Sài Gòn', distance: 0, date: '10/05/2026', arriveTime: '06:00', departTime: '06:00' },
      { stt: 2, name: 'Dĩ An', distance: 19, date: '10/05/2026', arriveTime: '06:28', departTime: '06:31' },
      { stt: 3, name: 'Biên Hòa', distance: 29, date: '10/05/2026', arriveTime: '06:44', departTime: '06:47' },
      { stt: 4, name: 'Long Khánh', distance: 77, date: '10/05/2026', arriveTime: '07:45', departTime: '07:48' },
      { stt: 5, name: 'Suối Kiết', distance: 123, date: '10/05/2026', arriveTime: '08:34', departTime: '08:37' },
      { stt: 6, name: 'Bình Thuận', distance: 175, date: '10/05/2026', arriveTime: '09:31', departTime: '09:36' },
      { stt: 7, name: 'Tháp Chàm', distance: 318, date: '10/05/2026', arriveTime: '11:49', departTime: '11:52' },
      { stt: 8, name: 'Nha Trang', distance: 411, date: '10/05/2026', arriveTime: '13:25', departTime: '13:45' },
      { stt: 9, name: 'Tuy Hoà', distance: 528, date: '10/05/2026', arriveTime: '15:51', departTime: '15:54' },
      { stt: 10, name: 'Diêu Trì', distance: 630, date: '10/05/2026', arriveTime: '17:37', departTime: '17:49' },
      { stt: 11, name: 'Quảng Ngãi', distance: 798, date: '10/05/2026', arriveTime: '20:33', departTime: '20:38' }
    ],
    prices: [
      { stt: 1, code: 'AnLT1M', name: 'Tầng 1, khoang có 4 giường', price: 2246000 },
      { stt: 2, code: 'AnLT1Mv', name: 'Tầng 1, khoang có 4 giường', price: 2281000 },
      { stt: 3, code: 'AnLT2M', name: 'Tầng 2, khoang có 4 giường', price: 2109000 },
      { stt: 4, code: 'AnLT2Mv', name: 'Tầng 2, khoang có 4 giường', price: 2144000 },
      { stt: 5, code: 'AnLv2M', name: 'Khoang có 2 giường VIP', price: 4490000 },
      { stt: 6, code: 'BnLT1', name: 'Tầng 1, khoang có 6 giường', price: 1925000 },
      { stt: 7, code: 'BnLT1M', name: 'Tầng 1, khoang có 6 giường', price: 2022000 },
      { stt: 8, code: 'BnLT2', name: 'Tầng 2, khoang có 6 giường', price: 1788000 },
      { stt: 9, code: 'BnLT2M', name: 'Tầng 2, khoang có 6 giường', price: 1878000 },
      { stt: 10, code: 'BnLT3', name: 'Tầng 3, khoang có 6 giường', price: 1525000 },
      { stt: 11, code: 'BnLT3M', name: 'Tầng 3, khoang có 6 giường', price: 1603000 }
    ]
  },
  'SE6': {
    code: 'SE6',
    name: 'Tàu SE6',
    fromStation: 'Sài Gòn',
    toStation: 'Hà Nội',
    departTime: '08:40',
    arriveTime: '19:12',
    departDate: '10/05/2026',
    arriveDate: '11/05/2026',
    duration: '1 ngày 10 giờ 32 phút',
    stations: [
      { stt: 1, name: 'Sài Gòn', distance: 0, date: '10/05/2026', arriveTime: '08:40', departTime: '08:40' },
      { stt: 2, name: 'Biên Hòa', distance: 29, date: '10/05/2026', arriveTime: '09:15', departTime: '09:18' },
      { stt: 3, name: 'Nha Trang', distance: 411, date: '10/05/2026', arriveTime: '15:30', departTime: '15:35' }
    ],
    prices: [
      { stt: 1, code: 'NMLT1', name: 'Ngồi mềm điều hòa', price: 1107000 },
      { stt: 2, code: 'NC6', name: 'Ngồi cứng', price: 850000 }
    ]
  },
  'SE10': {
    code: 'SE10',
    name: 'Tàu SE10',
    fromStation: 'Sài Gòn',
    toStation: 'Hà Nội',
    departTime: '13:20',
    arriveTime: '04:35',
    departDate: '10/05/2026',
    arriveDate: '12/05/2026',
    duration: '1 ngày 15 giờ 15 phút',
    stations: [],
    prices: []
  },
  'SE4': {
    code: 'SE4',
    name: 'Tàu SE4',
    fromStation: 'Sài Gòn',
    toStation: 'Hà Nội',
    departTime: '19:25',
    arriveTime: '04:55',
    departDate: '10/05/2026',
    arriveDate: '12/05/2026',
    duration: '1 ngày 9 giờ 30 phút',
    stations: [],
    prices: []
  },
  'SE2': {
    code: 'SE2',
    name: 'Tàu SE2',
    fromStation: 'Sài Gòn',
    toStation: 'Hà Nội',
    departTime: '20:35',
    arriveTime: '05:45',
    departDate: '10/05/2026',
    arriveDate: '12/05/2026',
    duration: '1 ngày 9 giờ 10 phút',
    stations: [],
    prices: []
  }
}

// Danh sách các chuyến tàu
export const trains = [
  { code: 'SE8', name: 'Tàu SE8', fromStation: 'Sài Gòn', toStation: 'Hà Nội', departTime: '06:00', arriveTime: '16:10', duration: '1 ngày 10 giờ 10 phút', departDate: '10/05/2026', arriveDate: '11/05/2026' },
  { code: 'SE6', name: 'Tàu SE6', fromStation: 'Sài Gòn', toStation: 'Hà Nội', departTime: '08:40', arriveTime: '19:12', duration: '1 ngày 10 giờ 32 phút', departDate: '10/05/2026', arriveDate: '11/05/2026' },
  { code: 'SE10', name: 'Tàu SE10', fromStation: 'Sài Gòn', toStation: 'Hà Nội', departTime: '13:20', arriveTime: '04:35', duration: '1 ngày 15 giờ 15 phút', departDate: '10/05/2026', arriveDate: '12/05/2026' },
  { code: 'SE4', name: 'Tàu SE4', fromStation: 'Sài Gòn', toStation: 'Hà Nội', departTime: '19:25', arriveTime: '04:55', duration: '1 ngày 9 giờ 30 phút', departDate: '10/05/2026', arriveDate: '12/05/2026' },
  { code: 'SE2', name: 'Tàu SE2', fromStation: 'Sài Gòn', toStation: 'Hà Nội', departTime: '20:35', arriveTime: '05:45', duration: '1 ngày 9 giờ 10 phút', departDate: '10/05/2026', arriveDate: '12/05/2026' }
]

// Tìm kiếm tàu theo ga đi, ga đến, ngày
export const searchTrainsByRoute = (fromStation, toStation, date) => {
  return trains.filter(train => 
    train.fromStation === fromStation && 
    train.toStation === toStation
  )
}

// Lấy chi tiết tàu theo mã
export const getTrainDetail = (trainCode) => {
  return trainRoutes[trainCode] || null
}