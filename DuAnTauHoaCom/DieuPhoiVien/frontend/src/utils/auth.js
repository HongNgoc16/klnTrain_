const KEY = 'KLN_DP_AUTH'

export const getAuth  = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
export const getToken = () => getAuth()?.token || null
export const saveAuth = (data) => localStorage.setItem(KEY, JSON.stringify(data))
export const clearAuth = () => localStorage.removeItem(KEY)
export const isLoggedIn = () => {
  const token = getToken()
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
    return payload.exp * 1000 > Date.now()
  } catch { return false }
}
export const getUser = () => getAuth()
