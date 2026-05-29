import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Interceptor: Thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Xử lý lỗi 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenueByMonth: () => api.get('/dashboard/revenue-by-month'),
  getRevenueByWeek: () => api.get('/dashboard/revenue-by-week'),
  getPopularRoutes: () => api.get('/dashboard/popular-routes'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getUpcomingTrains: () => api.get('/dashboard/upcoming-trains'),
  getTopStations: () => api.get('/dashboard/top-stations'),
  getCustomerDistribution: () => api.get('/dashboard/customer-distribution')
};

// ==================== TICKET API ====================
export const ticketAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  cancel: (id, data) => api.put(`/tickets/${id}/cancel`, data),
  autoUpdateStatus: (id) => api.put(`/tickets/${id}/auto-update`),
  getStats: () => api.get('/tickets/stats')
};

// ==================== AUTH API ====================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout')
};

// ==================== TRAIN API ====================
export const trainAPI = {
  getAll: () => api.get('/trains'),
  getById: (id) => api.get(`/trains/${id}`),
  create: (data) => api.post('/trains', data),
  update: (id, data) => api.put(`/trains/${id}`, data),
  delete: (id) => api.delete(`/trains/${id}`),
  getDetail: (id) => api.get(`/trains/${id}/detail`),
  addCarriage: (id, data) => api.post(`/trains/${id}/carriages`, data),
  removeCarriage: (trainId, carriageId) => api.delete(`/trains/${trainId}/carriages/${carriageId}`)
};

// ==================== STATION API ====================
export const stationAPI = {
  getAll: () => api.get('/stations'),
  getById: (id) => api.get(`/stations/${id}`),
  create: (data) => api.post('/stations', data),
  update: (id, data) => api.put(`/stations/${id}`, data),
  delete: (id) => api.delete(`/stations/${id}`)
};

// ==================== SCHEDULE API ====================
export const scheduleAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getStations: (id) => api.get(`/schedules/${id}/stations`),
  addStation: (id, data) => api.post(`/schedules/${id}/stations`, data),
  removeStation: (id, stationId) => api.delete(`/schedules/${id}/stations/${stationId}`),
  getTrips: (params) => api.get('/schedules/trips', { params }),
  generateTrips: (data) => api.post('/schedules/generate', data),
  updateTripStatus: (id, data) => api.put(`/schedules/trips/${id}/status`, data),
  getUpcomingTrips: () => api.get('/schedules/trips/upcoming')
};

// ==================== CUSTOMER API ====================
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  getTickets: (id) => api.get(`/customers/${id}/tickets`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// ==================== COUPON API ====================
export const couponAPI = {
  getAll: () => api.get('/coupons'),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  getStats: () => api.get('/coupons/stats')
};

// ==================== REFUND API ====================
export const refundAPI = {
  getAll: (params) => api.get('/refunds'),
  getStats: () => api.get('/refunds/stats'),
  getById: (id) => api.get(`/refunds/${id}`),
  confirm: (id) => api.put(`/refunds/${id}/confirm`),
  reject: (id) => api.put(`/refunds/${id}/reject`)
};

// ==================== REPORT API ====================
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getRevenueByRoute: (params) => api.get('/reports/revenue/by-route', { params }),
  getRevenueByTrain: (params) => api.get('/reports/revenue/by-train', { params }),
  getOccupancyReport: (params) => api.get('/reports/occupancy', { params }),
  getCancellationReport: (params) => api.get('/reports/cancellations', { params }),
  getCouponEffectiveness: () => api.get('/reports/coupon-effectiveness')
};

// ==================== PRICE POLICY API ====================
export const priceAPI = {
  getPricePolicies: () => api.get('/prices/policies'),
  createPricePolicy: (data) => api.post('/prices/policies', data),
  updatePricePolicy: (id, data) => api.put(`/prices/policies/${id}`, data),
  deletePricePolicy: (id) => api.delete(`/prices/policies/${id}`),
  getCustomerPolicies: () => api.get('/prices/customer-policies'),
  updateCustomerPolicy: (id, data) => api.put(`/prices/customer-policies/${id}`, data),
  getCancelPolicies: () => api.get('/prices/cancel-policies'),
  updateCancelPolicy: (id, data) => api.put(`/prices/cancel-policies/${id}`, data)
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  sendBroadcast: (data) => api.post('/notifications/broadcast', data),
  sendGroup: (data) => api.post('/notifications/group', data),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// ==================== USER API ====================
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  getAuditLogs: (params) => api.get('/users/audit-logs', { params })
};

// ==================== CARRIAGE TYPE API ====================
export const carriageTypeAPI = {
  getAll: () => api.get('/carriages/types'),
  getById: (id) => api.get(`/carriages/types/${id}`),
  create: (data) => api.post('/carriages/types', data),
  update: (id, data) => api.put(`/carriages/types/${id}`, data),
  delete: (id) => api.delete(`/carriages/types/${id}`)
};

// ==================== SEAT TYPE API ====================
export const seatTypeAPI = {
  getAll: () => api.get('/seats/types'),
  getById: (id) => api.get(`/seats/types/${id}`),
  create: (data) => api.post('/seats/types', data),
  update: (id, data) => api.put(`/seats/types/${id}`, data),
  delete: (id) => api.delete(`/seats/types/${id}`),
  getConfiguration: (carriageTypeId) => api.get(`/seats/carriage-types/${carriageTypeId}/configuration`),
  configure: (carriageTypeId, data) => api.post(`/seats/carriage-types/${carriageTypeId}/configure`, data)
};

// ==================== POLICY API ====================
export const policyAPI = {
  getCustomerDiscounts: () => api.get('/policies/customer-discounts'),
  updateCustomerDiscount: (id, data) => api.put(`/policies/customer-discounts/${id}`, data),
  getCancelFees: () => api.get('/policies/cancel-fees'),
  updateCancelFee: (id, data) => api.put(`/policies/cancel-fees/${id}`, data),
  getBasePrice: () => api.get('/policies/base-price'),
  updateBasePrice: (data) => api.put('/policies/base-price', data)
};

export default api;