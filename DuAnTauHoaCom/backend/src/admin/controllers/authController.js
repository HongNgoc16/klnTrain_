const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ĐĂNG NHẬP
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
  }
  
  try {
    const result = await executeQuery(
      `SELECT id_tai_khoan, email, mat_khau, ho_ten, so_dien_thoai, vai_tro, trang_thai 
       FROM TaiKhoan 
       WHERE email = @email`,
      { email }
    );
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }
    
    const user = result.recordset[0];
    
    // Kiểm tra tài khoản bị khóa
    if (user.trang_thai !== 'hoat_dong') {
      return res.status(401).json({ success: false, message: 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên' });
    }
    
    // Kiểm tra mật khẩu
    const isValid = await bcrypt.compare(password, user.mat_khau);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Tạo JWT token
    const token = jwt.sign(
      { 
        id_tai_khoan: user.id_tai_khoan, 
        email: user.email, 
        vai_tro: user.vai_tro 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Ghi log đăng nhập (tùy chọn)
   // await executeQuery(`
   //   INSERT INTO AuditLog (bang, ma_ban_ghi, hanh_dong, gia_tri_moi, id_tai_khoan, ip_address, user_agent, thoi_gian)
   //   VALUES ('TaiKhoan', @ma_ban_ghi, 'LOGIN', @gia_tri_moi, @id_tai_khoan, @ip, @user_agent, GETDATE())
   // `, {
   //   ma_ban_ghi: user.id_tai_khoan.toString(),
   //   gia_tri_moi: JSON.stringify({ email: user.email, thoi_gian: new Date() }),
   //   id_tai_khoan: user.id_tai_khoan,
   //   ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
   //   user_agent: req.headers['user-agent']
   // });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id_tai_khoan,
        email: user.email,
        name: user.ho_ten,
        phone: user.so_dien_thoai,
        role: user.vai_tro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại sau' });
  }
};

// ĐĂNG KÝ (cho khách hàng mới)
exports.register = async (req, res) => {
  const { email, password, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh } = req.body;
  
  if (!email || !password || !ho_ten) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
  }
  
  try {
    // Kiểm tra email đã tồn tại
    const check = await executeQuery(
      'SELECT id_tai_khoan FROM TaiKhoan WHERE email = @email',
      { email }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await executeQuery(`
      INSERT INTO TaiKhoan (email, mat_khau, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, trang_thai, ngay_tao)
      OUTPUT INSERTED.id_tai_khoan
      VALUES (@email, @mat_khau, @ho_ten, @so_dien_thoai, @ngay_sinh, @gioi_tinh, 'khach_hang', 'hoat_dong', GETDATE())
    `, { email, mat_khau: hashedPassword, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh });
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { id_tai_khoan: result.recordset[0].id_tai_khoan }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LẤY THÔNG TIN PROFILE
exports.getProfile = async (req, res) => {
  const userId = req.user.id_tai_khoan;
  
  try {
    const result = await executeQuery(`
      SELECT id_tai_khoan, email, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, ngay_tao
      FROM TaiKhoan
      WHERE id_tai_khoan = @id
    `, { id: userId });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Lấy danh sách hành khách đi cùng
    const passengers = await executeQuery(`
      SELECT id_hanh_khach, ho_ten, ngay_sinh, cccd, loai_hanh_khach, so_dien_thoai, la_chinh
      FROM HanhKhach
      WHERE id_tai_khoan = @id
      ORDER BY la_chinh DESC
    `, { id: userId });
    
    res.json({
      success: true,
      data: {
        ...result.recordset[0],
        danh_sach_hanh_khach: passengers.recordset
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CẬP NHẬT PROFILE
exports.updateProfile = async (req, res) => {
  const userId = req.user.id_tai_khoan;
  const { ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh } = req.body;
  
  try {
    await executeQuery(`
      UPDATE TaiKhoan
      SET ho_ten = @ho_ten, so_dien_thoai = @so_dien_thoai, ngay_sinh = @ngay_sinh, gioi_tinh = @gioi_tinh
      WHERE id_tai_khoan = @id
    `, { id: userId, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh });
    
    res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ĐỔI MẬT KHẨU
exports.changePassword = async (req, res) => {
  const userId = req.user.id_tai_khoan;
  const { old_password, new_password } = req.body;
  
  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }
  
  try {
    const result = await executeQuery(
      'SELECT mat_khau FROM TaiKhoan WHERE id_tai_khoan = @id',
      { id: userId }
    );
    
    const isValid = await bcrypt.compare(old_password, result.recordset[0].mat_khau);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await executeQuery(
      'UPDATE TaiKhoan SET mat_khau = @mat_khau WHERE id_tai_khoan = @id',
      { id: userId, mat_khau: hashedPassword }
    );
    
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// QUÊN MẬT KHẨU - GỬI EMAIL RESET
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await executeQuery(
      'SELECT id_tai_khoan, ho_ten FROM TaiKhoan WHERE email = @email AND trang_thai = \'hoat_dong\'',
      { email }
    );
    
    if (result.recordset.length === 0) {
      // Vì lý do bảo mật, không tiết lộ email có tồn tại hay không
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu' });
    }
    
    const user = result.recordset[0];
    const resetToken = jwt.sign(
      { id_tai_khoan: user.id_tai_khoan, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // TODO: Gửi email với link reset: `https://yourdomain.com/reset-password?token=${resetToken}`
    
    res.json({ success: true, message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ĐẶT LẠI MẬT KHẨU
exports.resetPassword = async (req, res) => {
  const { token, new_password } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'reset') {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await executeQuery(
      'UPDATE TaiKhoan SET mat_khau = @mat_khau WHERE id_tai_khoan = @id',
      { id: decoded.id_tai_khoan, mat_khau: hashedPassword }
    );
    
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Link đã hết hạn, vui lòng thử lại' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// LÀM MỚI TOKEN
exports.refreshToken = async (req, res) => {
  const userId = req.user.id_tai_khoan;
  
  try {
    const result = await executeQuery(
      'SELECT email, vai_tro FROM TaiKhoan WHERE id_tai_khoan = @id AND trang_thai = \'hoat_dong\'',
      { id: userId }
    );
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị khóa' });
    }
    
    const user = result.recordset[0];
    const newToken = jwt.sign(
      { id_tai_khoan: userId, email: user.email, vai_tro: user.vai_tro },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ĐĂNG XUẤT
exports.logout = async (req, res) => {
  // Với JWT, logout thường được xử lý ở client (xóa token)
  // Có thể ghi log nếu cần
  res.json({ success: true, message: 'Đăng xuất thành công' });
};