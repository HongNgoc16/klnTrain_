import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCalendar, FiSearch, FiAlertTriangle, FiClock, FiX, FiCheckCircle, FiXCircle, FiLoader, FiInfo } from 'react-icons/fi'
import { FaTrain } from 'react-icons/fa'
import { getChuyenList, getTauList, sinhChuyen, getLichChay, updateTrangThai, logSuKien } from '../api/dieuphoi'
import StatusBadge from '../components/StatusBadge'

// Dùng giờ VN (UTC+7) để tính ngày hôm nay — tránh lệch ngày giữa UTC và VN
const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

const pTime = (t) => {
  if (!t) return '--:--'
  const s = String(t)
  const m = s.match(/T(\d{2}):(\d{2})/)
  if (m) return `${m[1]}:${m[2]}`
  if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5)
  return '--:--'
}

// Chuyển YYYY-MM-DD (hoặc ISO string) → dd/mm/yyyy
const fmtDate = (d) => {
  if (!d) return '--'
  const s = String(d).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return String(d)
  return `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`
}

const TRANG_THAI_OPT = [
  { v: '',           l: 'Tất cả trạng thái' },
  { v: 'dung_gio',   l: 'Đúng giờ'          },
  { v: 'sap_den',    l: 'Sắp đến'           },
  { v: 'dieu_chinh', l: 'Điều chỉnh'        },
  { v: 'da_chay',    l: 'Đã chạy'           },
  { v: 'huy',        l: 'Đã hủy'            },
]

