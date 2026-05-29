const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const priceController = require('../controllers/priceController');

router.use(authenticate);
router.use(authorize('quan_tri'));

// Biểu giá
router.get('/policies', priceController.getAllPricePolicies);
router.post('/policies', priceController.createPricePolicy);
router.put('/policies/:id', priceController.updatePricePolicy);
router.delete('/policies/:id', priceController.deletePricePolicy);

// Chính sách giá theo đối tượng
router.get('/customer-policies', priceController.getCustomerPolicies);
router.put('/customer-policies/:id', priceController.updateCustomerPolicy);

// Chính sách hủy
router.get('/cancel-policies', priceController.getCancelPolicies);
router.put('/cancel-policies/:id', priceController.updateCancelPolicy);

module.exports = router;