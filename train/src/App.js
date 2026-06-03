import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import AdminLayout from './components/Layout/AdminLayout';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import TicketsManagement from './pages/TicketsManagement/TicketsManagement';
import TrainsManagement from './pages/TrainsManagement/TrainsManagement';
import StationsManagement from './pages/StationsManagement/StationsManagement';
import SchedulesManagement from './pages/SchedulesManagement/SchedulesManagement';
import CustomersManagement from './pages/CustomersManagement/CustomersManagement';
import PaymentsManagement from './pages/PaymentsManagement/PaymentsManagement';
import SeatTypesManagement from './pages/SeatTypesManagement/SeatTypesManagement';
import Reports from './pages/Reports/Reports';
import Policies from './pages/Policies/Policies';
import Refunds from './pages/Refunds/Refunds';
import Coupons from './pages/Coupons/Coupons';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<TicketsManagement />} />
            <Route path="trains" element={<TrainsManagement />} />
            <Route path="stations" element={<StationsManagement />} />
            <Route path="seat-types" element={<SeatTypesManagement />} />
            <Route path="schedules" element={<SchedulesManagement />} />
            <Route path="customers" element={<CustomersManagement />} />
            <Route path="payments" element={<PaymentsManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="policies" element={<Policies />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;