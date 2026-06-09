import { post, put, get } from './client'

export const createPayment  = (idDonDatVe, phuongThuc = 'qr_bank') =>
  post('/payments', { idDonDatVe, phuongThuc })

export const confirmPayment = (idThanhToan) =>
  put(`/payments/${idThanhToan}/confirm`)

export const getPaymentStatus = (idThanhToan) => get(`/payments/${idThanhToan}`)
