const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const refundController = require('../controllers/refundController');

router.use(authenticate);
router.use(authorize('quan_tri', 'nhan_vien'));

router.get('/', refundController.getAllRefunds);
router.get('/stats', refundController.getRefundStats);
//router.get('/:id', refundController.getRefundDetail);
router.put('/:id/confirm', refundController.confirmRefund);
router.put('/:id/reject', refundController.rejectRefund);

module.exports = router;