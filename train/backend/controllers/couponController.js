const { executeQuery } = require('../config/db');

// Lấy danh sách khuyến mãi
exports.getAllCoupons = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_khuyen_mai, ma_khuyen_mai, mo_ta, loai_giam, gia_tri,
             gia_tri_don_toi_thieu, giam_toi_da, so_luong, da_dung,
             ngay_bat_dau, ngay_het_han, ap_dung_cho
      FROM KhuyenMai
      ORDER BY ngay_het_han DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm khuyến mãi mới
exports.createCoupon = async (req, res) => {
  const { ma_khuyen_mai, mo_ta, loai_giam, gia_tri, gia_tri_don_toi_thieu, giam_toi_da, so_luong, ngay_bat_dau, ngay_het_han, ap_dung_cho } = req.body;
  
  try {
    const check = await executeQuery(
      'SELECT id_khuyen_mai FROM KhuyenMai WHERE ma_khuyen_mai = @ma_khuyen_mai',
      { ma_khuyen_mai }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã khuyến mãi đã tồn tại' });
    }
    
    await executeQuery(`
      INSERT INTO KhuyenMai (ma_khuyen_mai, mo_ta, loai_giam, gia_tri, gia_tri_don_toi_thieu, giam_toi_da, so_luong, da_dung, ngay_bat_dau, ngay_het_han, ap_dung_cho)
      VALUES (@ma_khuyen_mai, @mo_ta, @loai_giam, @gia_tri, @gia_tri_don_toi_thieu, @giam_toi_da, @so_luong, 0, @ngay_bat_dau, @ngay_het_han, @ap_dung_cho)
    `, { ma_khuyen_mai, mo_ta, loai_giam, gia_tri, gia_tri_don_toi_thieu, giam_toi_da, so_luong, ngay_bat_dau, ngay_het_han, ap_dung_cho });
    
    res.status(201).json({ success: true, message: 'Thêm khuyến mãi thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật khuyến mãi
exports.updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { mo_ta, loai_giam, gia_tri, gia_tri_don_toi_thieu, giam_toi_da, so_luong, ngay_bat_dau, ngay_het_han, ap_dung_cho } = req.body;
  
  try {
    await executeQuery(`
      UPDATE KhuyenMai
      SET mo_ta = @mo_ta, loai_giam = @loai_giam, gia_tri = @gia_tri,
          gia_tri_don_toi_thieu = @gia_tri_don_toi_thieu, giam_toi_da = @giam_toi_da,
          so_luong = @so_luong, ngay_bat_dau = @ngay_bat_dau, ngay_het_han = @ngay_het_han, ap_dung_cho = @ap_dung_cho
      WHERE id_khuyen_mai = @id
    `, { id, mo_ta, loai_giam, gia_tri, gia_tri_don_toi_thieu, giam_toi_da, so_luong, ngay_bat_dau, ngay_het_han, ap_dung_cho });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa khuyến mãi
exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;
  
  try {
    await executeQuery('DELETE FROM KhuyenMai WHERE id_khuyen_mai = @id', { id });
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCouponById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await executeQuery(
      `
      SELECT *
      FROM KhuyenMai
      WHERE id_khuyen_mai = @id
      `,
      { id }
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khuyến mãi'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};