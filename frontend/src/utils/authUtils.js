const KLN_AUTH_KEY = 'KLN_AUTH'

// Lấy thông tin user hiện tại (bao gồm token JWT)
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(KLN_AUTH_KEY)) } catch { return null }
}

export const getToken = () => getUser()?.token || null

// Lưu sau khi đăng nhập/đăng ký từ backend — nhận { token, user }
export const loginUser = ({ token, user }) => {
  const auth = { token, ...user }
  localStorage.setItem(KLN_AUTH_KEY, JSON.stringify(auth))
  return auth
}

export const logoutUser = () => localStorage.removeItem(KLN_AUTH_KEY)

export const isLoggedIn = () => !!getToken()
