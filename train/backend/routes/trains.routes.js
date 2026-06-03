const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const trainController = require('../controllers/trainController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// Quản lý tàu
router.get('/', trainController.getAllTrains);
router.get('/:id', trainController.getTrainDetail);
router.post('/', trainController.createTrain);
router.put('/:id', trainController.updateTrain);
router.delete('/:id', trainController.deleteTrain);

// Quản lý cấu hình toa
router.post('/:id/carriages', trainController.addCarriageToTrain);
router.delete('/:id/carriages/:carriageId', trainController.removeCarriageFromTrain);

module.exports = router;