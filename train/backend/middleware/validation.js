const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Validation rules
const stationValidation = [
  body('ma_ga_viet_tat').notEmpty().withMessage('Mã ga không được để trống').isLength({ max: 10 }),
  body('ten_ga').notEmpty().withMessage('Tên ga không được để trống'),
  body('thu_tu_tuyen').isInt({ min: 1 }).withMessage('Thứ tự tuyến không hợp lệ'),
  body('do_uu_tien').isInt({ min: 1, max: 5 }).withMessage('Độ ưu tiên từ 1-5'),
  validate
];

const trainValidation = [
  body('so_hieu').notEmpty().withMessage('Số hiệu tàu không được để trống'),
  body('so_toa').isInt({ min: 1, max: 20 }).withMessage('Số toa từ 1-20'),
  validate
];

module.exports = { stationValidation, trainValidation };