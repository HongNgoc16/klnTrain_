const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_tai_khoan, email, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao
      FROM TaiKhoan
      ORDER BY ngay_tao DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết một người dùng
exports.getUserDetail = async (req, res) => {
  const { id } = req.params;
  
  try {
    const userResult = await executeQuery(`
      SELECT id_tai_khoan, email, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao
      FROM TaiKhoan
      WHERE id_tai_khoan = @id
    `, { id });
    
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Lấy danh sách hành khách đi cùng
    const passengersResult = await executeQuery(`
      SELECT id_hanh_khach, ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh
      FROM HanhKhach
      WHERE id_tai_khoan = @id
      ORDER BY la_chinh DESC, id_hanh_khach
    `, { id });
    
    res.json({
      success: true,
      data: {
        ...userResult.recordset[0],
        danh_sach_hanh_khach: passengersResult.recordset
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  const { email, password, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro } = req.body;
  
  try {
    // Kiểm tra email đã tồn tại
    const check = await executeQuery(
      'SELECT id_tai_khoan FROM TaiKhoan WHERE email = @email',
      { email }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
    }
    
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    const result = await executeQuery(`
      INSERT INTO TaiKhoan (email, mat_khau, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao)
      OUTPUT INSERTED.id_tai_khoan
      VALUES (@email, @mat_khau, @ho_ten, @so_dien_thoai, @ngay_sinh, @gioi_tinh, @vai_tro, 'hoat_dong', GETDATE())
    `, { email, mat_khau: hashedPassword, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro: vai_tro || 'khach_hang' });
    
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: { id_tai_khoan: result.recordset[0].id_tai_khoan }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro } = req.body;
  
  try {
    await executeQuery(`
      UPDATE TaiKhoan
      SET ho_ten = @ho_ten, so_dien_thoai = @so_dien_thoai,
          ngay_sinh = @ngay_sinh, gioi_tinh = @gioi_tinh, vai_tro = @vai_tro
      WHERE id_tai_khoan = @id
    `, { id, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái tài khoản (khóa/mở)
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { trang_thai } = req.body;
  
  try {
    await executeQuery(
      'UPDATE TaiKhoan SET trang_thai = @trang_thai WHERE id_tai_khoan = @id',
      { id, trang_thai }
    );
    
    res.json({ success: true, message: `Đã ${trang_thai === 'hoat_dong' ? 'mở khóa' : 'khóa'} tài khoản` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra có đơn hàng không
    const check = await executeQuery(
      'SELECT id_don_dat_ve FROM DonDatVe WHERE id_tai_khoan = @id',
      { id }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa người dùng đã có đơn hàng' });
    }
    
    await executeQuery('DELETE FROM TaiKhoan WHERE id_tai_khoan = @id', { id });
    res.json({ success: true, message: 'Xóa tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách hành khách của một tài khoản
exports.getPassengers = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await executeQuery(`
      SELECT id_hanh_khach, ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh
      FROM HanhKhach
      WHERE id_tai_khoan = @id
      ORDER BY la_chinh DESC, id_hanh_khach
    `, { id });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm hành khách mới
exports.addPassenger = async (req, res) => {
  const { id } = req.params;
  const { ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh } = req.body;
  
  try {
    const result = await executeQuery(`
      INSERT INTO HanhKhach (id_tai_khoan, ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh)
      OUTPUT INSERTED.id_hanh_khach
      VALUES (@id_tai_khoan, @ho_ten, @ngay_sinh, @cccd, @loai_hanh_khach, @so_dien_thoai, @la_chinh)
    `, { id_tai_khoan: id, ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh: la_chinh || 0 });
    
    res.status(201).json({
      success: true,
      message: 'Thêm hành khách thành công',
      data: { id_hanh_khach: result.recordset[0].id_hanh_khach }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật hành khách
exports.updatePassenger = async (req, res) => {
  const { id } = req.params;
  const { ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh } = req.body;
  
  try {
    await executeQuery(`
      UPDATE HanhKhach
      SET ho_ten = @ho_ten, ngay_sinh = @ngay_sinh, cccd = @cccd,
          loai_hanh_khach = @loai_hanh_khach, so_dien_thoai = @so_dien_thoai, la_chinh = @la_chinh
      WHERE id_hanh_khach = @id
    `, { id, ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh });
    
    res.json({ success: true, message: 'Cập nhật hành khách thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa hành khách
exports.deletePassenger = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Kiểm tra có vé không
    const check = await executeQuery(
      'SELECT id_ve FROM Ve WHERE id_hanh_khach = @id',
      { id }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa hành khách đã có vé' });
    }
    
    await executeQuery('DELETE FROM HanhKhach WHERE id_hanh_khach = @id', { id });
    res.json({ success: true, message: 'Xóa hành khách thành công' });
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

// Đặt lại mật khẩu người dùng
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(new_password || '123456', 10);
    
    await executeQuery(
      'UPDATE TaiKhoan SET mat_khau = @mat_khau WHERE id_tai_khoan = @id',
      { id, mat_khau: hashedPassword }
    );
    
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};