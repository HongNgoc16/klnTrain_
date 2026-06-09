const router = require('express').Router()
const TrainController = require('../controllers/TrainController')

// GET /api/trains/popular-routes?limit=10
router.get('/popular-routes', TrainController.getPopularRoutes)

// GET /api/trains/search?gaDi=Hà Nội&gaDen=Sài Gòn&ngayChay=2026-05-07
router.get('/search', TrainController.searchTrains)

// GET /api/trains/stations
router.get('/stations', TrainController.getAllStations)

// GET /api/trains/schedule
router.get('/schedule', TrainController.getSchedule)

// GET /api/trains/detail/:idLichChay?idGaLen=1&idGaXuong=2&ngayChay=2026-06-01
router.get('/detail/:idLichChay', TrainController.getTrainDetail)

// GET /api/trains/:idChuyen/seats/:soToa
router.get('/:idChuyen/seats/:soToa', TrainController.getSeatMap)

module.exports = router
