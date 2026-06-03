const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const carriageController = require('../controllers/carriageController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// Loại toa
router.get('/types', carriageController.getAllCarriageTypes);
router.post('/types', carriageController.createCarriageType);
//router.put('/types/:id', carriageController.updateCarriageType);
//router.delete('/types/:id', carriageController.deleteCarriageType);

// Loại ghế
router.get('/seat-types', carriageController.getAllSeatTypes);
router.post('/seat-types', carriageController.createSeatType);
//router.put('/seat-types/:id', carriageController.updateSeatType);
//router.delete('/seat-types/:id', carriageController.deleteSeatType);

// Cấu hình ghế trong toa
router.post('/:id_loai_toa/seats', carriageController.configureSeats);
//router.get('/:id_loai_toa/seats', carriageController.getSeatConfiguration);

module.exports = router;