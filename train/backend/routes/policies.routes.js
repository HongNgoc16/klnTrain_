const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

// Chính sách giá theo loại khách hàng
router.get('/customer-discounts', policyController.getCustomerDiscounts);
router.put('/customer-discounts/:id', policyController.updateCustomerDiscount);

// Chính sách hủy vé
router.get('/cancel-fees', policyController.getCancelFees);
router.put('/cancel-fees/:id', policyController.updateCancelFee);

// Biểu giá theo dịp
router.get('/occasion-policies', policyController.getOccasionPolicies);
router.put('/occasion-policies/:id', policyController.updateOccasionPolicy);

// Giá cơ bản
router.get('/base-price', policyController.getBasePrice);

// Hệ số loại ghế
router.get('/seat-factors', policyController.getSeatFactors);

module.exports = router;