/**
 * passengerUtils.js — Tiện ích xác định & kiểm tra độ tuổi hành khách
 *
 * Quy tắc đường sắt KLN:
 *   - Trẻ em    : 6 – 9 tuổi (giảm 25%)
 *   - Người lớn : 10 – 59 tuổi
 *   - Người cao tuổi: từ 60 tuổi (giảm 15%)
 *   - Sinh viên : 16 – 40 tuổi (giảm 10%, yêu cầu thẻ SV)
 */

// ─── Khoảng tuổi theo loại hành khách ───────────────────────────────
export const PASSENGER_AGE_RANGE = {
  child:   { min: 6,   max: 9   },
  adult:   { min: 10,  max: 59  },
  elderly: { min: 60,  max: 120 },
  student: { min: 16,  max: 40  },
}

// ─── Thông tin hiển thị ──────────────────────────────────────────────
export const PASSENGER_INFO = {
  adult:   { label: 'Người lớn',     sub: 'Từ 10 – 59 tuổi',  discount: 0,    color: 'bg-blue-100   text-blue-700'   },
  elderly: { label: 'Người cao tuổi',sub: 'Từ 60 tuổi',       discount: 0.15, color: 'bg-purple-100 text-purple-700' },
  student: { label: 'Sinh viên',     sub: 'Thẻ SV hợp lệ',    discount: 0.10, color: 'bg-teal-100   text-teal-700'  },
  child:   { label: 'Trẻ em',        sub: '6 – 9 tuổi',       discount: 0.25, color: 'bg-green-100  text-green-700' },
}

export const getPassengerInfo = (type) => PASSENGER_INFO[type] ?? PASSENGER_INFO.adult

// ─── Tính tuổi từ chuỗi ngày ─────────────────────────────────────────
// Chấp nhận: 'DD/MM/YYYY' hoặc 'YYYY-MM-DD' hoặc Date object
// Trả về: số tuổi (integer) hoặc null nếu không parse được
export const calcAge = (birthDate) => {
  if (!birthDate) return null

  let d, m, y
  if (birthDate instanceof Date) {
    d = birthDate.getDate(); m = birthDate.getMonth() + 1; y = birthDate.getFullYear()
  } else {
    const s = String(birthDate).trim()
    // DD/MM/YYYY
    const dd = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (dd) { d = +dd[1]; m = +dd[2]; y = +dd[3] }
    else {
      // YYYY-MM-DD
      const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (iso) { y = +iso[1]; m = +iso[2]; d = +iso[3] }
      else return null
    }
  }

  if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null

  const today = new Date()
  let age = today.getFullYear() - y
  // Chưa đến sinh nhật năm nay → trừ 1
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--
  return age >= 0 ? age : null
}

// ─── Kiểm tra ngày sinh có khớp với loại hành khách không ────────────
// Trả về: null nếu hợp lệ, chuỗi lỗi nếu không hợp lệ
export const validatePassengerAge = (birthDate, passengerType) => {
  const age = calcAge(birthDate)
  if (age === null) return null // ngày sinh chưa nhập đủ, bỏ qua kiểm tra tuổi

  const range = PASSENGER_AGE_RANGE[passengerType]
  if (!range) return null

  const { label } = PASSENGER_INFO[passengerType] ?? {}

  if (age < range.min) {
    if (passengerType === 'child')
      return `Trẻ em phải từ ${range.min} tuổi. Trẻ dưới 6 tuổi đi miễn phí.`
    if (passengerType === 'adult')
      return `Người lớn phải từ ${range.min} tuổi trở lên.`
    if (passengerType === 'elderly')
      return `Người cao tuổi phải từ ${range.min} tuổi trở lên (hiện ${age} tuổi).`
    if (passengerType === 'student')
      return `Sinh viên phải từ ${range.min} tuổi trở lên (hiện ${age} tuổi).`
  }

  if (age > range.max) {
    if (passengerType === 'child')
      return `Trẻ em phải từ ${range.min}–${range.max} tuổi (hiện ${age} tuổi). Từ ${range.max + 1} tuổi dùng loại Người lớn.`
    if (passengerType === 'adult')
      return `Người lớn từ ${range.min}–${range.max} tuổi (hiện ${age} tuổi). Từ ${range.min_elderly ?? 60} tuổi dùng loại Người cao tuổi.`
    if (passengerType === 'student')
      return `Sinh viên tối đa ${range.max} tuổi (hiện ${age} tuổi).`
  }

  return null // hợp lệ
}

// ─── Tự động gợi ý loại hành khách từ tuổi ──────────────────────────
// Trả về: 'child' | 'adult' | 'elderly'
export const inferPassengerType = (birthDate) => {
  const age = calcAge(birthDate)
  if (age === null) return 'adult'
  if (age < 6)   return 'adult'  // dưới 6: đi miễn phí, không cần vé
  if (age <= 9)  return 'child'
  if (age <= 59) return 'adult'
  return 'elderly'
}

// ─── Map loai_hanh_khach DB → passenger type UI ──────────────────────
// DB values: 'nguoi_lon' | 'tre_em' | 'nguoi_cao_tuoi' | 'sinh_vien'
export const mapLoaiHKToType = (loaiHK) => {
  if (loaiHK === 'tre_em')         return 'child'
  if (loaiHK === 'nguoi_cao_tuoi') return 'elderly'
  if (loaiHK === 'sinh_vien')      return 'student'
  return 'adult'
}

// ─── Map passenger type UI → loai_hanh_khach DB ──────────────────────
export const mapTypeToLoaiHK = (type) => {
  if (type === 'child')   return 'tre_em'
  if (type === 'elderly') return 'nguoi_cao_tuoi'
  if (type === 'student') return 'sinh_vien'
  return 'nguoi_lon'
}
