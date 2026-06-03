const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/scheduleController');

router.use(authenticate);
router.use(authorize('quan_tri', 'nhan_vien'));

// Lịch chạy mẫu
router.get('/', scheduleController.getAllSchedules);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

// Quản lý ga dừng
router.get('/:id/stations', scheduleController.getStopStations);
router.post('/:id/stations', scheduleController.addStopStation);
router.delete('/:id/stations/:stationId', scheduleController.removeStopStation);

// Chuyến tàu thực tế
router.get('/trips', scheduleController.getActualTrips);
router.post('/generate', scheduleController.generateActualTrips);
router.put('/trips/:id/status', scheduleController.updateTripStatus);

module.exports = router;