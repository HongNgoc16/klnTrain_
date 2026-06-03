const { executeQuery } = require('../config/db');

// ==================== CHÍNH SÁCH GIÁ THEO LOẠI KHÁCH HÀNG ====================

// Lấy danh sách chính sách giá
exports.getCustomerDiscounts = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_chinh_sach, ten_chinh_sach, loai_hanh_khach, phan_tram_giam
      FROM ChinhSachGia
      ORDER BY phan_tram_giam
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy chính sách giá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật chính sách giá
exports.updateCustomerDiscount = async (req, res) => {
  const { id } = req.params;
  const { phan_tram_giam } = req.body;
  
  try {
    await executeQuery(
      'UPDATE ChinhSachGia SET phan_tram_giam = @phan_tram_giam WHERE id_chinh_sach = @id',
      { id, phan_tram_giam }
    );
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật chính sách giá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CHÍNH SÁCH HỦY VÉ ====================

// Lấy danh sách chính sách hủy
exports.getCancelFees = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_cs_huy, gio_truoc_gio_chay, phi_huy
      FROM ChinhSachHuy
      ORDER BY gio_truoc_gio_chay DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy chính sách hủy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật chính sách hủy
exports.updateCancelFee = async (req, res) => {
  const { id } = req.params;
  const { phi_huy } = req.body;
  
  try {
    await executeQuery(
      'UPDATE ChinhSachHuy SET phi_huy = @phi_huy WHERE id_cs_huy = @id',
      { id, phi_huy }
    );
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật chính sách hủy:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BIỂU GIÁ THEO DỊP ====================

// Lấy danh sách biểu giá theo dịp
exports.getOccasionPolicies = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_bieu_gia, ten_dip, he_so_tang, ngay_bat_dau, ngay_ket_thuc
      FROM BieuGia
      WHERE trang_thai = 'dang_ap_dung'
      ORDER BY he_so_tang
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy biểu giá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật biểu giá
exports.updateOccasionPolicy = async (req, res) => {
  const { id } = req.params;
  const { he_so_tang } = req.body;
  
  try {
    await executeQuery(
      'UPDATE BieuGia SET he_so_tang = @he_so_tang WHERE id_bieu_gia = @id',
      { id, he_so_tang }
    );
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật biểu giá:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GIÁ CƠ BẢN ====================

// Lấy giá cơ bản
exports.getBasePrice = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 1 don_gia_km_goc AS don_gia, ngay_bat_dau AS tu_ngay
      FROM BieuGia
      WHERE he_so_tang = 1.0 AND trang_thai = 'dang_ap_dung'
      ORDER BY ngay_bat_dau DESC
    `);
    res.json({ success: true, data: result.recordset[0] || { don_gia: 1500, tu_ngay: '2024-01-01' } });
  } catch (error) {
    console.error('Lỗi lấy giá cơ bản:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== HỆ SỐ LOẠI GHẾ ====================

// Lấy danh sách hệ số loại ghế
exports.getSeatFactors = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_loai_ghe, ten_loai_ghe, he_so_gia
      FROM LoaiGhe
      WHERE trang_thai = 'dang_ban'
      ORDER BY he_so_gia
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy hệ số ghế:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};