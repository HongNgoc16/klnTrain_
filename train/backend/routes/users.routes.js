const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// Quản lý tài khoản
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/status', userController.updateUserStatus);
router.post('/:id/reset-password', userController.resetPassword);


// Audit logs
router.get('/audit-logs', userController.getAuditLogs);

module.exports = router;