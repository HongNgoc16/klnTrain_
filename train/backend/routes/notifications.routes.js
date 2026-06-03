const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.use(authenticate);

// Người dùng thường
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
//router.put('/read-all', notificationController.markAllAsRead);

// Quản trị viên
router.post('/broadcast', authorize('quan_tri'), notificationController.sendBroadcastNotification);
router.post('/group', authorize('quan_tri'), notificationController.sendGroupNotification);

module.exports = router;