const router = require('express').Router()
const C = require('../controllers/DieuPhoiController')
const { authenticate } = require('../middleware/auth')

// Middleware: yêu cầu đăng nhập + là nhân viên hoặc quản trị
const requireStaff = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' })
  const allowed = ['quan_tri', 'nhan_vien', 'dieu_phoi']
  if (!allowed.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Không có quyền điều phối viên' })
  next()
}

router.use(authenticate, requireStaff)

// ─── Dashboard ───────────────────────────────────────────────────
router.get('/dashboard', C.getDashboard)

// ─── Metadata ────────────────────────────────────────────────────
router.get('/tau',        C.getTauList)
router.get('/ga',         C.getGaList)
router.get('/loai-toa',   C.getLoaiToaList)

// ─── Lịch chạy ───────────────────────────────────────────────────
router.get('/lich-chay',      C.getLichChayList)
router.post('/lich-chay',     C.createLichChay)
router.put('/lich-chay/:id',  C.updateLichChay)
router.post('/sinh-chuyen',   C.sinhChuyenTau)

// ─── Chuyến tàu ──────────────────────────────────────────────────
router.get('/chuyen-tau',                    C.getChuyenTauList)
router.get('/chuyen-tau/:id',                C.getChuyenTauDetail)
router.put('/chuyen-tau/:id/trang-thai',     C.updateTrangThai)
router.post('/chuyen-tau/:id/su-kien',       C.logSuKien)

// ─── Toa chuyến ──────────────────────────────────────────────────
router.post('/chuyen-tau/:id/toa',           C.addToaChuyen)
router.put('/chuyen-tau/:id/sap-xep-toa',   C.reorderToa)
router.put('/toa/:toaId',                    C.updateToaChuyen)
router.delete('/toa/:toaId',                 C.removeToaChuyen)

module.exports = router
