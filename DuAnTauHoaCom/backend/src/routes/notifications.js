const router = require('express').Router()
const NotificationController = require('../controllers/NotificationController')
const { authenticate } = require('../middleware/auth')

router.get('/',          authenticate, NotificationController.getMyNotifications)
router.put('/read-all',  authenticate, NotificationController.markAllAsRead)
router.put('/:id/read',  authenticate, NotificationController.markAsRead)

module.exports = router
