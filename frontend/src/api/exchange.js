import { get, post } from './client'

export const checkExchangeable = (idVe)              => get(`/exchange/check/${idVe}`)
export const exchangeTicket    = (idVeCu, newData)   => post('/exchange', { idVeCu, newTicketData: newData })
