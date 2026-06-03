const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const seatController = require('../controllers/seatController');

//  PUBLIC ENDPOINTS
router.get('/map', seatController.getSeatMap);
router.get('/carriages', seatController.getCarriageList);
router.get('/check', seatController.checkSeatAvailability);
router.get('/available-count', seatController.getAvailableSeatsCount);
router.post('/hold', seatController.holdSeat);
router.delete('/release', seatController.releaseSeat);

//ADMIN ENDPOINTS 
router.use(authenticate);

// Quản lý loại ghế
router.get('/types', seatController.getAllSeatTypes);          
router.post('/types', seatController.createSeatType);           
router.put('/types/:id', seatController.updateSeatType);        
router.delete('/types/:id', seatController.deleteSeatType);     

// Quản lý loại toa
router.get('/carriage-types', seatController.getAllCarriageTypes);     
router.post('/carriage-types', seatController.createCarriageType);     
router.put('/carriage-types/:id', seatController.updateCarriageType);  
router.delete('/carriage-types/:id', seatController.deleteCarriageType); // 

// Cấu hình ghế trong toa
router.post('/carriage-types/:id_loai_toa/configure', seatController.configureSeatsForCarriage);
router.get('/carriage-types/:id_loai_toa/configuration', seatController.getSeatConfiguration);

module.exports = router;