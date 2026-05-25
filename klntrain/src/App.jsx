import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import Navbar from "./component/Navbar/Navbar"
import Home from "./pages/home/Home"
import TicketSearch from "./pages/ticketSearch/TicketSearch"
import CancelTicket from "./pages/cancelTicket/CancelTicket"
import ExchangeTicket from "./pages/exchangeTicket/ExchangeTicket"
import BookingLookup from "./pages/bookingLookup/BookingLookup"
import Checkout from "./pages/checkout/Checkout"
import PaymentMethod from './pages/payment/PaymentMethod'
import QRPayment from './pages/payment/QRPayment'
import PaymentSuccess from './pages/payment/PaymentSuccess'
import TrainSchedule from "./pages/trainSchedule/TrainSchedule"
import PrintTicket from "./pages/printTicket/PrintTicket"

const MainLayout = () => (
  <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
    <Navbar />
    <Outlet />
    Footer
  </main>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang in vé — không có Navbar */}
        <Route path="/in-ve" element={<PrintTicket />} />

        {/* Các trang chính — có Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tim-ve" element={<TicketSearch />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thanh-toan" element={<PaymentMethod />} />
          <Route path="/thanh-toan/qr" element={<QRPayment />} />
          <Route path="/thanh-toan/thanh-cong" element={<PaymentSuccess />} />
          <Route path="/thong-tin-dat-cho" element={<BookingLookup />} />
          <Route path="/chuyen-tau-gia-ve" element={<TrainSchedule />} />
          <Route path="/tra-ve" element={<CancelTicket />} />
          <Route path="/doi-ve" element={<ExchangeTicket />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
