const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// Quản lý tài khoản
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserDetail);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/status', userController.updateUserStatus);
router.post('/:id/reset-password', userController.resetPassword);

// Quản lý hành khách
router.get('/:id/passengers', userController.getPassengers);
router.post('/:id/passengers', userController.addPassenger);
router.put('/passengers/:id', userController.updatePassenger);
router.delete('/passengers/:id', userController.deletePassenger);

// Audit logs
router.get('/audit-logs', userController.getAuditLogs);

module.exports = router;