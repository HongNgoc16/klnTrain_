const { executeQuery } = require('../config/db');

// Lấy danh sách vé
exports.getAllTickets = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        v.id_ve,
        v.gia_ve,
        v.so_toa_thu_tu,
        v.so_ghe_trong_toa,
        v.trang_thai,
        v.ngay_xuat_ve,
        tk.ho_ten,
        t.so_hieu,
        gd.ten_ga AS ga_di,
        gc.ten_ga AS ga_den,
        ct.ngay_chay,
        FORMAT(lc.gio_khoi_hanh, 'HH:mm') AS gio_di,
        FORMAT(lc.gio_du_kien_den, 'HH:mm') AS gio_den
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN TaiKhoan tk ON tk.id_tai_khoan = d.id_tai_khoan
      JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
      JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
      JOIN Tau t ON t.id_tau = lc.id_tau
      JOIN GaTau gd ON gd.id_ga = v.id_ga_len
      JOIN GaTau gc ON gc.id_ga = v.id_ga_xuong
      ORDER BY v.ngay_xuat_ve DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy vé:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết một vé
exports.getTicketById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await executeQuery(`
      SELECT 
        v.id_ve,
        v.gia_ve,
        v.so_toa_thu_tu,
        v.so_ghe_trong_toa,
        v.trang_thai,
        v.ngay_xuat_ve,
        tk.ho_ten,
        tk.email,
        tk.so_dien_thoai,
        t.so_hieu AS chuyen_tau,
        t.ten_tau,
        gd.ten_ga AS ga_len,
        gc.ten_ga AS ga_xuong,
        ct.ngay_chay,
        FORMAT(lc.gio_khoi_hanh, 'HH:mm') AS gio_di,
        FORMAT(lc.gio_du_kien_den, 'HH:mm') AS gio_den,
        d.ma_don,
        d.ma_dat_cho,
        d.tong_tien,
        d.tien_thanh_toan
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN TaiKhoan tk ON tk.id_tai_khoan = d.id_tai_khoan
      JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
      JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
      JOIN Tau t ON t.id_tau = lc.id_tau
      JOIN GaTau gd ON gd.id_ga = v.id_ga_len
      JOIN GaTau gc ON gc.id_ga = v.id_ga_xuong
      WHERE v.id_ve = @id
    `, { id });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé' });
    }
    
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Lỗi lấy chi tiết vé:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hủy vé
exports.cancelTicket = async (req, res) => {
  const { id } = req.params;
  const { ly_do } = req.body;
  
  try {
    // Kiểm tra vé có tồn tại và còn hiệu lực không
    const checkResult = await executeQuery(`
      SELECT v.trang_thai, ct.ngay_chay, lc.gio_khoi_hanh
      FROM Ve v
      JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
      JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
      WHERE v.id_ve = @id
    `, { id });
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé' });
    }
    
    const ticket = checkResult.recordset[0];
    
    // Kiểm tra vé có thể hủy không
    if (ticket.trang_thai !== 'hieu_luc' && ticket.trang_thai !== 'da_xac_nhan') {
      return res.status(400).json({ success: false, message: 'Vé không thể hủy ở trạng thái hiện tại' });
    }
    
    // Kiểm tra thời gian còn trước giờ chạy
    const departureTime = new Date(ticket.ngay_chay);
    const now = new Date();
    
    if (departureTime < now) {
      return res.status(400).json({ success: false, message: 'Không thể hủy vé sau giờ khởi hành' });
    }
    
    // Thực hiện hủy vé
    await executeQuery(`
      UPDATE Ve SET trang_thai = 'da_huy' 
      WHERE id_ve = @id
    `, { id });
    
    // Ghi log hủy vé
    await executeQuery(`
      INSERT INTO AuditLog (bang, ma_ban_ghi, hanh_dong, gia_tri_moi, thoi_gian)
      VALUES ('Ve', @id, 'UPDATE', @log, GETDATE())
    `, { id, log: JSON.stringify({ trang_thai: 'da_huy', ly_do: ly_do || 'Không có lý do' }) });
    
    res.json({ success: true, message: 'Hủy vé thành công' });
  } catch (error) {
    console.error('Lỗi hủy vé:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tự động cập nhật trạng thái vé (khi qua giờ khởi hành)
exports.autoUpdateTicketStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Cập nhật vé thành đã sử dụng nếu đã qua giờ khởi hành
    const result = await executeQuery(`
      UPDATE Ve 
      SET trang_thai = 'da_su_dung' 
      WHERE id_ve = @id 
        AND trang_thai IN ('hieu_luc', 'da_xac_nhan')
        AND EXISTS (
          SELECT 1 FROM ChuyenTau ct 
          WHERE ct.id_chuyen = Ve.id_chuyen 
            AND ct.ngay_chay < GETDATE()
        )
    `, { id });
    
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái vé:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật hàng loạt vé đã qua giờ khởi hành (chạy định kỳ)
exports.bulkUpdateExpiredTickets = async (req, res) => {
  try {
    const result = await executeQuery(`
      UPDATE Ve 
      SET trang_thai = 'da_su_dung' 
      WHERE trang_thai IN ('hieu_luc', 'da_xac_nhan')
        AND EXISTS (
          SELECT 1 FROM ChuyenTau ct 
          WHERE ct.id_chuyen = Ve.id_chuyen 
            AND ct.ngay_chay < GETDATE()
        )
    `);
    
    const affectedRows = result.rowsAffected?.[0] || 0;
    
    res.json({ 
      success: true, 
      message: `Đã cập nhật ${affectedRows} vé thành đã sử dụng`,
      updated_count: affectedRows
    });
  } catch (error) {
    console.error('Lỗi cập nhật hàng loạt:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thống kê số lượng vé theo trạng thái
exports.getTicketStats = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN trang_thai IN ('hieu_luc', 'da_xac_nhan') THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN trang_thai = 'da_su_dung' THEN 1 ELSE 0 END) AS used,
        SUM(CASE WHEN trang_thai = 'da_huy' THEN 1 ELSE 0 END) AS cancelled
      FROM Ve
    `);
    
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Lỗi thống kê vé:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};