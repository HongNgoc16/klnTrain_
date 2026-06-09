import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getToken, isTokenExpired, tryRefreshToken, logoutUser } from './utils/authUtils'

// Khi app khởi động: kiểm tra token và tự động refresh nếu sắp hết hạn
const initAuth = async () => {
  const token = getToken()
  if (!token) return  // chưa đăng nhập → không làm gì

  if (isTokenExpired()) {
    // Token đã hết hạn hoàn toàn → xóa session
    logoutUser()
    // Nếu đang ở trang cần auth → redirect
    const path = window.location.pathname
    const publicPaths = ['/dang-nhap', '/dang-ky', '/', '/tim-ve', '/thong-tin-dat-cho',
                         '/chuyen-tau-gia-ve', '/tra-ve', '/doi-ve']
    if (!publicPaths.some(p => path === p || path.startsWith('/thanh-toan'))) {
      window.location.href = '/dang-nhap?expired=1'
      return
    }
  } else {
    // Token vẫn hợp lệ → thử refresh trong nền để gia hạn thêm
    // (chạy bất đồng bộ, không block render)
    tryRefreshToken().catch(() => {})
  }
}

initAuth().finally(() => {
  createRoot(document.getElementById('root')).render(<App />)
})
