// src/data/stations.js
export const stations = [
  { code: 'HNO', name: 'Hà Nội' },
  { code: 'SGO', name: 'Sài Gòn' },
  { code: 'HPH', name: 'Hải Phòng' },
  { code: 'DNA', name: 'Đà Nẵng' },
  { code: 'HUE', name: 'Huế' },
  { code: 'DLT', name: 'Đà Lạt' },
  { code: 'TMT', name: 'Trại Mát' },
  { code: 'VIN', name: 'Vinh' },
  { code: 'PHT', name: 'Phan Thiết' },
  { code: 'NTR', name: 'Nha Trang' }
]

export const getStationName = (code) => {
  const station = stations.find(s => s.code === code)
  return station ? station.name : code
}

export const getStationCode = (name) => {
  const station = stations.find(s => s.name === name)
  return station ? station.code : name
}