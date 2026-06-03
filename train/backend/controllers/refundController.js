const { executeQuery } = require('../config/db');

// Lấy danh sách hoàn tiền
exports.getAllRefunds = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        h.id_hoan,
        h.id_ve,
        h.tien_goc,
        h.phi_huy,
        h.tien_hoan,
        h.ly_do,
        h.trang_thai_hoan,
        h.thoi_gian_hoan   AS ngay_huy, 
        tk.ho_ten,
        t.so_hieu,
        v.ngay_xuat_ve
      FROM HoanTien h
      JOIN Ve v ON v.id_ve = h.id_ve
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN TaiKhoan tk ON tk.id_tai_khoan = d.id_tai_khoan
      JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
      JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
      JOIN Tau t ON t.id_tau = lc.id_tau
      ORDER BY h.thoi_gian_hoan DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy hoàn tiền:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xác nhận hoàn tiền
exports.confirmRefund = async (req, res) => {
  const { id } = req.params;
  
  try {
    await executeQuery(`
      UPDATE HoanTien 
      SET trang_thai_hoan = 'hoan_thanh', thoi_gian_hoan_xong = GETDATE()
      WHERE id_hoan = @id
    `, { id });
    
    res.json({ success: true, message: 'Xác nhận hoàn tiền thành công' });
  } catch (error) {
    console.error('Lỗi xác nhận hoàn tiền:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Từ chối hoàn tiền
exports.rejectRefund = async (req, res) => {
  const { id } = req.params;
  
  try {
    await executeQuery(`
      UPDATE HoanTien 
      SET trang_thai_hoan = 'that_bai'
      WHERE id_hoan = @id
    `, { id });
    
    res.json({ success: true, message: 'Từ chối hoàn tiền thành công' });
  } catch (error) {
    console.error('Lỗi từ chối hoàn tiền:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thống kê hoàn tiền
exports.getRefundStats = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN trang_thai_hoan = 'cho_xu_ly' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN trang_thai_hoan = 'hoan_thanh' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN trang_thai_hoan = 'that_bai' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN trang_thai_hoan = 'hoan_thanh' THEN tien_hoan ELSE 0 END) AS total_refunded
      FROM HoanTien
    `);
    
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('Lỗi thống kê hoàn tiền:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};