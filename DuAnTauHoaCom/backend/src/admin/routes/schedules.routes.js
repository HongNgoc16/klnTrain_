const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/scheduleController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// GET: Lấy danh sách lịch chạy
router.get('/', scheduleController.getAllSchedules);

// POST: Tạo lịch chạy mới
router.post('/', scheduleController.createSchedule);

// DELETE: Xóa lịch chạy
router.delete('/:id', scheduleController.deleteSchedule);

// GET: Lấy chi tiết ga dừng
router.get('/:id/stations', scheduleController.getScheduleStations);

// POST: Thêm ga dừng
router.post('/:id/stations', scheduleController.addStopStation);

// DELETE: Xóa ga dừng
router.delete('/:id/stations/:stationId', scheduleController.removeStopStation);

module.exports = router;