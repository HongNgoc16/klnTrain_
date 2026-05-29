const { executeQuery } = require('../config/db');

// Lấy danh sách biểu giá
exports.getAllPricePolicies = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_bieu_gia, ten_dip, ngay_bat_dau, ngay_ket_thuc,
             he_so_tang, don_gia_km_goc, trang_thai
      FROM BieuGia
      ORDER BY ngay_bat_dau DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm biểu giá mới
exports.createPricePolicy = async (req, res) => {
  const { ten_dip, ngay_bat_dau, ngay_ket_thuc, he_so_tang, don_gia_km_goc, id_loai_ghe, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO BieuGia (ten_dip, ngay_bat_dau, ngay_ket_thuc, he_so_tang, don_gia_km_goc, id_loai_ghe, trang_thai)
      VALUES (@ten_dip, @ngay_bat_dau, @ngay_ket_thuc, @he_so_tang, @don_gia_km_goc, @id_loai_ghe, @trang_thai)
    `, { ten_dip, ngay_bat_dau, ngay_ket_thuc, he_so_tang, don_gia_km_goc, id_loai_ghe, trang_thai: trang_thai || 'dang_ap_dung' });
    
    res.status(201).json({ success: true, message: 'Thêm biểu giá thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật biểu giá
exports.updatePricePolicy = async (req, res) => {
  const { id } = req.params;
  const { ten_dip, ngay_bat_dau, ngay_ket_thuc, he_so_tang, don_gia_km_goc, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      UPDATE BieuGia
      SET ten_dip = @ten_dip, ngay_bat_dau = @ngay_bat_dau, ngay_ket_thuc = @ngay_ket_thuc,
          he_so_tang = @he_so_tang, don_gia_km_goc = @don_gia_km_goc, trang_thai = @trang_thai
      WHERE id_bieu_gia = @id
    `, { id, ten_dip, ngay_bat_dau, ngay_ket_thuc, he_so_tang, don_gia_km_goc, trang_thai });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa biểu giá
exports.deletePricePolicy = async (req, res) => {
  const { id } = req.params;
  
  try {
    await executeQuery('DELETE FROM BieuGia WHERE id_bieu_gia = @id', { id });
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách chính sách giá theo đối tượng
exports.getCustomerPolicies = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_chinh_sach, ten_chinh_sach, loai_hanh_khach, phan_tram_giam, tu_ngay, den_ngay
      FROM ChinhSachGia
      ORDER BY loai_hanh_khach
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật chính sách giá
exports.updateCustomerPolicy = async (req, res) => {
  const { id } = req.params;
  const { phan_tram_giam } = req.body;
  
  try {
    await executeQuery(`
      UPDATE ChinhSachGia SET phan_tram_giam = @phan_tram_giam
      WHERE id_chinh_sach = @id
    `, { id, phan_tram_giam });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách chính sách hủy
exports.getCancelPolicies = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_cs_huy, gio_truoc_gio_chay, phi_huy
      FROM ChinhSachHuy
      ORDER BY gio_truoc_gio_chay
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật chính sách hủy
exports.updateCancelPolicy = async (req, res) => {
  const { id } = req.params;
  const { phi_huy } = req.body;
  
  try {
    await executeQuery(`
      UPDATE ChinhSachHuy SET phi_huy = @phi_huy
      WHERE id_cs_huy = @id
    `, { id, phi_huy });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};