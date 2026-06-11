const { executeQuery } = require('../config/db');

exports.getAllCustomers = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT tk.id_tai_khoan, tk.ho_ten, tk.email, tk.so_dien_thoai, tk.ngay_sinh, tk.gioi_tinh, tk.trang_thai, tk.ngay_tao,
             (SELECT COUNT(*) FROM Ve v JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve WHERE d.id_tai_khoan = tk.id_tai_khoan) AS tong_ve,
             (SELECT ISNULL(SUM(v.gia_ve), 0) FROM Ve v JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve WHERE d.id_tai_khoan = tk.id_tai_khoan) AS tong_tien
      FROM TaiKhoan tk
      WHERE tk.vai_tro = 'khach_hang'
      ORDER BY tk.ngay_tao DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerTickets = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery(`
      SELECT v.id_ve, t.so_hieu AS chuyen_tau, gd.ten_ga AS ga_len, gc.ten_ga AS ga_xuong, ct.ngay_chay, v.gia_ve, v.trang_thai
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
      JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
      JOIN Tau t ON t.id_tau = lc.id_tau
      JOIN GaTau gd ON gd.id_ga = v.id_ga_len
      JOIN GaTau gc ON gc.id_ga = v.id_ga_xuong
      WHERE d.id_tai_khoan = @id
      ORDER BY ct.ngay_chay DESC
    `, { id });
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, trang_thai } = req.body;
  try {
    await executeQuery(`
      UPDATE TaiKhoan SET ho_ten = @ho_ten, so_dien_thoai = @so_dien_thoai, ngay_sinh = @ngay_sinh, gioi_tinh = @gioi_tinh, trang_thai = @trang_thai
      WHERE id_tai_khoan = @id
    `, { id, ho_ten, so_dien_thoai, ngay_sinh, gioi_tinh, trang_thai });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery('DELETE FROM TaiKhoan WHERE id_tai_khoan = @id', { id });
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};