const ok = (res, data = null, message = 'Thành công', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data })

const created = (res, data = null, message = 'Tạo thành công') =>
  res.status(201).json({ success: true, message, data })

const error = (res, message = 'Lỗi server', statusCode = 500, errors = null) =>
  res.status(statusCode).json({ success: false, message, errors })

const notFound = (res, message = 'Không tìm thấy dữ liệu') =>
  res.status(404).json({ success: false, message })

const badRequest = (res, message = 'Dữ liệu không hợp lệ', errors = null) =>
  res.status(400).json({ success: false, message, errors })

const unauthorized = (res, message = 'Chưa xác thực') =>
  res.status(401).json({ success: false, message })

const forbidden = (res, message = 'Không có quyền truy cập') =>
  res.status(403).json({ success: false, message })

module.exports = { ok, created, error, notFound, badRequest, unauthorized, forbidden }
