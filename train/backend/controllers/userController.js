const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng nội bộ (quan_tri và nhan_vien)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_tai_khoan, email, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao
      FROM TaiKhoan
      WHERE vai_tro IN ('quan_tri', 'nhan_vien')
      ORDER BY ngay_tao DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy người dùng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết người dùng
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery(`
      SELECT id_tai_khoan, email, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao
      FROM TaiKhoan
      WHERE id_tai_khoan = @id AND vai_tro IN ('quan_tri', 'nhan_vien')
    `, { id });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm người dùng mới (chỉ quan_tri hoặc nhan_vien)
exports.createUser = async (req, res) => {
  const { email, password, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro } = req.body;
  
  // Chỉ cho phép tạo tài khoản quan_tri hoặc nhan_vien
  if (vai_tro !== 'quan_tri' && vai_tro !== 'nhan_vien') {
    return res.status(400).json({ success: false, message: 'Chỉ được tạo tài khoản quản trị hoặc nhân viên' });
  }
  
  try {
    const check = await executeQuery(
      'SELECT id_tai_khoan FROM TaiKhoan WHERE email = @email',
      { email }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }
    
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    const result = await executeQuery(`
      INSERT INTO TaiKhoan (email, mat_khau, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao)
      OUTPUT INSERTED.id_tai_khoan
      VALUES (@email, @mat_khau, @ho_ten, @so_dien_thoai, @ngay_sinh, @gioi_tinh, @vai_tro, 'hoat_dong', GETDATE())
    `, { email, mat_khau: hashedPassword, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro });
    
    res.status(201).json({ success: true, message: 'Thêm người dùng thành công', data: { id_tai_khoan: result.recordset[0].id_tai_khoan } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro } = req.body;
  
  try {
    await executeQuery(`
      UPDATE TaiKhoan 
      SET ho_ten = @ho_ten, so_dien_thoai = @so_dien_thoai, 
          ngay_sinh = @ngay_sinh, gioi_tinh = @gioi_tinh, vai_tro = @vai_tro
      WHERE id_tai_khoan = @id AND vai_tro IN ('quan_tri', 'nhan_vien')
    `, { id, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái (khóa/mở khóa)
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { trang_thai } = req.body;
  
  try {
    await executeQuery(`
      UPDATE TaiKhoan 
      SET trang_thai = @trang_thai
      WHERE id_tai_khoan = @id AND vai_tro IN ('quan_tri', 'nhan_vien')
    `, { id, trang_thai });
    
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  try {
    await executeQuery(`
      UPDATE TaiKhoan 
      SET mat_khau = @mat_khau
      WHERE id_tai_khoan = @id AND vai_tro IN ('quan_tri', 'nhan_vien')
    `, { id, mat_khau: hashedPassword });
    
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    await executeQuery(`
      DELETE FROM TaiKhoan 
      WHERE id_tai_khoan = @id AND vai_tro IN ('quan_tri', 'nhan_vien')
    `, { id });
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy audit logs
exports.getAuditLogs = async (req, res) => {
  const { bang, tu_ngay, den_ngay, limit = 100 } = req.query;
  
  try {
    let query = `
      SELECT id_log, bang, ma_ban_ghi, hanh_dong, gia_tri_cu, gia_tri_moi,
             tk.ho_ten AS nguoi_thuc_hien, ip_address, user_agent, thoi_gian
      FROM AuditLog al
      LEFT JOIN TaiKhoan tk ON tk.id_tai_khoan = al.id_tai_khoan
      WHERE 1=1
    `;
    const params = {};
    
    if (bang) {
      query += ` AND al.bang = @bang`;
      params.bang = bang;
    }
    if (tu_ngay) {
      query += ` AND al.thoi_gian >= @tu_ngay`;
      params.tu_ngay = tu_ngay;
    }
    if (den_ngay) {
      query += ` AND al.thoi_gian <= @den_ngay`;
      params.den_ngay = den_ngay;
    }
    
    query += ` ORDER BY al.thoi_gian DESC OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
    params.limit = parseInt(limit);
    
    const result = await executeQuery(query, params);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};