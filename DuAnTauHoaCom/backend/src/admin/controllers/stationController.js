const { executeQuery } = require('../config/db');

// Lấy danh sách ga
exports.getAllStations = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_ga, ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai
      FROM GaTau
      ORDER BY thu_tu_tuyen, do_uu_tien
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm ga mới
exports.createStation = async (req, res) => {
  const { ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai } = req.body;
  
  try {
    // Kiểm tra mã ga đã tồn tại
    const check = await executeQuery(
      'SELECT id_ga FROM GaTau WHERE ma_ga_viet_tat = @ma_ga_viet_tat',
      { ma_ga_viet_tat }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã ga đã tồn tại' });
    }
    
    await executeQuery(`
      INSERT INTO GaTau (ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai)
      VALUES (@ma_ga_viet_tat, @ten_ga, @tinh_thanh, @thu_tu_tuyen, @do_uu_tien, @trang_thai)
    `, { ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien: do_uu_tien || 3, trang_thai: trang_thai || 'hoat_dong' });
    
    res.status(201).json({ success: true, message: 'Thêm ga thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật ga
exports.updateStation = async (req, res) => {
  const { id } = req.params;
  const { ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      UPDATE GaTau 
      SET ma_ga_viet_tat = @ma_ga_viet_tat, ten_ga = @ten_ga, tinh_thanh = @tinh_thanh,
          thu_tu_tuyen = @thu_tu_tuyen, do_uu_tien = @do_uu_tien, trang_thai = @trang_thai
      WHERE id_ga = @id
    `, { id, ma_ga_viet_tat, ten_ga, tinh_thanh, thu_tu_tuyen, do_uu_tien, trang_thai });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa ga (kiểm tra ràng buộc)
exports.deleteStation = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra ga có đang được sử dụng trong lịch trình không
    const check = await executeQuery(
      'SELECT id_ga FROM LichChay WHERE id_ga_di = @id OR id_ga_den = @id',
      { id }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Ga đang được sử dụng trong lịch trình, không thể xóa' });
    }
    
    await executeQuery('DELETE FROM GaTau WHERE id_ga = @id', { id });
    res.json({ success: true, message: 'Xóa ga thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};