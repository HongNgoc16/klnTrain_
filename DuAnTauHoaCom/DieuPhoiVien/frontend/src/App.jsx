import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './utils/auth'
import Login          from './pages/Login'
import Layout         from './components/Layout'
import Dashboard      from './pages/Dashboard'
import QuanLyChuyen   from './pages/QuanLyChuyen'
import ChiTietChuyen  from './pages/ChiTietChuyen'
import QuanLyLich     from './pages/QuanLyLich'

const Guard = ({ children }) => isLoggedIn() ? children : <Navigate to="/dang-nhap" replace />

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index            element={<Dashboard />} />
          <Route path="chuyen-tau"    element={<QuanLyChuyen />} />
          <Route path="chuyen-tau/:id" element={<ChiTietChuyen />} />
          <Route path="lich-chay"     element={<QuanLyLich />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
