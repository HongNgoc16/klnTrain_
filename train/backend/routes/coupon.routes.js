const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Lấy danh sách coupon
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT * FROM Coupon 
      ORDER BY ngay_het_han DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi GET coupons:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách coupon' });
  }
});

// POST: Thêm coupon mới
router.post('/', async (req, res) => {
  const { ma_km, mo_ta, loai_giam, gia_tri, so_luong, ngay_bat_dau, ngay_het_han } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO Coupon (ma_km, mo_ta, loai_giam, gia_tri, so_luong, da_dung, ngay_bat_dau, ngay_het_han)
      VALUES (@ma_km, @mo_ta, @loai_giam, @gia_tri, @so_luong, 0, @ngay_bat_dau, @ngay_het_han)
    `, { ma_km, mo_ta, loai_giam, gia_tri, so_luong, ngay_bat_dau, ngay_het_han });
    
    res.status(201).json({ success: true, message: 'Thêm coupon thành công' });
  } catch (error) {
    console.error('Lỗi POST coupon:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm coupon' });
  }
});

// PUT: Cập nhật coupon
router.put('/:ma_km', async (req, res) => {
  const { mo_ta, loai_giam, gia_tri, so_luong, ngay_bat_dau, ngay_het_han } = req.body;
  
  try {
    await executeQuery(`
      UPDATE Coupon 
      SET mo_ta = @mo_ta, loai_giam = @loai_giam, gia_tri = @gia_tri, 
          so_luong = @so_luong, ngay_bat_dau = @ngay_bat_dau, ngay_het_han = @ngay_het_han
      WHERE ma_km = @ma_km
    `, { ma_km: req.params.ma_km, mo_ta, loai_giam, gia_tri, so_luong, ngay_bat_dau, ngay_het_han });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật' });
  }
});

// DELETE: Xóa coupon
router.delete('/:ma_km', async (req, res) => {
  try {
    await executeQuery('DELETE FROM Coupon WHERE ma_km = @ma_km', { ma_km: req.params.ma_km });
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa' });
  }
});

module.exports = router;