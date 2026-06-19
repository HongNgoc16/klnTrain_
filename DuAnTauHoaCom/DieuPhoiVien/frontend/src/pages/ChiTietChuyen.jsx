import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiClock, FiXCircle, FiTool, FiInfo, FiAlertTriangle, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiLoader, FiBox, FiBell, FiClipboard } from 'react-icons/fi'
import { FaTrain, FaTicketAlt } from 'react-icons/fa'
import {
  getChuyenDetail, logSuKien,
  addToa, updateToa, removeToa,
  getLoaiToaList,
} from '../api/dieuphoi'
import StatusBadge from '../components/StatusBadge'

const pTime = t => {
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

const SU_KIEN = [
  { v: 'delay',       l: 'Chậm giờ',          icon: FiClock     },
  { v: 'cancel',      l: 'Hủy chuyến',        icon: FiXCircle   },
  { v: 'maintenance', l: 'Bảo trì kỹ thuật',  icon: FiTool      },
  { v: 'info',        l: 'Thông báo chung',   icon: FiInfo      },
]
const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
      <div className="px-6 py-5 border-b shrink-0">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t flex gap-3 shrink-0">{footer}</div>}
    </div>
  </div>
)

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none"

const seatColor = (avail, total) => {
  if (avail <= 0) return 'text-red-500'
  if (total > 0 && avail / total < 0.3) return 'text-orange-500'
  return 'text-green-600'
}

