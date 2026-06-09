import { get, put } from './client'

export const getMyNotifications = () => get('/notifications')

export const markNotificationRead = (id) => put(`/notifications/${id}/read`)

export const markAllNotificationsRead = () => put('/notifications/read-all')
