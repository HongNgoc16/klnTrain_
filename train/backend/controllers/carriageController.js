const { executeQuery } = require('../config/db');

// Lấy danh sách loại toa
exports.getAllCarriageTypes = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT id_loai_toa, ma_loai_toa, ten_loai_toa, loai_ghe_chinh, so_cho_toi_da
      FROM LoaiToa
      ORDER BY ma_loai_toa
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm loại toa mới
exports.createCarriageType = async (req, res) => {
  const { ma_loai_toa, ten_loai_toa, loai_ghe_chinh, so_cho_toi_da } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO LoaiToa (ma_loai_toa, ten_loai_toa, loai_ghe_chinh, so_cho_toi_da)
      VALUES (@ma_loai_toa, @ten_loai_toa, @loai_ghe_chinh, @so_cho_toi_da)
    `, { ma_loai_toa, ten_loai_toa, loai_ghe_chinh, so_cho_toi_da });
    
    res.status(201).json({ success: true, message: 'Thêm loại toa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách loại ghế
exports.getAllSeatTypes = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT lg.id_loai_ghe, lg.ma_loai_ghe, lg.ten_loai_ghe, lg.he_so_gia, lg.trang_thai,
             lt.ten_loai_toa
      FROM LoaiGhe lg
      JOIN LoaiToa lt ON lt.id_loai_toa = lg.id_loai_toa
      ORDER BY lg.ma_loai_ghe
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm loại ghế mới
exports.createSeatType = async (req, res) => {
  const { ma_loai_ghe, id_loai_toa, ten_loai_ghe, he_so_gia, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO LoaiGhe (ma_loai_ghe, id_loai_toa, ten_loai_ghe, he_so_gia, trang_thai)
      VALUES (@ma_loai_ghe, @id_loai_toa, @ten_loai_ghe, @he_so_gia, @trang_thai)
    `, { ma_loai_ghe, id_loai_toa, ten_loai_ghe, he_so_gia, trang_thai: trang_thai || 'dang_ban' });
    
    res.status(201).json({ success: true, message: 'Thêm loại ghế thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cấu hình ghế trong toa
exports.configureSeats = async (req, res) => {
  const { id_loai_toa, seats } = req.body; // seats: array of {so_ghe_trong_toa, id_loai_ghe, vi_tri, tang, khoang_so, ben}
  
  try {
    for (const seat of seats) {
      await executeQuery(`
        INSERT INTO CauHinhGhe (id_loai_toa, so_ghe_trong_toa, id_loai_ghe, vi_tri, tang, khoang_so, ben)
        VALUES (@id_loai_toa, @so_ghe_trong_toa, @id_loai_ghe, @vi_tri, @tang, @khoang_so, @ben)
      `, {
        id_loai_toa, so_ghe_trong_toa: seat.so_ghe_trong_toa,
        id_loai_ghe: seat.id_loai_ghe, vi_tri: seat.vi_tri,
        tang: seat.tang, khoang_so: seat.khoang_so, ben: seat.ben
      });
    }
    
    res.json({ success: true, message: 'Cấu hình ghế thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};