export default function ChiTietChuyen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaiToaList, setLoaiToaList] = useState([])
  const [tab, setTab] = useState('toa')
  const [msg, setMsg] = useState({ text: '', type: '' })

  // Modals
  const [modal, setModal] = useState(null)
  const [eventForm, setEventForm] = useState({ loaiSuKien: 'delay', moTa: '', delayPhut: '', idGaAnhHuong: '' })
  const [toaForm, setToaForm] = useState({ soToaThuTu: '', idLoaiToa: '', soGheToidDa: '' })
  const [editingToa, setEditingToa] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getChuyenDetail(id).then(r => setData(r.data || r)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])
  useEffect(() => {
    getLoaiToaList().then(r => { const d = r.data || r; setLoaiToaList(Array.isArray(d) ? d : []) }).catch(() => {})
  }, [])

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text: '', type: '' }), 4000) }
  const wrap = async (fn, successMsg) => {
    setSaving(true)
    try {
      const res = await fn()
      load(); setModal(null)
      // Ưu tiên message từ server (vd: swap), fallback sang successMsg tĩnh
      showMsg(res?.message || successMsg)
    }
    catch (e) { showMsg(e.message, 'error') }
    finally { setSaving(false) }
  }

  const doEvent  = () => wrap(() => logSuKien(id, { loaiSuKien: eventForm.loaiSuKien, moTa: eventForm.moTa, delayPhut: eventForm.delayPhut || undefined, idGaAnhHuong: eventForm.idGaAnhHuong || undefined }), 'Ghi nhận sự kiện thành công')
  const doAddToa = () => wrap(() => addToa(id, { soToaThuTu: parseInt(toaForm.soToaThuTu), idLoaiToa: parseInt(toaForm.idLoaiToa), soGheToidDa: toaForm.soGheToidDa ? parseInt(toaForm.soGheToidDa) : undefined }), 'Thêm toa thành công')
  const doEditToa= () => wrap(() => updateToa(editingToa.idToaChuyen, { soToaThuTu: parseInt(toaForm.soToaThuTu), idLoaiToa: parseInt(toaForm.idLoaiToa), soGheToidDa: toaForm.soGheToidDa ? parseInt(toaForm.soGheToidDa) : undefined, idChuyen: id }), 'Cập nhật toa thành công')
  const doRemove = (t) => { if (!window.confirm(`Xóa toa ${t.soToaThuTu}?`)) return; wrap(() => removeToa(t.idToaChuyen), 'Xóa toa thành công') }

  const openAddToa  = () => { setToaForm({ soToaThuTu: String((data?.toaList?.length || 0) + 1), idLoaiToa: '', soGheToidDa: '' }); setModal('addToa') }
  const openEditToa = (t) => { setEditingToa(t); setToaForm({ soToaThuTu: String(t.soToaThuTu), idLoaiToa: String(t.idLoaiToa), soGheToidDa: String(t.soGheToidDa || '') }); setModal('editToa') }
  const openEvent   = () => { setEventForm({ loaiSuKien: 'delay', moTa: '', delayPhut: '', idGaAnhHuong: '' }); setModal('event') }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Đang tải...</div>
  if (!data)   return <div className="p-8 text-red-500">Không tải được dữ liệu</div>

  const lc = data.lichChay

  // Chuyến đã có vé đặt hoặc đã chạy → không cho điều chỉnh cấu hình toa
  const toaReadOnly = (data.tongVeBan || 0) > 0 || data.trangThai === 'da_chay' || data.trangThai === 'huy'
  // Chuyến đã chạy → không thể ghi nhận thêm sự kiện điều phối
  const daChay = data.trangThai === 'da_chay'

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <button onClick={() => navigate('/dispatcher/chuyen-tau')} className="hover:text-[#8C1D19]">Quản lý Chuyến</button>
          <span>/</span>
          <span className="text-gray-700 font-medium">Chi tiết chuyến #{id}</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaTrain className="text-[#8C1D19]" /> {lc?.Tau?.so_hieu} — {fmtDate(data.ngayChay)}
              </h1>
              <StatusBadge status={data.trangThai} className="text-sm" />
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {lc?.GaDi?.ten_ga} → {lc?.GaDen?.ten_ga}
              <span className="mx-2">|</span>
              Khởi hành {pTime(lc?.gio_khoi_hanh)} — Dự kiến đến {pTime(lc?.gio_du_kien_den)}
            </p>
            {data.ghiChu && <p className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded-lg w-fit">{data.ghiChu}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={openEvent} disabled={daChay}
              title={daChay ? 'Chuyến đã chạy — không thể ghi nhận sự kiện' : undefined}
              className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-500">
              <FiClipboard /> Ghi sự kiện
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {msg.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg.type === 'error' ? <FiXCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: 'Số toa', v: data.toaList?.length || 0, icon: FiBox },
          { l: 'Tổng vé bán', v: data.tongVeBan || 0, icon: FaTicketAlt },
          { l: 'Sự kiện', v: data.events?.length || 0, icon: FiBell },
        ].map(s => (
          <div key={s.l} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <s.icon className="text-2xl mx-auto text-[#8C1D19]" />
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.v}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[['toa', FiBox, 'Quản lý Toa'],['su-kien', FiBell, 'Lịch sử sự kiện']].map(([t, Icon, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${tab===t ? 'border-[#8C1D19] text-[#8C1D19]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon /> {l}
            </button>
          ))}
        </div>

        {/* TAB QUẢN LÝ TOA */}
        {tab === 'toa' && (
          <div className="p-5">
            {toaReadOnly ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4 flex items-start gap-2">
                <FiAlertTriangle className="shrink-0 mt-0.5" />
                <span>
                  {(data.tongVeBan || 0) > 0
                    ? `Chuyến đã có ${data.tongVeBan} vé đặt — không thể điều chỉnh cấu hình toa.`
                    : 'Chuyến đã kết thúc — không thể điều chỉnh cấu hình toa.'}
                  {' '}Việc điều chỉnh toa chỉ được phép ngay sau khi sinh chuyến (trước khi có vé đặt).
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Mỗi thẻ là một toa trong chuyến. Xóa chỉ khi chưa có vé đặt.</p>
                <button onClick={openAddToa} className="flex items-center gap-1.5 bg-[#8C1D19] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">
                  <FiPlus /> Thêm toa
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.toaList || []).map(t => {
                const total = t.soGheToidDa || t.loaiToa?.so_cho_toi_da || 0
                const avail = total - (t.vesBan || 0)
                return (
                  <div key={t.idToaChuyen} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-center space-y-1.5">
                    <p className="text-3xl font-extrabold text-[#8C1D19]">{String(t.soToaThuTu).padStart(2, '0')}</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{t.loaiToa?.ten_loai_toa}</p>
                    <p className={`text-sm font-bold ${seatColor(avail, total)}`}>{avail} / {total} ghế trống</p>
                    <p className="text-xs text-gray-400">Đã bán: {t.vesBan || 0}</p>
                    {!toaReadOnly && (
                      <div className="flex gap-2 justify-center pt-2">
                        <button onClick={() => openEditToa(t)} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#8C1D19]/10 text-[#8C1D19] rounded-lg text-xs font-medium hover:bg-[#8C1D19]/20">
                          <FiEdit2 /> Sửa
                        </button>
                        <button onClick={() => doRemove(t)} disabled={t.vesBan > 0}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={t.vesBan > 0 ? `Không xóa được vì đã có ${t.vesBan} vé` : 'Xóa toa'}>
                          <FiTrash2 /> Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              {!toaReadOnly && (
                <button onClick={openAddToa}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] text-gray-400 hover:border-[#8C1D19] hover:text-[#8C1D19] transition-colors">
                  <FiPlus className="text-2xl" />
                  <span className="text-sm font-semibold">Thêm toa mới</span>
                </button>
              )}
              {(data.toaList || []).length === 0 && toaReadOnly && (
                <p className="col-span-full text-gray-400 text-sm text-center py-6">Chưa có toa nào</p>
              )}
            </div>
          </div>
        )}

        {/* TAB SỰ KIỆN */}
        {tab === 'su-kien' && (
          <div className="p-5 space-y-3">
            {(data.events || []).length === 0 && <p className="text-gray-400 text-sm text-center py-6">Chưa có sự kiện nào</p>}
            {(data.events || []).map(e => (
              <div key={e.id} className="flex gap-4 bg-gray-50 rounded-xl px-4 py-3.5 border-l-4 border-orange-400">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                      {(() => {
                        const sk = SU_KIEN.find(s => s.v === e.loaiSuKien)
                        return sk ? <><sk.icon /> {sk.l}</> : e.loaiSuKien
                      })()}
                    </span>
                    {e.delayPhut && <span className="text-xs text-orange-600 font-bold bg-orange-100 px-1.5 py-0.5 rounded-full">+{e.delayPhut} phút</span>}
                    {e.gaAnhHuong && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">@ {e.gaAnhHuong}</span>}
                    <StatusBadge status={e.trangThai} />
                  </div>
                  {e.moTa && <p className="text-sm text-gray-600 mt-1">{e.moTa}</p>}
                </div>
                <span className="text-xs text-gray-300 shrink-0 font-mono">
                  {new Date(e.thoiGian).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {modal === 'event' && (
        <Modal title={<span className="flex items-center gap-2"><FiClipboard /> Ghi nhận sự kiện điều phối</span>} onClose={() => setModal(null)}
          footer={<>
            <button onClick={doEvent} disabled={saving}
              className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <FiLoader className="animate-spin" /> : 'Ghi nhận'}
            </button>
            <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium">Hủy</button>
          </>}>
          <FormField label="Loại sự kiện">
            <select value={eventForm.loaiSuKien} onChange={e => setEventForm(p => ({...p, loaiSuKien: e.target.value}))} className={inputCls}>
              {SU_KIEN.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </FormField>
          {eventForm.loaiSuKien === 'delay' && (
            <FormField label="Số phút chậm">
              <input type="number" min={1} value={eventForm.delayPhut} onChange={e => setEventForm(p => ({...p, delayPhut: e.target.value}))}
                className={inputCls} placeholder="VD: 15" />
            </FormField>
          )}
          <FormField label="Ga ảnh hưởng (tùy chọn)">
            <select value={eventForm.idGaAnhHuong} onChange={e => setEventForm(p => ({...p, idGaAnhHuong: e.target.value}))} className={inputCls}>
              <option value="">-- Không chọn --</option>
              {(data.lichTrinh || []).map(g => <option key={g.idGa} value={g.idGa}>{g.tenGa}</option>)}
            </select>
            {eventForm.loaiSuKien === 'delay' && (
              <p className="text-xs text-gray-400 mt-1">Chọn ga để tự động cập nhật giờ đến/đi dự kiến của ga này và các ga sau theo số phút chậm.</p>
            )}
          </FormField>
          <FormField label="Mô tả chi tiết">
            <textarea value={eventForm.moTa} onChange={e => setEventForm(p => ({...p, moTa: e.target.value}))}
              rows={3} className={inputCls + ' resize-none'} placeholder="Nội dung thông báo cho điều phối viên..." />
          </FormField>
        </Modal>
      )}

      {(modal === 'addToa' || modal === 'editToa') && (
        <Modal title={modal === 'addToa'
            ? <span className="flex items-center gap-2"><FiPlus /> Thêm toa vào chuyến</span>
            : <span className="flex items-center gap-2"><FiEdit2 /> Chỉnh sửa toa</span>} onClose={() => setModal(null)}
          footer={<>
            <button onClick={modal === 'addToa' ? doAddToa : doEditToa}
              disabled={!toaForm.soToaThuTu || !toaForm.idLoaiToa || saving}
              className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <FiLoader className="animate-spin" /> : modal === 'addToa' ? <><FiPlus /> Thêm toa</> : 'Lưu thay đổi'}
            </button>
            <button onClick={() => setModal(null)} className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium">Hủy</button>
          </>}>
          <FormField label="Số thứ tự toa">
            <input type="number" min={1} value={toaForm.soToaThuTu} onChange={e => setToaForm(p => ({...p, soToaThuTu: e.target.value}))} className={inputCls} />
            {modal === 'editToa' && toaForm.soToaThuTu && parseInt(toaForm.soToaThuTu) !== editingToa?.soToaThuTu && (
              <p className="text-xs text-[#8C1D19] mt-1 flex items-center gap-1.5">
                <FiInfo className="shrink-0" /> Nếu số thứ tự này đã có toa khác, 2 toa sẽ tự động hoán đổi vị trí.
              </p>
            )}
          </FormField>
          <FormField label="Loại toa">
            <select value={toaForm.idLoaiToa} onChange={e => setToaForm(p => ({...p, idLoaiToa: e.target.value}))} className={inputCls}>
              <option value="">-- Chọn loại toa --</option>
              {loaiToaList.map(t => <option key={t.id_loai_toa} value={t.id_loai_toa}>{t.ten_loai_toa} ({t.so_cho_toi_da} chỗ)</option>)}
            </select>
          </FormField>
          <FormField label="Số chỗ tối đa (để trống = mặc định của loại toa)">
            <input type="number" min={1} value={toaForm.soGheToidDa} onChange={e => setToaForm(p => ({...p, soGheToidDa: e.target.value}))}
              className={inputCls} placeholder="Để trống để dùng mặc định" />
          </FormField>
        </Modal>
      )}
    </div>
  )
}
