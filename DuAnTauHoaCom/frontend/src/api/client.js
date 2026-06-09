// HTTP client — axios với interceptors để debug rõ nguồn lỗi
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Log khi khởi động để kiểm tra URL ngay lập tức
if (import.meta.env.DEV) {
  console.log(`[API] Base URL: ${BASE_URL}`)
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor: đính kèm JWT + log request ─────────────
apiClient.interceptors.request.use(
  (config) => {
    try {
      const auth = JSON.parse(localStorage.getItem('KLN_AUTH') || 'null')
      if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
    } catch { /* bỏ qua lỗi parse localStorage */ }

    if (import.meta.env.DEV) {
      // Kiểm tra nếu config.data là object thì dùng trực tiếp, nếu là string thì parse
      const body = config.data
        ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data)
        : undefined
      console.log(
        `[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        body || ''
      )
    }
    return config
  },
  (error) => {
    console.error('[API] Lỗi khởi tạo request:', error)
    return Promise.reject(error)
  }
)

// ─── Response interceptor: log + chuẩn hóa lỗi ──────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API ✓] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      )
    }
    // Trả về body JSON trực tiếp (giống fetch-based client cũ)
    return response.data
  },
  (error) => {
    if (import.meta.env.DEV) {
      if (error.code === 'ERR_NETWORK') {
        console.error(
          `[API ✗] ERR_NETWORK — Không thể kết nối tới ${BASE_URL}\n` +
          `  Nguyên nhân thường gặp:\n` +
          `  1. Backend chưa chạy → chạy "npm run dev" trong folder /backend\n` +
          `  2. Sai port → backend/.env PORT=${error.config?.baseURL?.match(/:(\d+)/)?.[1] || '?'}, kiểm tra lại\n` +
          `  3. CORS bị chặn → kiểm tra FRONTEND_URL trong backend/.env`
        )
      } else if (error.code === 'ECONNABORTED') {
        console.error(`[API ✗] TIMEOUT (>20s): ${error.config?.method?.toUpperCase()} ${error.config?.url}`)
      } else if (error.response) {
        console.error(
          `[API ✗] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          error.response.data
        )
      } else {
        console.error('[API ✗] Lỗi không xác định:', error.message, error)
      }
    }

    // Network error (backend chưa chạy, CORS, timeout…)
    if (!error.response) {
      const normalized = new Error(
        error.code === 'ECONNABORTED'
          ? 'Yêu cầu quá lâu, vui lòng thử lại.'
          : 'Không thể kết nối máy chủ. Vui lòng kiểm tra backend đang chạy.'
      )
      normalized.status = 0
      normalized.code = error.code
      throw normalized
    }

    // Server trả về lỗi HTTP (4xx, 5xx)
    const { status, data } = error.response
    const normalized = new Error(data?.message || `Lỗi ${status}`)
    normalized.status = status
    normalized.errors = data?.errors

    // 401: Token hết hạn / không hợp lệ → tự động đăng xuất
    if (status === 401) {
      localStorage.removeItem('KLN_AUTH')
      // Chỉ redirect nếu không đang ở trang đăng nhập/đăng ký (tránh loop)
      const path = window.location.pathname
      if (path !== '/dang-nhap' && path !== '/dang-ky') {
        window.location.href = '/dang-nhap?expired=1'
      }
    }

    throw normalized
  }
)

export const get = (path) => apiClient.get(path)
export const post = (path, body) => apiClient.post(path, body)
export const put = (path, body) => apiClient.put(path, body)
export const del = (path) => apiClient.delete(path)
export const patch = (path, body) => apiClient.patch(path, body)
