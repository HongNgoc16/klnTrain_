const { executeQuery } = require('../config/db');

// Lấy danh sách tàu
exports.getAllTrains = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT t.id_tau, t.so_hieu, t.ten_tau, t.so_toa, t.trang_thai,
             COUNT(DISTINCT cto.id_cau_hinh_toa) AS so_toa_thuc_te
      FROM Tau t
      LEFT JOIN CauHinhToa cto ON cto.id_tau = t.id_tau
      GROUP BY t.id_tau, t.so_hieu, t.ten_tau, t.so_toa, t.trang_thai
      ORDER BY t.so_hieu
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm tàu mới
exports.createTrain = async (req, res) => {
  const { so_hieu, ten_tau, so_toa, trang_thai } = req.body;
  
  try {
    const check = await executeQuery(
      'SELECT id_tau FROM Tau WHERE so_hieu = @so_hieu',
      { so_hieu }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Số hiệu tàu đã tồn tại' });
    }
    
    const result = await executeQuery(`
      INSERT INTO Tau (so_hieu, ten_tau, so_toa, trang_thai)
      OUTPUT INSERTED.id_tau
      VALUES (@so_hieu, @ten_tau, @so_toa, @trang_thai)
    `, { so_hieu, ten_tau, so_toa, trang_thai: trang_thai || 'hoat_dong' });
    
    res.status(201).json({ success: true, data: { id_tau: result.recordset[0].id_tau } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật tàu
exports.updateTrain = async (req, res) => {
  const { id } = req.params;
  const { so_hieu, ten_tau, so_toa, trang_thai } = req.body;
  
  try {
    await executeQuery(`
      UPDATE Tau SET so_hieu = @so_hieu, ten_tau = @ten_tau, so_toa = @so_toa, trang_thai = @trang_thai
      WHERE id_tau = @id
    `, { id, so_hieu, ten_tau, so_toa, trang_thai });
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa tàu
exports.deleteTrain = async (req, res) => {
  const { id } = req.params;
  
  try {
    const check = await executeQuery(
      'SELECT id_tau FROM LichChay WHERE id_tau = @id',
      { id }
    );
    
    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Tàu đang được sử dụng trong lịch trình' });
    }
    
    await executeQuery('DELETE FROM Tau WHERE id_tau = @id', { id });
    res.json({ success: true, message: 'Xóa tàu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết tàu (kèm cấu hình toa)
exports.getTrainDetail = async (req, res) => {
  const { id } = req.params;
  
  try {
    const train = await executeQuery('SELECT * FROM Tau WHERE id_tau = @id', { id });
    
    const carriages = await executeQuery(`
      SELECT cto.id_cau_hinh_toa, cto.so_toa_thu_tu, lt.ma_loai_toa, lt.ten_loai_toa, lt.so_cho_toi_da
      FROM CauHinhToa cto
      JOIN LoaiToa lt ON lt.id_loai_toa = cto.id_loai_toa
      WHERE cto.id_tau = @id
      ORDER BY cto.so_toa_thu_tu
    `, { id });
    
    res.json({
      success: true,
      data: {
        ...train.recordset[0],
        danh_sach_toa: carriages.recordset
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm cấu hình toa cho tàu
exports.addCarriageToTrain = async (req, res) => {
  const { id } = req.params;
  const { so_toa_thu_tu, id_loai_toa } = req.body;
  
  try {
    await executeQuery(`
      INSERT INTO CauHinhToa (id_tau, so_toa_thu_tu, id_loai_toa)
      VALUES (@id_tau, @so_toa_thu_tu, @id_loai_toa)
    `, { id_tau: id, so_toa_thu_tu, id_loai_toa });
    
    res.json({ success: true, message: 'Thêm toa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa cấu hình toa
exports.removeCarriageFromTrain = async (req, res) => {
  const { id, carriageId } = req.params;
  
  try {
    await executeQuery('DELETE FROM CauHinhToa WHERE id_cau_hinh_toa = @id AND id_tau = @id_tau', 
      { id: carriageId, id_tau: id });
    res.json({ success: true, message: 'Xóa toa thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};