export default function QuanLyChuyen() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ ngay: today, ngayDen: today, trangThai: '', idTau: '', page: 1 })
  const [data, setData]     = useState(null)
  const [tauList, setTauList] = useState([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Sinh chuyến modal
  const [showSinh, setShowSinh] = useState(false)
  const [sinhForm, setSinhForm] = useState({ idLichChay: '', tuNgay: today, denNgay: today })
  const [lichList, setLichList] = useState([])
  const [sinhLoading, setSinhLoading] = useState(false)
  const [sinhMsg, setSinhMsg] = useState({ text: '', type: '' })

  // Điều chỉnh lịch (delay) modal
  const [dieuChinhModal, setDieuChinhModal] = useState({ open: false, idChuyen: null, maTau: '' })
  const [dieuChinhForm, setDieuChinhForm] = useState({ delayPhut: '', moTa: '' })
  const [dieuChinhLoading, setDieuChinhLoading] = useState(false)
  const [dieuChinhMsg, setDieuChinhMsg] = useState({ text: '', type: '' })

  const loadData = useCallback(() => {
    setLoading(true); setApiError('')
    getChuyenList(filters)
      .then(r => { setData(r.data || r) })
      .catch(e => { setApiError(e.message || 'Lỗi tải dữ liệu'); setData(null) })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { getTauList().then(r => { const d = r.data || r; setTauList(Array.isArray(d) ? d : []) }).catch(() => {}) }, [])

  const openSinh = () => {
    setShowSinh(true); setSinhMsg({ text: '', type: '' })
    getLichChay().then(r => { const d = r.data || r; setLichList(Array.isArray(d) ? d : []) }).catch(() => {})
  }

  const handleSinh = async () => {
    if (!sinhForm.idLichChay) return
    setSinhLoading(true); setSinhMsg({ text: '', type: '' })
    try {
      const res = await sinhChuyen(sinhForm)
      const d = res.data || res
      setSinhMsg({ text: `Tạo ${d.created} chuyến, bỏ qua ${d.skipped} (đã có)`, type: 'success' })
      loadData()
    } catch (e) { setSinhMsg({ text: e.message, type: 'error' }) }
    finally { setSinhLoading(false) }
  }

  const quickStatus = async (id, st) => {
    const note = st === 'huy' ? window.prompt('Lý do hủy chuyến?') : ''
    if (st === 'huy' && note === null) return
    try { await updateTrangThai(id, st, note || ''); loadData() } catch (e) { alert(e.message) }
  }

  const openDieuChinh = (c) => {
    setDieuChinhModal({ open: true, idChuyen: c.idChuyen, maTau: c.tau?.so_hieu || '' })
    setDieuChinhForm({ delayPhut: '', moTa: '' })
    setDieuChinhMsg({ text: '', type: '' })
  }

  const handleDieuChinh = async () => {
    if (!dieuChinhForm.delayPhut || parseInt(dieuChinhForm.delayPhut) <= 0) {
      setDieuChinhMsg({ text: 'Vui lòng nhập số phút trễ hợp lệ', type: 'error' })
      return
    }
    setDieuChinhLoading(true); setDieuChinhMsg({ text: '', type: '' })
    try {
      await logSuKien(dieuChinhModal.idChuyen, {
        loaiSuKien: 'delay',
        delayPhut: parseInt(dieuChinhForm.delayPhut),
        moTa: dieuChinhForm.moTa || `Chuyến trễ ${dieuChinhForm.delayPhut} phút`,
      })
      setDieuChinhMsg({ text: `Đã ghi nhận trễ ${dieuChinhForm.delayPhut} phút. Trạng thái chuyến chuyển sang "Điều chỉnh".`, type: 'success' })
      setTimeout(() => { setDieuChinhModal({ open: false, idChuyen: null, maTau: '' }); loadData() }, 2000)
    } catch (e) {
      setDieuChinhMsg({ text: e.message || 'Lỗi ghi nhận điều chỉnh', type: 'error' })
    } finally { setDieuChinhLoading(false) }
  }

  const f = filters
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20) || 1

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/dispatcher')} className="hover:text-[#8C1D19] flex items-center gap-1">← Tổng quan</button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Quản lý Chuyến Tàu</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaTrain className="text-[#8C1D19]" /> Quản lý Chuyến Tàu</h1>
          <p className="text-gray-500 text-sm mt-0.5">Tìm kiếm, theo dõi và điều phối các chuyến tàu</p>
        </div>
        <button onClick={openSinh} className="flex items-center gap-2 bg-[#8C1D19] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b1411] transition-colors">
          <FiCalendar /> Sinh chuyến tàu
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
          <input type="date" value={f.ngay} onChange={e => setFilters(p => ({...p, ngay: e.target.value, page: 1}))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
          <input type="date" value={f.ngayDen} onChange={e => setFilters(p => ({...p, ngayDen: e.target.value, page: 1}))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tàu</label>
          <select value={f.idTau} onChange={e => setFilters(p => ({...p, idTau: e.target.value, page: 1}))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none min-w-[140px]">
            <option value="">Tất cả tàu</option>
            {tauList.map(t => <option key={t.id_tau} value={t.id_tau}>{t.so_hieu} — {t.ten_tau}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
          <select value={f.trangThai} onChange={e => setFilters(p => ({...p, trangThai: e.target.value, page: 1}))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none min-w-[160px]">
            {TRANG_THAI_OPT.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <button onClick={loadData} className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 flex items-center gap-2">
          <FiSearch /> Tìm kiếm
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
          <FiAlertTriangle className="shrink-0" /> Lỗi tải dữ liệu: {apiError}
        </div>
      )}

      {/* Bảng danh sách */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Tổng: {total} chuyến</span>
          {loading && <span className="text-xs text-[#8C1D19] animate-pulse">Đang tải...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Ngày chạy','Tàu','Tuyến đường','Giờ khởi hành','Vé bán','Trạng thái','Sự kiện gần nhất','Thao tác'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && (data?.items || []).length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
              )}
              {(data?.items || []).map(c => (
                <tr key={c.idChuyen} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-sm text-gray-600">{fmtDate(c.ngayChay)}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[#8C1D19] bg-[#8C1D19]/10 px-2 py-0.5 rounded-lg">{c.tau?.so_hieu}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-gray-800">{c.gaDi?.ten_ga}</p>
                    <p className="text-xs text-gray-400">→ {c.gaDen?.ten_ga}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold">{pTime(c.gioKhoiHanh)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-semibold ${c.vesBan > 0 ? 'text-green-600' : 'text-gray-400'}`}>{c.vesBan}</span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={c.trangThai} /></td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {c.suKienMoiNhat
                      ? <span>{c.suKienMoiNhat.loai_su_kien}{c.suKienMoiNhat.delay_phut ? ` +${c.suKienMoiNhat.delay_phut}p` : ''}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => navigate(`/dispatcher/chuyen-tau/${c.idChuyen}`)}
                        className="px-2.5 py-1 bg-[#8C1D19]/10 text-[#8C1D19] rounded-lg text-xs font-medium hover:bg-[#8C1D19]/20">
                        Chi tiết
                      </button>
                      {/* Chuyến dừng giờ (chưa xuất phát): Điều chỉnh lịch + Hủy */}
                      {c.trangThai === 'dung_gio' && (
                        <>
                          <button onClick={() => openDieuChinh(c)}
                            className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 flex items-center gap-1">
                            <FiClock /> Điều chỉnh
                          </button>
                          <button onClick={() => quickStatus(c.idChuyen, 'huy')}
                            className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                            <FiX /> Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">Trang {f.page}/{totalPages}</span>
          <div className="flex gap-1.5">
            <button disabled={f.page <= 1} onClick={() => setFilters(p => ({...p, page: p.page - 1}))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">‹ Trước</button>
            <button disabled={f.page >= totalPages} onClick={() => setFilters(p => ({...p, page: p.page + 1}))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Sau ›</button>
          </div>
        </div>
      </div>

      {/* Modal sinh chuyến */}
      {showSinh && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FiCalendar /> Sinh chuyến từ lịch chạy</h3>
              <p className="text-sm text-gray-500 mt-0.5">Tạo hàng loạt chuyến tàu theo khoảng ngày</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lịch chạy</label>
                <select value={sinhForm.idLichChay} onChange={e => setSinhForm(p => ({...p, idLichChay: e.target.value}))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none">
                  <option value="">-- Chọn lịch chạy --</option>
                  {lichList.map(l => (
                    <option key={l.id_lich_chay} value={l.id_lich_chay}>
                      {l.Tau?.so_hieu} | {l.GaDi?.ten_ga} → {l.GaDen?.ten_ga} lúc {pTime(l.gio_khoi_hanh)}
                    </option>
                  ))}
                </select>
              </div>
              {[['tuNgay','Từ ngày'],['denNgay','Đến ngày']].map(([k, l]) => (
                <div key={k}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{l}</label>
                  <input type="date" value={sinhForm[k]} onChange={e => setSinhForm(p => ({...p, [k]: e.target.value}))}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none" />
                </div>
              ))}
              {sinhMsg.text && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${sinhMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {sinhMsg.type === 'success' ? <FiCheckCircle className="shrink-0" /> : <FiXCircle className="shrink-0" />}
                  {sinhMsg.text}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={handleSinh} disabled={!sinhForm.idLichChay || sinhLoading}
                className="flex-1 bg-[#8C1D19] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#6b1411] disabled:opacity-50 flex items-center justify-center gap-2">
                {sinhLoading ? <><FiLoader className="animate-spin" /> Đang sinh...</> : <><FiCalendar /> Sinh chuyến</>}
              </button>
              <button onClick={() => { setShowSinh(false); setSinhMsg({ text: '', type: '' }) }}
                className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal điều chỉnh lịch (trễ giờ) */}
      {dieuChinhModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FiClock /> Điều chỉnh lịch chạy</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Tàu <span className="font-semibold text-[#8C1D19]">{dieuChinhModal.maTau}</span> — ghi nhận chậm giờ vào lịch thực tế
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số phút trễ <span className="text-red-500">*</span></label>
                <input type="number" min={1} max={600} value={dieuChinhForm.delayPhut}
                  onChange={e => setDieuChinhForm(p => ({...p, delayPhut: e.target.value}))}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-orange-400 focus:ring-0 outline-none"
                  placeholder="Ví dụ: 15" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lý do / Ghi chú</label>
                <textarea value={dieuChinhForm.moTa} onChange={e => setDieuChinhForm(p => ({...p, moTa: e.target.value}))}
                  rows={3} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-orange-400 focus:ring-0 outline-none resize-none"
                  placeholder="Nguyên nhân chậm giờ..." />
              </div>
              {dieuChinhMsg.text && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${dieuChinhMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {dieuChinhMsg.type === 'success' ? <FiCheckCircle className="shrink-0" /> : <FiXCircle className="shrink-0" />}
                  {dieuChinhMsg.text}
                </div>
              )}
              <p className="text-xs text-gray-400 flex items-start gap-1.5">
                <FiInfo className="shrink-0 mt-0.5" /> Hệ thống sẽ cập nhật lịch trình thực tế (LichTrinhThucTe) và chuyển trạng thái chuyến sang "Điều chỉnh".
              </p>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={handleDieuChinh} disabled={!dieuChinhForm.delayPhut || dieuChinhLoading}
                className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {dieuChinhLoading ? <><FiLoader className="animate-spin" /> Đang ghi nhận...</> : <><FiClock /> Xác nhận điều chỉnh</>}
              </button>
              <button onClick={() => setDieuChinhModal({ open: false, idChuyen: null, maTau: '' })}
                className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
