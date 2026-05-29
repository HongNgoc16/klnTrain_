const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const seatController = require('../controllers/seatController');

// Public endpoints (cho khách hàng đặt vé)
router.get('/map', seatController.getSeatMap);
router.get('/carriages', seatController.getCarriageList);
router.get('/check', seatController.checkSeatAvailability);
router.get('/available-count', seatController.getAvailableSeatsCount);
router.post('/hold', seatController.holdSeat);
router.delete('/release', seatController.releaseSeat);

// Admin endpoints
router.use(authenticate);
router.post('/carriage-types/:id_loai_toa/configure', seatController.configureSeatsForCarriage);
router.get('/carriage-types/:id_loai_toa/configuration', seatController.getSeatConfiguration);

module.exports = router;