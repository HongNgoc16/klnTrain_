import { post, get, put } from './client'

export const register  = (data) => post('/auth/register', data)
export const login     = (data) => post('/auth/login', data)
export const getProfile = ()    => get('/auth/profile')
export const updateProfile = (data) => put('/auth/profile', data)
export const changePassword = (data) => put('/auth/change-password', data)
