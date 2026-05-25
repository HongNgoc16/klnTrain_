const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Lấy danh sách khách hàng
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT tk.ma_tai_khoan, tk.email, tk.ho_ten, tk.so_dien_thoai, tk.ngay_tao,
             hk.loai_hanh_khach, hk.cccd,
             (SELECT COUNT(*) FROM Ve v 
              JOIN DonDatVe d ON v.ma_don = d.ma_don 
              WHERE d.ma_tai_khoan = tk.ma_tai_khoan) as total_tickets
      FROM TaiKhoan tk
      LEFT JOIN HanhKhach hk ON tk.ma_tai_khoan = hk.ma_tai_khoan AND hk.la_chinh = 1
      WHERE tk.vai_tro = 'hanh_khach'
      ORDER BY tk.ngay_tao DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy danh sách khách hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khách hàng' });
  }
});

// GET: Chi tiết khách hàng
router.get('/:id', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT tk.*, hk.loai_hanh_khach, hk.cccd, hk.ngay_sinh
      FROM TaiKhoan tk
      LEFT JOIN HanhKhach hk ON tk.ma_tai_khoan = hk.ma_tai_khoan AND hk.la_chinh = 1
      WHERE tk.ma_tai_khoan = @id
    `, { id: parseInt(req.params.id) });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết khách hàng' });
  }
});

module.exports = router;