const { executeQuery } = require('../config/db');

// Lấy danh sách lịch chạy
exports.getAllSchedules = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        lc.id_lich_chay,
        t.so_hieu,
        t.ten_tau,
        gd.ten_ga AS ga_di,
        gc.ten_ga AS ga_den,
        FORMAT(lc.gio_khoi_hanh, 'HH:mm') AS gio_khoi_hanh,
        FORMAT(lc.gio_du_kien_den, 'HH:mm') AS gio_du_kien_den,
        lc.thu_trong_tuan,
        (SELECT COUNT(*) FROM LichTrinhChuyen WHERE id_lich_chay = lc.id_lich_chay) AS so_ga_dung,
        (SELECT MAX(khoang_cach_km) FROM LichTrinhChuyen WHERE id_lich_chay = lc.id_lich_chay) AS tong_khoang_cach
      FROM LichChay lc
      JOIN Tau t ON t.id_tau = lc.id_tau
      JOIN GaTau gd ON gd.id_ga = lc.id_ga_di
      JOIN GaTau gc ON gc.id_ga = lc.id_ga_den
      ORDER BY lc.id_lich_chay
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy lịch chạy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết ga dừng (khoảng cách cộng dồn)
exports.getScheduleStations = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery(`
      SELECT 
        lt.thu_tu_dung,
        lt.id_ga,
        g.ten_ga,
        g.tinh_thanh,
        g.ma_ga_viet_tat,
        FORMAT(lt.gio_den, 'HH:mm') AS gio_den,
        FORMAT(lt.gio_di, 'HH:mm') AS gio_di,
        lt.khoang_cach_km,
        lt.thoi_gian_dung,
        ISNULL(lt.offset_phut, 0) AS offset_phut
      FROM LichTrinhChuyen lt
      JOIN GaTau g ON g.id_ga = lt.id_ga
      WHERE lt.id_lich_chay = @id
      ORDER BY lt.thu_tu_dung
    `, { id });
    
    // Format lại dữ liệu
    const formattedData = result.recordset.map((row, index, arr) => ({
      ...row,
      // Khoảng cách từ ga trước (km giữa 2 ga)
      khoang_cach_giua_ga: index === 0 ? 0 : row.khoang_cach_km - (arr[index - 1]?.khoang_cach_km || 0),
      // Tổng km đến ga hiện tại
      tong_km: row.khoang_cach_km
    }));
    
    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Lỗi lấy ga dừng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Các hàm khác giữ nguyên...
exports.createSchedule = async (req, res) => {
  const { id_tau, id_ga_di, id_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan } = req.body;
  
  if (!id_tau || !id_ga_di || !id_ga_den || !gio_khoi_hanh || !gio_du_kien_den) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });
  }
  
  try {
    const result = await executeQuery(`
      INSERT INTO LichChay (id_tau, id_ga_di, id_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan)
      OUTPUT INSERTED.id_lich_chay
      VALUES (@id_tau, @id_ga_di, @id_ga_den, @gio_khoi_hanh, @gio_du_kien_den, @thu_trong_tuan)
    `, { id_tau, id_ga_di, id_ga_den, gio_khoi_hanh, gio_du_kien_den, thu_trong_tuan });
    
    res.status(201).json({ success: true, data: { id_lich_chay: result.recordset[0].id_lich_chay } });
  } catch (error) {
    console.error('Lỗi tạo lịch chạy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStopStation = async (req, res) => {
  const { id } = req.params;
  const { thu_tu_dung, id_ga, gio_den, gio_di, khoang_cach_km, thoi_gian_dung } = req.body;
  
  if (!thu_tu_dung || !id_ga || !gio_den || !gio_di) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin ga dừng' });
  }
  
  try {
    await executeQuery(`
      INSERT INTO LichTrinhChuyen (id_lich_chay, thu_tu_dung, id_ga, gio_den, gio_di, khoang_cach_km, thoi_gian_dung, offset_phut)
      VALUES (@id_lich_chay, @thu_tu_dung, @id_ga, @gio_den, @gio_di, @khoang_cach_km, @thoi_gian_dung, 0)
    `, { id_lich_chay: id, thu_tu_dung, id_ga, gio_den, gio_di, khoang_cach_km, thoi_gian_dung });
    
    res.json({ success: true, message: 'Thêm ga dừng thành công' });
  } catch (error) {
    console.error('Lỗi thêm ga dừng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  
  try {
    const check = await executeQuery('SELECT id_lich_chay FROM LichChay WHERE id_lich_chay = @id', { id });
    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch chạy' });
    }
    
    await executeQuery('DELETE FROM LichTrinhChuyen WHERE id_lich_chay = @id', { id });
    await executeQuery('DELETE FROM LichChay WHERE id_lich_chay = @id', { id });
    
    res.json({ success: true, message: 'Xóa lịch chạy thành công' });
  } catch (error) {
    console.error('Lỗi xóa lịch chạy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeStopStation = async (req, res) => {
  const { id, stationId } = req.params;
  
  try {
    await executeQuery('DELETE FROM LichTrinhChuyen WHERE id_lich_chay = @id AND id_ga = @stationId', { id, stationId });
    res.json({ success: true, message: 'Xóa ga dừng thành công' });
  } catch (error) {
    console.error('Lỗi xóa ga dừng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Không cho phép sửa
exports.updateSchedule = async (req, res) => {
  res.status(403).json({ success: false, message: 'Không được phép sửa lịch chạy' });
};

exports.updateTripStatus = async (req, res) => {
  res.status(403).json({ success: false, message: 'Chức năng không khả dụng' });
};

exports.getStopStations = async (req, res) => {
  res.status(403).json({ success: false, message: 'Chức năng không khả dụng' });
};

exports.getActualTrips = async (req, res) => {
  res.status(403).json({ success: false, message: 'Chức năng không khả dụng' });
};