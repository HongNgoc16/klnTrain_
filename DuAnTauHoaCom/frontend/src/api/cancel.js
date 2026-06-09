import { get, post } from './client'

export const getCancelFee  = (idVe)                              => get(`/cancel/fee/${idVe}`)
export const cancelTickets = (maDatCho, idVeList, lyDo = '')    => post('/cancel', { maDatCho, idVeList, lyDo })
