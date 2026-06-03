const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// Dashboard
router.get('/dashboard', reportController.getDashboardStats);

// Báo cáo doanh thu
router.get('/revenue', reportController.getRevenueReport);
router.get('/revenue/by-route', reportController.getRevenueByRoute);
//router.get('/revenue/by-train', reportController.getRevenueByTrain);

// Báo cáo hoạt động
router.get('/occupancy', reportController.getOccupancyReport);
router.get('/cancellations', reportController.getCancellationReport);
router.get('/coupon-effectiveness', reportController.getCouponEffectiveness);
router.get('/dashboard-stats', reportController.getDashboardStats);


// Export
//router.post('/export/excel', reportController.exportToExcel);
//router.post('/export/pdf', reportController.exportToPDF);

module.exports = router;