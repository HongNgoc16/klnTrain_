const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// GET: Lấy danh sách lịch chạy
router.get('/', scheduleController.getAllSchedules);

// GET: Lấy chi tiết ga dừng
router.get('/:id/stations', scheduleController.getScheduleStations);

// POST: Thêm ga dừng
router.post('/:id/stations', scheduleController.addStopStation);



// DELETE: Xóa ga dừng
router.delete('/:id/stations/:stationId', scheduleController.removeStopStation);

module.exports = router;