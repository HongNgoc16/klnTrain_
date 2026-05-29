const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// GET: Lấy danh sách vé
router.get('/', ticketController.getAllTickets);

// GET: Lấy chi tiết vé
router.get('/:id', ticketController.getTicketById);

// GET: Thống kê vé
router.get('/stats', ticketController.getTicketStats);

// PUT: Hủy vé
router.put('/:id/cancel', ticketController.cancelTicket);

// PUT: Tự động cập nhật trạng thái vé
router.put('/:id/auto-update', ticketController.autoUpdateTicketStatus);

// POST: Cập nhật hàng loạt vé đã qua giờ
router.post('/bulk-update', ticketController.bulkUpdateExpiredTickets);

module.exports = router;