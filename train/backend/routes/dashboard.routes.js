const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/revenue-by-month', dashboardController.getRevenueByMonth);
router.get('/revenue-by-week', dashboardController.getRevenueByWeek);
router.get('/popular-routes', dashboardController.getPopularRoutes);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/upcoming-trains', dashboardController.getUpcomingTrains);
router.get('/top-stations', dashboardController.getTopStations);
router.get('/customer-distribution', dashboardController.getCustomerDistribution);
router.get('/rates', dashboardController.getRates);

module.exports = router;