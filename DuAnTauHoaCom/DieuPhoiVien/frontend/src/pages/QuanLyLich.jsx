import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCalendar, FiPlus, FiEdit2, FiCheckCircle, FiXCircle, FiLoader, FiMapPin, FiTrash2, FiX } from 'react-icons/fi'
import {
  getLichChay, createLichChay, updateLichChay, deleteLichChay, getTauList, getGaList,
  getGaDung, addGaDung, updateGaDung, removeGaDung,
} from '../api/dieuphoi'

const pTime = t => { if (!t) return '--:--'; const s = String(t); const m = s.match(/T(\d{2}:\d{2})/); return m ? m[1] : s.slice(0, 5) }
const THU   = { '1':'CN','2':'T2','3':'T3','4':'T4','5':'T5','6':'T6','7':'T7' }
const DAYS  = [['2','T2'],['3','T3'],['4','T4'],['5','T5'],['6','T6'],['7','T7'],['1','CN']]
const inputCls = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none"

const FormField = ({ label, children, sub }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {sub && <p className="text-xs text-gray-400 mb-1">{sub}</p>}
    {children}
  </div>
)

export default function QuanLyLich() {
  const navigate = useNavigate()
  const [list, setList]       = useState([])
  const [tauList, setTauList] = useState([])
  const [gaList, setGaList]   = useState([])
  const [filterTau, setFilterTau] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm] = useState({ idTau:'', idGaDi:'', idGaDen:'', gioKhoiHanh:'', gioDuKienDen:'', thuTrongTuan:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text:'', type:'' })

  // Ga dừng (chi tiết lịch trình)
  const [gaDungLich, setGaDungLich] = useState(null)
  const [gaDungList, setGaDungList] = useState([])
  const [gaDungLoading, setGaDungLoading] = useState(false)
  const [showGaDungForm, setShowGaDungForm] = useState(false)
  const [editingGaDung, setEditingGaDung] = useState(null)
  const [gaDungForm, setGaDungForm] = useState({ thuTuDung:'', idGa:'', gioDen:'', gioDi:'', thoiGianDung:'0', khoangCachKm:'' })
  const [gaDungSaving, setGaDungSaving] = useState(false)
  const [gaDungMsg, setGaDungMsg] = useState({ text:'', type:'' })

  const loadData = () =>
    getLichChay(filterTau ? { idTau: filterTau } : {})
      .then(r => { const d = r.data || r; setList(Array.isArray(d) ? d : []) })
      .catch(console.error)

  useEffect(() => { loadData() }, [filterTau])
  useEffect(() => {
    getTauList().then(r => { const d = r.data||r; setTauList(Array.isArray(d)?d:[]) }).catch(()=>{})
    getGaList().then(r => { const d = r.data||r; setGaList(Array.isArray(d)?d:[]) }).catch(()=>{})
  }, [])

  const showMsg = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'' }), 4000) }

  const openCreate = () => {
    setEditing(null)
    setForm({ idTau:'', idGaDi:'', idGaDen:'', gioKhoiHanh:'', gioDuKienDen:'', thuTrongTuan:'' })
    setShowForm(true)
  }

  const openEdit = (lc) => {
    setEditing(lc.id_lich_chay)
    setForm({
      idTau:         String(lc.id_tau),
      idGaDi:        String(lc.id_ga_di),
      idGaDen:       String(lc.id_ga_den),
      gioKhoiHanh:   pTime(lc.gio_khoi_hanh),
      gioDuKienDen:  pTime(lc.gio_du_kien_den),
      thuTrongTuan:  lc.thu_trong_tuan || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        idTau:        parseInt(form.idTau),
        idGaDi:       parseInt(form.idGaDi),
        idGaDen:      parseInt(form.idGaDen),
        gioKhoiHanh:  form.gioKhoiHanh.length === 5 ? form.gioKhoiHanh + ':00' : form.gioKhoiHanh,
        gioDuKienDen: form.gioDuKienDen.length === 5 ? form.gioDuKienDen + ':00' : form.gioDuKienDen,
        thuTrongTuan: form.thuTrongTuan || null,
      }
      if (editing) await updateLichChay(editing, payload)
      else await createLichChay(payload)
      setShowForm(false)
      loadData()
      showMsg(editing ? 'Cập nhật lịch chạy thành công' : 'Tạo lịch chạy thành công')
    } catch (e) { showMsg(e.message, 'error') }
    finally { setSaving(false) }
  }

  const thuDisplay = (str) => (str || '').split(',').map(t => THU[t.trim()]).filter(Boolean).join(', ')

  const toggleThu = (code) => {
    setForm(p => {
      const cur = (p.thuTrongTuan || '').split(',').map(s => s.trim()).filter(Boolean)
      const next = cur.includes(code) ? cur.filter(c => c !== code) : [...cur, code]
      return { ...p, thuTrongTuan: next.join(',') }
    })
  }

  const isValid = form.idTau && form.idGaDi && form.idGaDen && form.gioKhoiHanh && form.gioDuKienDen
    && form.idGaDi !== form.idGaDen

  const handleDeleteLich = async (lc) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch chạy ${lc.Tau?.so_hieu} (${lc.GaDi?.ten_ga} → ${lc.GaDen?.ten_ga}) này không?`)) return
    try {
      await deleteLichChay(lc.id_lich_chay)
      loadData()
      showMsg('Xóa lịch chạy thành công')
    } catch (e) { showMsg(e.message, 'error') }
  }

  // ─── Ga dừng (chi tiết lịch trình) ───────────────────────────────
  const toHHMMSS = (t) => t && t.length === 5 ? t + ':00' : t

  const loadGaDungList = (idLichChay) => {
    setGaDungLoading(true)
    getGaDung(idLichChay)
      .then(r => { const d = r.data || r; setGaDungList(Array.isArray(d) ? d : []) })
      .catch(console.error)
      .finally(() => setGaDungLoading(false))
  }

  const openGaDung = (lc) => {
    setGaDungLich(lc)
    setShowGaDungForm(false)
    setEditingGaDung(null)
    setGaDungMsg({ text:'', type:'' })
    loadGaDungList(lc.id_lich_chay)
  }

  const closeGaDung = () => {
    setGaDungLich(null)
    setGaDungList([])
    setShowGaDungForm(false)
    setEditingGaDung(null)
  }

  const showGaDungMsg = (text, type='success') => { setGaDungMsg({ text, type }); setTimeout(() => setGaDungMsg({ text:'', type:'' }), 4000) }

  const openAddGaDung = () => {
    setEditingGaDung(null)
    setGaDungForm({ thuTuDung: String(gaDungList.length + 1), idGa:'', gioDen:'', gioDi:'', thoiGianDung:'0', khoangCachKm:'' })
    setShowGaDungForm(true)
  }

  const openEditGaDung = (s) => {
    setEditingGaDung(s.idLichTrinh)
    setGaDungForm({
      thuTuDung:    String(s.thuTuDung),
      idGa:         String(s.idGa),
      gioDen:       pTime(s.gioDen),
      gioDi:        pTime(s.gioDi),
      thoiGianDung: String(s.thoiGianDung),
      khoangCachKm: String(s.khoangCachKm),
    })
    setShowGaDungForm(true)
  }

  const handleSaveGaDung = async () => {
    setGaDungSaving(true)
    try {
      const payload = {
        thuTuDung:    parseInt(gaDungForm.thuTuDung),
        idGa:         parseInt(gaDungForm.idGa),
        gioDen:       toHHMMSS(gaDungForm.gioDen),
        gioDi:        toHHMMSS(gaDungForm.gioDi),
        thoiGianDung: parseInt(gaDungForm.thoiGianDung || '0'),
        khoangCachKm: parseFloat(gaDungForm.khoangCachKm),
      }
      if (editingGaDung) await updateGaDung(editingGaDung, payload)
      else await addGaDung(gaDungLich.id_lich_chay, payload)
      setShowGaDungForm(false)
      loadGaDungList(gaDungLich.id_lich_chay)
      showGaDungMsg(editingGaDung ? 'Cập nhật ga dừng thành công' : 'Thêm ga dừng thành công')
    } catch (e) { showGaDungMsg(e.message, 'error') }
    finally { setGaDungSaving(false) }
  }

  const handleDeleteGaDung = async (s) => {
    if (!window.confirm(`Xóa ga dừng "${s.ga?.ten_ga}" khỏi lịch trình?`)) return
    try {
      await removeGaDung(s.idLichTrinh)
      loadGaDungList(gaDungLich.id_lich_chay)
      showGaDungMsg('Xóa ga dừng thành công')
    } catch (e) { showGaDungMsg(e.message, 'error') }
  }

  const isGaDungValid = gaDungForm.thuTuDung && gaDungForm.idGa && gaDungForm.gioDen && gaDungForm.gioDi
    && gaDungForm.khoangCachKm !== '' && gaDungForm.thoiGianDung !== ''

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/dispatcher')} className="hover:text-[#8C1D19] flex items-center gap-1">← Tổng quan</button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Lịch Chạy</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FiCalendar className="text-[#8C1D19]" /> Quản lý Lịch Chạy</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý lịch trình chạy tàu và sinh chuyến hàng loạt</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#8C1D19] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b1411]">
          <FiPlus /> Tạo lịch chạy mới
        </button>
      </div>

      {msg.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${msg.type==='error'?'bg-red-50 text-red-700 border border-red-200':'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg.type==='error' ? <FiXCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Lọc theo tàu</label>
          <select value={filterTau} onChange={e => setFilterTau(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none min-w-[200px]">
            <option value="">Tất cả tàu</option>
            {tauList.map(t => <option key={t.id_tau} value={t.id_tau}>{t.so_hieu} — {t.ten_tau}</option>)}
          </select>
        </div>
        <span className="text-sm text-gray-400 py-2">{list.length} lịch chạy</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ID','Tàu','Ga đi','Ga đến','Giờ khởi hành','Giờ đến dự kiến','Lịch chạy','Thao tác'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {list.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không có lịch chạy nào</td></tr>
            )}
            {list.map(lc => (
              <tr key={lc.id_lich_chay} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 text-gray-400 text-xs font-mono">#{lc.id_lich_chay}</td>
                <td className="px-4 py-3.5">
                  <span className="font-bold text-[#8C1D19] bg-[#8C1D19]/10 px-2 py-0.5 rounded-lg">{lc.Tau?.so_hieu}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{lc.Tau?.ten_tau}</p>
                </td>
                <td className="px-4 py-3.5 font-medium text-gray-700">{lc.GaDi?.ten_ga}</td>
                <td className="px-4 py-3.5 font-medium text-gray-700">{lc.GaDen?.ten_ga}</td>
                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-green-700 text-base">{pTime(lc.gio_khoi_hanh)}</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-gray-600">{pTime(lc.gio_du_kien_den)}</td>
                <td className="px-4 py-3.5 text-xs text-gray-500">
                  {thuDisplay(lc.thu_trong_tuan) || <span className="text-green-600 font-medium">Hằng ngày</span>}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => openGaDung(lc)}
                      className="px-3 py-1.5 bg-[#8C1D19]/10 text-[#8C1D19] rounded-lg text-xs font-medium hover:bg-[#8C1D19]/20 flex items-center gap-1">
                      <FiMapPin /> Ga dừng
                    </button>
                    <button onClick={() => openEdit(lc)}
                      className="px-3 py-1.5 bg-[#8C1D19]/10 text-[#8C1D19] rounded-lg text-xs font-medium hover:bg-[#8C1D19]/20 flex items-center gap-1">
                      <FiEdit2 /> Sửa
                    </button>
                    <button onClick={() => handleDeleteLich(lc)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                      <FiTrash2 /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b shrink-0">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {editing ? <><FiEdit2 /> Sửa lịch chạy</> : <><FiPlus /> Tạo lịch chạy mới</>}
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <FormField label="Tàu hỏa">
                <select value={form.idTau} onChange={e => setForm(p => ({...p, idTau: e.target.value}))} className={inputCls}>
                  <option value="">-- Chọn tàu --</option>
                  {tauList.map(t => <option key={t.id_tau} value={t.id_tau}>{t.so_hieu} — {t.ten_tau}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Ga đi">
                  <select value={form.idGaDi} onChange={e => setForm(p => ({...p, idGaDi: e.target.value}))} className={inputCls}>
                    <option value="">-- Chọn ga --</option>
                    {gaList.map(g => <option key={g.id_ga} value={g.id_ga}>{g.ten_ga}</option>)}
                  </select>
                </FormField>
                <FormField label="Ga đến">
                  <select value={form.idGaDen} onChange={e => setForm(p => ({...p, idGaDen: e.target.value}))} className={inputCls}>
                    <option value="">-- Chọn ga --</option>
                    {gaList.filter(g => String(g.id_ga) !== form.idGaDi).map(g => <option key={g.id_ga} value={g.id_ga}>{g.ten_ga}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Giờ khởi hành">
                  <input type="time" value={form.gioKhoiHanh} onChange={e => setForm(p => ({...p, gioKhoiHanh: e.target.value}))} className={inputCls} />
                </FormField>
                <FormField label="Giờ đến dự kiến">
                  <input type="time" value={form.gioDuKienDen} onChange={e => setForm(p => ({...p, gioDuKienDen: e.target.value}))} className={inputCls} />
                </FormField>
              </div>
              <FormField label="Ngày chạy trong tuần" sub="Chọn các ngày chạy trong tuần. Không chọn ngày nào = chạy hằng ngày.">
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(([code, label]) => {
                    const selected = (form.thuTrongTuan || '').split(',').map(s => s.trim()).includes(code)
                    return (
                      <button key={code} type="button" onClick={() => toggleThu(code)}
                        className={`w-12 h-12 rounded-full text-sm font-bold border-2 transition-colors ${
                          selected ? 'bg-[#8C1D19] text-white border-[#8C1D19]' : 'border-gray-200 text-gray-400 hover:border-[#8C1D19] hover:text-[#8C1D19]'
                        }`}>
                        {label}
                      </button>
                    )
                  })}
                </div>
                {form.thuTrongTuan
                  ? <p className="text-xs text-[#8C1D19] mt-1.5">→ Chạy vào: {thuDisplay(form.thuTrongTuan)}</p>
                  : <p className="text-xs text-green-600 mt-1.5">→ Chạy hằng ngày</p>}
              </FormField>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 shrink-0">
              <button onClick={handleSave} disabled={!isValid || saving}
                className="flex-1 bg-[#8C1D19] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#6b1411] disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <FiLoader className="animate-spin" />}
                {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo lịch chạy'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ga Dừng Modal */}
      {gaDungLich && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiMapPin /> Chi tiết ga dừng
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-bold text-[#8C1D19]">{gaDungLich.Tau?.so_hieu}</span>
                  {' '}{gaDungLich.GaDi?.ten_ga} → {gaDungLich.GaDen?.ten_ga}
                </p>
              </div>
              <button onClick={closeGaDung} className="text-gray-400 hover:text-gray-600 p-1">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
              {gaDungMsg.text && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${gaDungMsg.type==='error'?'bg-red-50 text-red-700 border border-red-200':'bg-green-50 text-green-700 border border-green-200'}`}>
                  {gaDungMsg.type==='error' ? <FiXCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
                  {gaDungMsg.text}
                </div>
              )}

              {!showGaDungForm && (
                <button onClick={openAddGaDung}
                  className="flex items-center gap-2 bg-[#8C1D19] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b1411]">
                  <FiPlus /> Thêm ga dừng
                </button>
              )}

              {showGaDungForm && (
                <div className="border-2 border-[#8C1D19]/20 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    {editingGaDung ? <><FiEdit2 /> Sửa ga dừng</> : <><FiPlus /> Thêm ga dừng</>}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Thứ tự dừng">
                      <input type="number" min={1} value={gaDungForm.thuTuDung}
                        onChange={e => setGaDungForm(p => ({...p, thuTuDung: e.target.value}))} className={inputCls} />
                    </FormField>
                    <FormField label="Ga dừng">
                      <select value={gaDungForm.idGa} onChange={e => setGaDungForm(p => ({...p, idGa: e.target.value}))} className={inputCls}>
                        <option value="">-- Chọn ga --</option>
                        {gaList.map(g => <option key={g.id_ga} value={g.id_ga}>{g.ten_ga}</option>)}
                      </select>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Giờ đến">
                      <input type="time" value={gaDungForm.gioDen} onChange={e => setGaDungForm(p => ({...p, gioDen: e.target.value}))} className={inputCls} />
                    </FormField>
                    <FormField label="Giờ đi">
                      <input type="time" value={gaDungForm.gioDi} onChange={e => setGaDungForm(p => ({...p, gioDi: e.target.value}))} className={inputCls} />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Thời gian dừng (phút)">
                      <input type="number" min={0} value={gaDungForm.thoiGianDung}
                        onChange={e => setGaDungForm(p => ({...p, thoiGianDung: e.target.value}))} className={inputCls} />
                    </FormField>
                    <FormField label="Khoảng cách (km)" sub="Tính từ ga đầu tiên của lịch trình">
                      <input type="number" min={0} step="0.1" value={gaDungForm.khoangCachKm}
                        onChange={e => setGaDungForm(p => ({...p, khoangCachKm: e.target.value}))} className={inputCls} />
                    </FormField>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveGaDung} disabled={!isGaDungValid || gaDungSaving}
                      className="flex-1 bg-[#8C1D19] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#6b1411] disabled:opacity-50 flex items-center justify-center gap-2">
                      {gaDungSaving && <FiLoader className="animate-spin" />}
                      {gaDungSaving ? 'Đang lưu...' : editingGaDung ? 'Lưu thay đổi' : 'Thêm'}
                    </button>
                    <button onClick={() => setShowGaDungForm(false)} className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {['Thứ tự','Ga','Giờ đến','Dừng (phút)','Giờ đi','Khoảng cách (km)','Thao tác'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {gaDungLoading && (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400"><FiLoader className="animate-spin inline" /> Đang tải...</td></tr>
                    )}
                    {!gaDungLoading && gaDungList.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">Chưa có ga dừng nào</td></tr>
                    )}
                    {gaDungList.map(s => (
                      <tr key={s.idLichTrinh} className="hover:bg-white transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="font-bold text-[#8C1D19] bg-[#8C1D19]/10 px-2 py-0.5 rounded-lg">{s.thuTuDung}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-700">{s.ga?.ten_ga} <span className="text-xs text-gray-400">({s.ga?.ma_ga_viet_tat})</span></td>
                        <td className="px-3 py-2.5 font-mono text-gray-600">{pTime(s.gioDen)}</td>
                        <td className="px-3 py-2.5 text-gray-600">{s.thoiGianDung}</td>
                        <td className="px-3 py-2.5 font-mono text-gray-600">{pTime(s.gioDi)}</td>
                        <td className="px-3 py-2.5 text-gray-600">{s.khoangCachKm}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1.5">
                            <button onClick={() => openEditGaDung(s)}
                              className="px-2.5 py-1.5 bg-[#8C1D19]/10 text-[#8C1D19] rounded-lg text-xs font-medium hover:bg-[#8C1D19]/20 flex items-center gap-1">
                              <FiEdit2 /> Sửa
                            </button>
                            <button onClick={() => handleDeleteGaDung(s)}
                              className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                              <FiTrash2 /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t shrink-0">
              <button onClick={closeGaDung} className="w-full border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
