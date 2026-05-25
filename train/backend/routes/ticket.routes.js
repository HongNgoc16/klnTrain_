const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Lấy danh sách vé (chỉ thông tin cơ bản)
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        v.ma_ve,
        v.so_toa_thu_tu,
        v.so_ghe_trong_toa,
        v.gia_ve,
        v.trang_thai,
        v.ngay_xuat_ve,
        tk.ho_ten as hanh_khach,
        t.so_hieu as chuyen_tau,
        g1.ten_ga as ga_len,
        g2.ten_ga as ga_xuong,
        ct.ngay_chay as ngay_di
      FROM Ve v
      JOIN HanhKhach hk ON v.ma_hanh_khach = hk.ma_hanh_khach
      JOIN TaiKhoan tk ON hk.ma_tai_khoan = tk.ma_tai_khoan
      JOIN ChuyenTau ct ON v.ma_chuyen = ct.ma_chuyen
      JOIN LichChay lc ON ct.ma_lich_chay = lc.ma_lich_chay
      JOIN Tau t ON lc.ma_tau = t.ma_tau
      JOIN GaTau g1 ON v.ma_ga_len = g1.ma_ga
      JOIN GaTau g2 ON v.ma_ga_xuong = g2.ma_ga
      ORDER BY v.ngay_xuat_ve DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy danh sách vé:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách vé' });
  }
});

// PUT: Xác nhận vé
router.put('/:id/confirm', async (req, res) => {
  try {
    await executeQuery(`
      UPDATE Ve SET trang_thai = 'da_su_dung' 
      WHERE ma_ve = @id AND trang_thai = 'hieu_luc'
    `, { id: parseInt(req.params.id) });
    
    res.json({ success: true, message: 'Xác nhận vé thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xác nhận vé' });
  }
});

// PUT: Hủy vé
router.put('/:id/cancel', async (req, res) => {
  const { ly_do } = req.body;
  
  try {
    await executeQuery(`
      UPDATE Ve SET trang_thai = 'da_huy' 
      WHERE ma_ve = @id AND trang_thai = 'hieu_luc'
    `, { id: parseInt(req.params.id) });
    
    res.json({ success: true, message: 'Hủy vé thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hủy vé' });
  }
});

module.exports = router;