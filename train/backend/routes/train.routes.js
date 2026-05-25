const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Lấy danh sách tàu
router.get('/', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT t.ma_tau, t.so_hieu, t.ten_tau, t.so_toa, t.trang_thai,
             COUNT(DISTINCT cht.ma_cau_hinh) as so_toa_thuc_te
      FROM Tau t
      LEFT JOIN CauHinhToa cht ON t.ma_tau = cht.ma_tau
      GROUP BY t.ma_tau, t.so_hieu, t.ten_tau, t.so_toa, t.trang_thai
      ORDER BY t.so_hieu
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy danh sách tàu:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách tàu' });
  }
});

// GET: Lấy chi tiết tàu theo ID
router.get('/:id', async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT t.*, 
              COUNT(DISTINCT cht.ma_cau_hinh) as so_toa_thuc_te
       FROM Tau t
       LEFT JOIN CauHinhToa cht ON t.ma_tau = cht.ma_tau
       WHERE t.ma_tau = @id
       GROUP BY t.ma_tau, t.so_hieu, t.ten_tau, t.so_toa, t.trang_thai`,
      { id: parseInt(req.params.id) }
    );
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tàu' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết tàu' });
  }
});

// POST: Thêm tàu mới
router.post('/', async (req, res) => {
  const { so_hieu, ten_tau, so_toa, trang_thai } = req.body;
  
  try {
    const result = await executeQuery(`
      INSERT INTO Tau (so_hieu, ten_tau, so_toa, trang_thai)
      OUTPUT INSERTED.ma_tau
      VALUES (@so_hieu, @ten_tau, @so_toa, @trang_thai)
    `, { so_hieu, ten_tau, so_toa, trang_thai: trang_thai || 'hoat_dong' });
    
    res.status(201).json({ 
      success: true, 
      message: 'Thêm tàu thành công',
      data: { ma_tau: result.recordset[0].ma_tau }
    });
  } catch (error) {
    console.error('Lỗi thêm tàu:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm tàu' });
  }
});

// PUT: Cập nhật tàu
router.put('/:id', async (req, res) => {
  const { so_hieu, ten_tau, so_toa, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      UPDATE Tau 
      SET so_hieu = @so_hieu, ten_tau = @ten_tau, so_toa = @so_toa, trang_thai = @trang_thai
      WHERE ma_tau = @id
    `, { id: parseInt(req.params.id), so_hieu, ten_tau, so_toa, trang_thai });
    
    res.json({ success: true, message: 'Cập nhật tàu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật tàu' });
  }
});

// DELETE: Xóa tàu
router.delete('/:id', async (req, res) => {
  try {
    await executeQuery('DELETE FROM Tau WHERE ma_tau = @id', { id: parseInt(req.params.id) });
    res.json({ success: true, message: 'Xóa tàu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa tàu' });
  }
});

module.exports = router;