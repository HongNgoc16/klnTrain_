import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLichChay, createLichChay, updateLichChay, getTauList, getGaList } from '../api/dieuphoi'

const pTime = t => { if (!t) return '--:--'; const s = String(t); const m = s.match(/T(\d{2}:\d{2})/); return m ? m[1] : s.slice(0, 5) }
const THU   = { '1':'CN','2':'T2','3':'T3','4':'T4','5':'T5','6':'T6','7':'T7' }
const inputCls = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-400 outline-none"

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
      showMsg(editing ? '✅ Cập nhật lịch chạy thành công' : '✅ Tạo lịch chạy thành công')
    } catch (e) { showMsg(e.message, 'error') }
    finally { setSaving(false) }
  }

  const thuDisplay = (str) => (str || '').split(',').map(t => THU[t.trim()]).filter(Boolean).join(', ')

  const isValid = form.idTau && form.idGaDi && form.idGaDen && form.gioKhoiHanh && form.gioDuKienDen
    && form.idGaDi !== form.idGaDen

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <button onClick={() => navigate('/')} className="hover:text-blue-600 flex items-center gap-1">← Tổng quan</button>
        <span>/</span>
        <span className="text-gray-700 font-medium">Lịch Chạy</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📅 Quản lý Lịch Chạy</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý lịch trình chạy tàu và sinh chuyến hàng loạt</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
          + Tạo lịch chạy mới
        </button>
      </div>

      {msg.text && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type==='error'?'bg-red-50 text-red-700 border border-red-200':'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Lọc theo tàu</label>
          <select value={filterTau} onChange={e => setFilterTau(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none min-w-[200px]">
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
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{lc.Tau?.so_hieu}</span>
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
                  <button onClick={() => openEdit(lc)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                    ✏️ Sửa
                  </button>
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
              <h3 className="text-lg font-bold text-gray-800">{editing ? '✏️ Sửa lịch chạy' : '➕ Tạo lịch chạy mới'}</h3>
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
              <FormField label="Thứ trong tuần" sub="Nhập số thứ (1=CN, 2=T2...7=T7), phân cách bằng dấu phẩy. Để trống = hằng ngày.">
                <input value={form.thuTrongTuan} onChange={e => setForm(p => ({...p, thuTrongTuan: e.target.value}))}
                  className={inputCls} placeholder="VD: 2,3,4,5,6 (T2-T6) hoặc để trống" />
                {form.thuTrongTuan && (
                  <p className="text-xs text-blue-600 mt-1">→ Chạy vào: {thuDisplay(form.thuTrongTuan) || 'không hợp lệ'}</p>
                )}
              </FormField>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 shrink-0">
              <button onClick={handleSave} disabled={!isValid || saving}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? '⏳ Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo lịch chạy'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
