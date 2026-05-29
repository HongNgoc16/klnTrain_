const { executeQuery, executeProcedure } = require('../config/db');

// Lấy danh sách lịch chạy
exports.getAllSchedules = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT lc.id_lich_chay, t.so_hieu AS ma_tau, t.ten_tau,
             gd.ten_ga AS ga_di, gn.ten_ga AS ga_den,
             FORMAT(lc.gio_khoi_hanh, 'HH:mm') AS gio_di,
             FORMAT(lc.gio_du_kien_den, 'HH:mm') AS gio_den,
             lc.thu_trong_tuan,
             (SELECT COUNT(*) FROM LichTrinhChuyen WHERE id_lich_chay = lc.id_lich_chay) AS so_ga_dung
      FROM LichChay lc
      JOIN Tau t ON t.id_tau = lc.id_tau
      JOIN GaTau gd ON gd.id_ga = lc.id_ga_di
      JOIN GaTau gn ON gn.id_ga = lc.id_ga_den
      ORDER BY lc.id_lich_chay
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm lịch chạy mới
exports.createSchedule = async (req, res) => {
  const { id_tau, id_ga_di, id_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan } = req.body;
  
  try {
    // Kiểm tra tàu có hoạt động không
    const trainCheck = await executeQuery(
      'SELECT trang_thai FROM Tau WHERE id_tau = @id_tau',
      { id_tau }
    );
    
    if (trainCheck.recordset[0]?.trang_thai !== 'hoat_dong') {
      return res.status(400).json({ success: false, message: 'Tàu không ở trạng thái hoạt động' });
    }
    
    const result = await executeQuery(`
      INSERT INTO LichChay (id_tau, id_ga_di, id_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan)
      OUTPUT INSERTED.id_lich_chay
      VALUES (@id_tau, @id_ga_di, @id_ga_den, @gio_khoi_hanh, @gio_du_kien_den, @thu_trong_tuan)
    `, { id_tau, id_ga_di, id_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan });
    
    res.status(201).json({ success: true, data: { id_lich_chay: result.recordset[0].id_lich_chay } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm ga dừng cho lịch chạy
exports.addStopStation = async (req, res) => {
  const { id } = req.params;
  const { thu_tu_dung, id_ga, gio_den, gio_di, khoang_cach_km, thoi_gian_dung } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO LichTrinhChuyen (id_lich_chay, thu_tu_dung, id_ga, gio_den, gio_di, khoang_cach_km, thoi_gian_dung)
      VALUES (@id_lich_chay, @thu_tu_dung, @id_ga, @gio_den, @gio_di, @khoang_cach_km, @thoi_gian_dung)
    `, { id_lich_chay: id, thu_tu_dung, id_ga, gio_den, gio_di, khoang_cach_km, thoi_gian_dung });
    
    res.json({ success: true, message: 'Thêm ga dừng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa lịch chạy
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra có chuyến tàu thực tế không
    const check = await executeQuery(
      'SELECT id_chuyen FROM ChuyenTau WHERE id_lich_chay = @id',
      { id }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Lịch chạy đã có chuyến tàu thực tế, không thể xóa' });
    }
    
    await executeQuery('DELETE FROM LichTrinhChuyen WHERE id_lich_chay = @id', { id });
    await executeQuery('DELETE FROM LichChay WHERE id_lich_chay = @id', { id });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo chuyến tàu thực tế từ lịch mẫu
exports.generateActualTrips = async (req, res) => {
  const { id_lich_chay, ngay_bat_dau, ngay_ket_thuc } = req.body;
  
  try {
    // Lấy thông tin lịch mẫu
    const schedule = await executeQuery(
      'SELECT * FROM LichChay WHERE id_lich_chay = @id_lich_chay',
      { id_lich_chay }
    );
    
    if (schedule.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch mẫu' });
    }
    
    // Tạo các chuyến tàu trong khoảng thời gian
    let start = new Date(ngay_bat_dau);
    const end = new Date(ngay_ket_thuc);
    let created = 0;
    
    while (start <= end) {
      const ngay = start.toISOString().split('T')[0];
      
      await executeQuery(`
        INSERT INTO ChuyenTau (id_lich_chay, ngay_chay, trang_thai)
        VALUES (@id_lich_chay, @ngay, 'dung_gio')
      `, { id_lich_chay, ngay });
      
      created++;
      start.setDate(start.getDate() + 1);
    }
    
    res.json({ success: true, message: `Đã tạo ${created} chuyến tàu` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  res.json({ success: true, message: 'updateSchedule' });
};

exports.getStopStations = async (req, res) => {
  res.json({ success: true, data: [] });
};

exports.removeStopStation = async (req, res) => {
  res.json({ success: true, message: 'removeStopStation' });
};

exports.getActualTrips = async (req, res) => {
  res.json({ success: true, data: [] });
};

exports.updateTripStatus = async (req, res) => {
  res.json({ success: true, message: 'updateTripStatus' });
};