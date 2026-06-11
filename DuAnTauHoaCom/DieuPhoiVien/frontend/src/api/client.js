import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE, timeout: 30000, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use(cfg => {
  try {
    const a = JSON.parse(localStorage.getItem('KLN_DP_AUTH') || 'null')
    if (a?.token) cfg.headers.Authorization = 'Bearer ' + a.token
  } catch {}
  return cfg
})

api.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('KLN_DP_AUTH')
      if (window.location.pathname !== '/dispatcher/dang-nhap') window.location.href = '/dispatcher/dang-nhap'
    }
    throw new Error(err.response?.data?.message || err.message || 'Lỗi không xác định')
  }
)

export default api
