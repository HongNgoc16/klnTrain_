import { get } from './client'

export const searchTrains = (gaDi, gaDen, ngayChay) =>
  get(`/trains/search?gaDi=${encodeURIComponent(gaDi)}&gaDen=${encodeURIComponent(gaDen)}&ngayChay=${ngayChay}`)

export const getStations = () => get('/trains/stations')

export const getSchedule = () => get('/trains/schedule')

export const getTrainDetail = (idLichChay, idGaLen, idGaXuong, ngayChay) =>
  get(`/trains/detail/${idLichChay}?idGaLen=${idGaLen}&idGaXuong=${idGaXuong}&ngayChay=${ngayChay}`)

export const getSeatMap = (idChuyen, soToa, idGaLen, idGaXuong) =>
  get(`/trains/${idChuyen}/seats/${soToa}?idGaLen=${idGaLen}&idGaXuong=${idGaXuong}`)

export const getPopularRoutes = (limit = 10) =>
  get(`/trains/popular-routes?limit=${limit}`)
