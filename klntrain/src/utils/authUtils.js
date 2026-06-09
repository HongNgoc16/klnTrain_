const KLN_AUTH_KEY = 'KLN_AUTH'

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(KLN_AUTH_KEY)) } catch { return null }
}

export const loginUser = (email, name = '') => {
  const user = {
    email: email.trim().toLowerCase(),
    name: name.trim() || email.split('@')[0]
  }
  localStorage.setItem(KLN_AUTH_KEY, JSON.stringify(user))
  return user
}

export const logoutUser = () => localStorage.removeItem(KLN_AUTH_KEY)
