const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Lấy danh sách lịch chạy từ database
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Đang lấy dữ liệu lịch chạy từ database...');
    
    const result = await executeQuery(`
      SELECT 
        lc.ma_lich_chay,
        lc.ma_tau,
        t.so_hieu as so_hieu_tau,
        ISNULL(t.ten_tau, t.so_hieu) as ten_tau,
        lc.ma_ga_di,
        gd.ten_ga as ga_di,
        lc.ma_ga_den,
        gc.ten_ga as ga_den,
        FORMAT(lc.gio_khoi_hanh, 'HH:mm') as gio_khoi_hanh,
        FORMAT(lc.gio_du_kien_den, 'HH:mm') as gio_du_kien_den,
        lc.thu_trong_tuan,
        ISNULL((SELECT COUNT(*) FROM LichTrinhChuyen WHERE ma_lich_chay = lc.ma_lich_chay), 0) as so_ga_dung,
        ISNULL((SELECT SUM(khoang_cach_km) FROM LichTrinhChuyen WHERE ma_lich_chay = lc.ma_lich_chay), 0) as tong_khoang_cach
      FROM LichChay lc
      JOIN Tau t ON lc.ma_tau = t.ma_tau
      JOIN GaTau gd ON lc.ma_ga_di = gd.ma_ga
      JOIN GaTau gc ON lc.ma_ga_den = gc.ma_ga
      ORDER BY lc.ma_lich_chay
    `);
    
    console.log(`📊 Tìm thấy ${result.recordset.length} lịch chạy`);
    res.json({ success: true, data: result.recordset });
    
  } catch (error) {
    console.error('❌ Lỗi lấy lịch chạy:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch chạy', error: error.message });
  }
});

// GET: Lấy chi tiết ga dừng của một lịch chạy
router.get('/:id/stations', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`🔍 Đang lấy ga dừng cho lịch chạy ${id}`);
    
    const result = await executeQuery(`
      SELECT 
        lt.thu_tu_dung,
        lt.ma_ga,
        g.ten_ga,
        g.tinh_thanh,
        FORMAT(lt.gio_den, 'HH:mm') as gio_den,
        FORMAT(lt.gio_di, 'HH:mm') as gio_di,
        lt.khoang_cach_km,
        lt.thoi_gian_dung
      FROM LichTrinhChuyen lt
      JOIN GaTau g ON lt.ma_ga = g.ma_ga
      WHERE lt.ma_lich_chay = @id
      ORDER BY lt.thu_tu_dung
    `, { id });
    
    console.log(`📊 Tìm thấy ${result.recordset.length} ga dừng`);
    res.json({ success: true, data: result.recordset });
    
  } catch (error) {
    console.error('❌ Lỗi lấy ga dừng:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy ga dừng' });
  }
});

// POST: Thêm lịch chạy mới
router.post('/', async (req, res) => {
  const { ma_tau, ma_ga_di, ma_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan } = req.body;
  
  try {
    const result = await executeQuery(`
      INSERT INTO LichChay (ma_tau, ma_ga_di, ma_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan)
      OUTPUT INSERTED.ma_lich_chay
      VALUES (@ma_tau, @ma_ga_di, @ma_ga_den, @gio_khoi_hanh, @gio_du_kien_den, @thu_trong_tuan)
    `, { ma_tau, ma_ga_di, ma_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan });
    
    res.status(201).json({ 
      success: true, 
      message: 'Thêm lịch chạy thành công',
      data: { ma_lich_chay: result.recordset[0].ma_lich_chay }
    });
  } catch (error) {
    console.error('Lỗi thêm lịch chạy:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm lịch chạy' });
  }
});

// PUT: Cập nhật lịch chạy
router.put('/:id', async (req, res) => {
  const { ma_tau, ma_ga_di, ma_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan } = req.body;
  const id = parseInt(req.params.id);
  
  try {
    await executeQuery(`
      UPDATE LichChay 
      SET ma_tau = @ma_tau, ma_ga_di = @ma_ga_di, ma_ga_den = @ma_ga_den,
          gio_khoi_hanh = @gio_khoi_hanh, gio_du_kien_den = @gio_du_kien_den, thu_trong_tuan = @thu_trong_tuan
      WHERE ma_lich_chay = @id
    `, { id, ma_tau, ma_ga_di, ma_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật' });
  }
});

// DELETE: Xóa lịch chạy
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    // Xóa các ga dừng trước
    await executeQuery('DELETE FROM LichTrinhChuyen WHERE ma_lich_chay = @id', { id });
    // Xóa lịch chạy
    await executeQuery('DELETE FROM LichChay WHERE ma_lich_chay = @id', { id });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    console.error('Lỗi xóa:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa' });
  }
});

module.exports = router;