const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Lấy danh sách ga
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT ma_ga, ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai
      FROM GaTau
      ORDER BY thu_tu_tuyen, do_uu_tien
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy danh sách ga:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách ga' });
  }
});

// GET: Lấy chi tiết ga
router.get('/:id', async (req, res) => {
  try {
    const result = await executeQuery(
      'SELECT * FROM GaTau WHERE ma_ga = @id',
      { id: parseInt(req.params.id) }
    );
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ga' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết ga' });
  }
});

// POST: Thêm ga mới
router.post('/', async (req, res) => {
  const { ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai } = req.body;
  
  try {
    const result = await executeQuery(`
      INSERT INTO GaTau (ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai)
      OUTPUT INSERTED.ma_ga
      VALUES (@ma_ga_viet_tat, @ten_ga, @tinh_thanh, @thu_tu_tuyen, @do_uu_tien, @trang_thai)
    `, { ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien: do_uu_tien || 3, trang_thai: trang_thai || 'hoat_dong' });
    
    res.status(201).json({ success: true, message: 'Thêm ga thành công', data: { ma_ga: result.recordset[0].ma_ga } });
  } catch (error) {
    console.error('Lỗi thêm ga:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm ga' });
  }
});

// PUT: Cập nhật ga
router.put('/:id', async (req, res) => {
  const { ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      UPDATE GaTau 
      SET ma_ga_viet_tat = @ma_ga_viet_tat, ten_ga = @ten_ga, tinh_thanh = @tinh_thanh,
          thu_tu_tuyen = @thu_tu_tuyen, do_uu_tien = @do_uu_tien, trang_thai = @trang_thai
      WHERE ma_ga = @id
    `, { id: parseInt(req.params.id), ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai });
    
    res.json({ success: true, message: 'Cập nhật ga thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật ga' });
  }
});

// DELETE: Xóa ga
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM GaTau WHERE ma_ga = @id', { id: parseInt(req.params.id) });
    res.json({ success: true, message: 'Xóa ga thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa ga' });
  }
});

module.exports = router;