const KLN_AUTH_KEY = 'KLN_AUTH'

// ─── Lấy dữ liệu từ localStorage ──────────────────────────────────
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(KLN_AUTH_KEY)) } catch { return null }
}

export const getToken = () => getUser()?.token || null

// ─── Giải mã JWT payload (không cần secret) ───────────────────────
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

// ─── Kiểm tra token có hết hạn chưa ──────────────────────────────
export const isTokenExpired = () => {
  const token = getToken()
  if (!token) return true
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  // exp là giây Unix, so sánh với Date.now() (milliseconds)
  return payload.exp * 1000 < Date.now()
}

// ─── Kiểm tra đăng nhập hợp lệ (có token VÀ chưa hết hạn) ────────
export const isLoggedIn = () => {
  const token = getToken()
  if (!token) return false
  return !isTokenExpired()
}

// ─── Lưu sau khi đăng nhập/đăng ký từ backend ─────────────────────
export const loginUser = ({ token, user }) => {
  const auth = { token, ...user }
  localStorage.setItem(KLN_AUTH_KEY, JSON.stringify(auth))
  return auth
}

// ─── Đăng xuất: xóa session ───────────────────────────────────────
export const logoutUser = () => localStorage.removeItem(KLN_AUTH_KEY)

// ─── Refresh token: gọi /api/auth/refresh để lấy token mới ────────
// Trả về true nếu refresh thành công, false nếu thất bại
export const tryRefreshToken = async () => {
  const token = getToken()
  if (!token) return false
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data?.data?.token) {
      const current = getUser()
      localStorage.setItem(KLN_AUTH_KEY, JSON.stringify({ ...current, token: data.data.token }))
      return true
    }
    return false
  } catch {
    return false
  }
}
