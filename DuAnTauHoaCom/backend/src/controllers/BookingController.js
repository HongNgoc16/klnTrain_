const BookingService = require('../services/BookingService')
const BookingRepo   = require('../repositories/BookingRepository')
const { ok, created, badRequest, notFound } = require('../utils/response')
const {
  Ve, HanhKhach, ChuyenTau, LichChay, Tau, GaTau,
} = require('../models')

// POST /api/bookings/hold-seats — giữ ghế tạm trước khi điền form
const holdSeats = async (req, res, next) => {
  try {
    const { trips } = req.body
    if (!trips?.length) return badRequest(res, 'Thiếu danh sách chuyến (trips)')
    const result = await BookingService.holdSeatsForCheckout({ trips })
    ok(res, result, 'Giữ ghế thành công')
  } catch (err) { next(err) }
}

const createBooking = async (req, res, next) => {
  try {
    const { trips, passengers, contactInfo, maKhuyenMai } = req.body
    if (!trips?.length || !passengers?.length || !contactInfo)
      return badRequest(res, 'Thiếu thông tin đặt vé')

    const idTaiKhoan = req.user?.id || null
    const result = await BookingService.createBooking({ trips, passengers, contactInfo, idTaiKhoan, maKhuyenMai })
    created(res, {
      maDon:         result.maDon,
      maDatCho:      result.maDatCho,
      idDon:         result.don.id_don_dat_ve,
      tongThanhToan: result.tongThanhToan,
      tienGiam:      result.tienGiam,
    }, 'Đặt vé thành công')
  } catch (err) { next(err) }
}

const lookupBooking = async (req, res, next) => {
  try {
    const { maDatCho, email, phone } = req.body
    if (!maDatCho) return badRequest(res, 'Vui lòng nhập mã đặt chỗ')

    const don = await BookingService.lookupBooking(maDatCho, email, phone)
    if (!don) return notFound(res, 'Không tìm thấy đơn đặt vé hoặc thông tin không khớp')

    // Fallback cho đơn cũ: Sequelize không tự join Ves → query Ve trực tiếp
    if (!don.Ves || don.Ves.length === 0) {
      const vesDirect = await Ve.findAll({
        where: { id_don_dat_ve: don.id_don_dat_ve },
        include: [
          { model: HanhKhach },
          {
            model: ChuyenTau,
            include: [{
              model: LichChay,
              include: [
                Tau,
                { model: GaTau, as: 'GaDi' },
                { model: GaTau, as: 'GaDen' },
              ],
            }],
          },
          { model: GaTau, as: 'GaLen' },
          { model: GaTau, as: 'GaXuong' },
        ],
      })
      don.Ves = vesDirect
    }

    ok(res, BookingService.formatDon(don))
  } catch (err) { next(err) }
}

const getBookingHistory = async (req, res, next) => {
  try {
    const dons = await BookingService.getBookingHistory(req.user.id)

    // Fallback đơn cũ: nếu Ves rỗng, query Ve trực tiếp theo id_don_dat_ve
    for (const don of dons) {
      if (!don.Ves || don.Ves.length === 0) {
        don.Ves = await Ve.findAll({
          where: { id_don_dat_ve: don.id_don_dat_ve },
          include: [
            { model: HanhKhach },
            {
              model: ChuyenTau,
              include: [{
                model: LichChay,
                include: [Tau, { model: GaTau, as: 'GaDi' }, { model: GaTau, as: 'GaDen' }],
              }],
            },
            { model: GaTau, as: 'GaLen' },
            { model: GaTau, as: 'GaXuong' },
          ],
        })
      }
    }

    ok(res, dons.map(BookingService.formatDon))
  } catch (err) { next(err) }
}

const getBookingByCode = async (req, res, next) => {
  try {
    const { maDatCho } = req.params
    const don = await BookingRepo.findByMaDatCho(maDatCho)
    if (!don) return notFound(res, 'Không tìm thấy đơn đặt vé')
    ok(res, BookingService.formatDon(don))
  } catch (err) { next(err) }
}

// POST /api/bookings/release-hold — giải phóng ghế khi thoát form checkout
const releaseHold = async (req, res, next) => {
  try {
    const { sessionId } = req.body
    if (!sessionId) return badRequest(res, 'Thiếu sessionId')
    await BookingRepo.releaseHoldBySession(sessionId)
    ok(res, null, 'Giải phóng ghế thành công')
  } catch (err) { next(err) }
}

module.exports = { holdSeats, createBooking, lookupBooking, getBookingHistory, getBookingByCode, releaseHold }
