const { executeQuery, executeProcedure } = require('../config/db');

// Lấy sơ đồ ghế của một toa
exports.getSeatMap = async (req, res) => {
  const { id_chuyen, so_toa_thu_tu, id_ga_len, id_ga_xuong } = req.query;
  
  try {
    const result = await executeProcedure('sp_GetSoDoGhe', {
      id_chuyen: parseInt(id_chuyen),
      so_toa_thu_tu: parseInt(so_toa_thu_tu),
      id_ga_len: parseInt(id_ga_len),
      id_ga_xuong: parseInt(id_ga_xuong)
    });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách toa của chuyến tàu
exports.getCarriageList = async (req, res) => {
  const { id_chuyen, id_ga_len, id_ga_xuong } = req.query;
  
  try {
    const result = await executeProcedure('sp_GetDanhSachToa', {
      id_chuyen: parseInt(id_chuyen),
      id_ga_len: parseInt(id_ga_len),
      id_ga_xuong: parseInt(id_ga_xuong)
    });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Giữ ghế tạm thời
exports.holdSeat = async (req, res) => {
  const { id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_tai_khoan, session_id } = req.body;
  
  try {
    const result = await executeProcedure('sp_GiuGheTam', {
      id_chuyen: parseInt(id_chuyen),
      so_toa_thu_tu: parseInt(so_toa_thu_tu),
      so_ghe_trong_toa: parseInt(so_ghe_trong_toa),
      id_tai_khoan: id_tai_khoan || null,
      session_id: session_id || null
    });
    
    const recordset = result.recordset[0];
    
    if (recordset.thanh_cong === 1) {
      res.json({
        success: true,
        message: 'Giữ ghế thành công',
        data: { het_han: recordset.het_han }
      });
    } else {
      res.status(409).json({ success: false, message: recordset.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Giải phóng ghế
exports.releaseSeat = async (req, res) => {
  const { id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, session_id } = req.body;
  
  try {
    await executeProcedure('sp_GiaiPhongGhe', {
      id_chuyen: parseInt(id_chuyen),
      so_toa_thu_tu: parseInt(so_toa_thu_tu),
      so_ghe_trong_toa: parseInt(so_ghe_trong_toa),
      session_id: session_id || null
    });
    
    res.json({ success: true, message: 'Đã giải phóng ghế' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Kiểm tra ghế còn trống
exports.checkSeatAvailability = async (req, res) => {
  const { id_chuyen, so_toa_thu_tu, so_ghe_trong_toa } = req.query;
  
  try {
    const result = await executeQuery(`
      SELECT 
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM Ve 
            WHERE id_chuyen = @id_chuyen 
              AND so_toa_thu_tu = @so_toa_thu_tu 
              AND so_ghe_trong_toa = @so_ghe_trong_toa
              AND trang_thai NOT IN ('da_huy', 'da_doi')
          ) THEN 0
          WHEN EXISTS (
            SELECT 1 FROM TamGiuGhe 
            WHERE id_chuyen = @id_chuyen 
              AND so_toa_thu_tu = @so_toa_thu_tu 
              AND so_ghe_trong_toa = @so_ghe_trong_toa
              AND trang_thai = 'dang_giu'
              AND thoi_gian_het_han > GETDATE()
          ) THEN 0
          ELSE 1
        END AS is_available
    `, {
      id_chuyen: parseInt(id_chuyen),
      so_toa_thu_tu: parseInt(so_toa_thu_tu),
      so_ghe_trong_toa: parseInt(so_ghe_trong_toa)
    });
    
    res.json({ success: true, data: { is_available: result.recordset[0].is_available === 1 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy số ghế trống trong toa
exports.getAvailableSeatsCount = async (req, res) => {
  const { id_chuyen, so_toa_thu_tu } = req.query;
  
  try {
    const result = await executeQuery(`
      SELECT dbo.fn_GheTrongCuaToa(@id_chuyen, @so_toa_thu_tu) AS so_ghe_trong
    `, {
      id_chuyen: parseInt(id_chuyen),
      so_toa_thu_tu: parseInt(so_toa_thu_tu)
    });
    
    res.json({ success: true, data: { so_ghe_trong: result.recordset[0].so_ghe_trong } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cấu hình ghế cho loại toa (Admin)
exports.configureSeatsForCarriage = async (req, res) => {
  const { id_loai_toa } = req.params;
  const { seats } = req.body; // Array of seat configurations
  
  try {
    // Xóa cấu hình cũ
    await executeQuery('DELETE FROM CauHinhGhe WHERE id_loai_toa = @id_loai_toa', { id_loai_toa });
    
    // Thêm cấu hình mới
    for (const seat of seats) {
      await executeQuery(`
        INSERT INTO CauHinhGhe (id_loai_toa, so_ghe_trong_toa, id_loai_ghe, vi_tri, tang, khoang_so, ben)
        VALUES (@id_loai_toa, @so_ghe_trong_toa, @id_loai_ghe, @vi_tri, @tang, @khoang_so, @ben)
      `, {
        id_loai_toa: parseInt(id_loai_toa),
        so_ghe_trong_toa: seat.so_ghe_trong_toa,
        id_loai_ghe: seat.id_loai_ghe,
        vi_tri: seat.vi_tri,
        tang: seat.tang,
        khoang_so: seat.khoang_so,
        ben: seat.ben
      });
    }
    
    res.json({ success: true, message: 'Cấu hình ghế thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy cấu hình ghế của loại toa (Admin)
exports.getSeatConfiguration = async (req, res) => {
  const { id_loai_toa } = req.params;
  
  try {
    const result = await executeQuery(`
      SELECT cg.so_ghe_trong_toa, cg.vi_tri, cg.tang, cg.khoang_so, cg.ben,
             lg.ma_loai_ghe, lg.ten_loai_ghe, lg.he_so_gia
      FROM CauHinhGhe cg
      JOIN LoaiGhe lg ON lg.id_loai_ghe = cg.id_loai_ghe
      WHERE cg.id_loai_toa = @id_loai_toa
      ORDER BY cg.so_ghe_trong_toa
    `, { id_loai_toa: parseInt(id_loai_toa) });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};