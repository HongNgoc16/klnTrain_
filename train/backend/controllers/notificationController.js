const { executeQuery } = require('../config/db');

// Gửi thông báo đến tất cả người dùng
exports.sendBroadcastNotification = async (req, res) => {
  const { tieu_de, noi_dung, loai, lien_ket } = req.body;
  
  try {
    // Gửi đến tất cả tài khoản hoạt động
    await executeQuery(`
      INSERT INTO ThongBao (id_tai_khoan, tieu_de, noi_dung, loai, lien_ket, thoi_gian_tao)
      SELECT id_tai_khoan, @tieu_de, @noi_dung, @loai, @lien_ket, GETDATE()
      FROM TaiKhoan
      WHERE trang_thai = 'hoat_dong'
    `, { tieu_de, noi_dung, loai: loai || 'he_thong', lien_ket });
    
    res.json({ success: true, message: 'Đã gửi thông báo đến tất cả người dùng' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gửi thông báo đến nhóm người dùng
exports.sendGroupNotification = async (req, res) => {
  const { vai_tro, tieu_de, noi_dung, loai, lien_ket } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO ThongBao (id_tai_khoan, tieu_de, noi_dung, loai, lien_ket, thoi_gian_tao)
      SELECT id_tai_khoan, @tieu_de, @noi_dung, @loai, @lien_ket, GETDATE()
      FROM TaiKhoan
      WHERE vai_tro = @vai_tro AND trang_thai = 'hoat_dong'
    `, { vai_tro, tieu_de, noi_dung, loai: loai || 'he_thong', lien_ket });
    
    res.json({ success: true, message: `Đã gửi thông báo đến nhóm ${vai_tro}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const result = await executeQuery(`
      SELECT id_thong_bao, tieu_de, noi_dung, loai, da_doc, lien_ket, thoi_gian_tao
      FROM ThongBao
      WHERE id_tai_khoan = @id_tai_khoan
      ORDER BY thoi_gian_tao DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, { id_tai_khoan: req.user.id_tai_khoan, offset, limit });
    
    const total = await executeQuery(`
      SELECT COUNT(*) AS total FROM ThongBao WHERE id_tai_khoan = @id_tai_khoan
    `, { id_tai_khoan: req.user.id_tai_khoan });
    
    res.json({
      success: true,
      data: result.recordset,
      pagination: { page, limit, total: total.recordset[0].total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  
  try {
    await executeQuery(`
      UPDATE ThongBao SET da_doc = 1
      WHERE id_thong_bao = @id AND id_tai_khoan = @id_tai_khoan
    `, { id, id_tai_khoan: req.user.id_tai_khoan });
    
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};