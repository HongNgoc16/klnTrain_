const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const stationController = require('../controllers/stationController');

router.use(authenticate);
router.use(authorize('quan_tri'));

router.get('/', stationController.getAllStations);
router.post('/', stationController.createStation);
router.put('/:id', stationController.updateStation);
router.delete('/:id', stationController.deleteStation);

module.exports = router;