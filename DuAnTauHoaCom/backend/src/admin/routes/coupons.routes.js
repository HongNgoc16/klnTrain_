const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const couponController = require('../controllers/couponController');

router.use(authenticate);
router.use(authorize('quan_tri'));

router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;