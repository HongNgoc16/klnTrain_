import { useState, useEffect } from 'react'
import { FiUser, FiSave, FiCheckCircle, FiXCircle, FiLoader, FiLock } from 'react-icons/fi'
import { getProfile, updateProfile, changePassword } from '../api/dieuphoi'
import { getAuth, saveAuth } from '../utils/auth'

const inputCls = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#8C1D19] focus:ring-0 outline-none"
const inputDisabledCls = "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children}
  </div>
)

const VAI_TRO_LABEL = {
  quan_tri: 'Quản trị viên',
  nhan_vien: 'Nhân viên',
  dieu_phoi: 'Điều phối viên',
}

export default function ThongTinCaNhan() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ hoTen: '', soDienThoai: '', ngaySinh: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const [pwForm, setPwForm] = useState({ matKhauCu: '', matKhauMoi: '', xacNhan: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' })

  const load = () => {
    getProfile().then(r => {
      const d = r.data || r
      setProfile(d)
      setForm({ hoTen: d.hoTen || '', soDienThoai: d.soDienThoai || '', ngaySinh: d.ngaySinh ? String(d.ngaySinh).slice(0, 10) : '' })
    }).catch(console.error)
  }

  useEffect(() => { load() }, [])

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text: '', type: '' }), 4000) }
  const showPwMsg = (text, type = 'success') => { setPwMsg({ text, type }); setTimeout(() => setPwMsg({ text: '', type: '' }), 4000) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateProfile({ ho_ten: form.hoTen, so_dien_thoai: form.soDienThoai || null, ngay_sinh: form.ngaySinh || null })
      const updated = res.data || res
      setProfile(updated)
      const auth = getAuth()
      if (auth) saveAuth({ ...auth, hoTen: updated.hoTen, soDienThoai: updated.soDienThoai, ngaySinh: updated.ngaySinh })
      showMsg('Cập nhật thông tin thành công')
    } catch (e) { showMsg(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (pwForm.matKhauMoi.length < 6) return showPwMsg('Mật khẩu mới phải có ít nhất 6 ký tự', 'error')
    if (pwForm.matKhauMoi !== pwForm.xacNhan) return showPwMsg('Xác nhận mật khẩu không khớp', 'error')
    setPwSaving(true)
    try {
      await changePassword({ matKhauCu: pwForm.matKhauCu, matKhauMoi: pwForm.matKhauMoi })
      setPwForm({ matKhauCu: '', matKhauMoi: '', xacNhan: '' })
      showPwMsg('Đổi mật khẩu thành công')
    } catch (e) { showPwMsg(e.message, 'error') }
    finally { setPwSaving(false) }
  }

  const isProfileValid = form.hoTen.trim().length > 0
  const isPwValid = pwForm.matKhauCu && pwForm.matKhauMoi && pwForm.xacNhan

  if (!profile) return <div className="flex items-center justify-center h-64 text-gray-400">Đang tải...</div>

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <span className="text-gray-700 font-medium">Tài khoản</span>
          <span>/</span>
          <span className="text-gray-700 font-medium">Thông tin cá nhân</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiUser className="text-[#8C1D19]" /> Thông tin cá nhân
        </h1>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 flex items-center gap-2"><FiUser className="text-[#8C1D19]" /> Thông tin cá nhân</h2>
          <button onClick={handleSave} disabled={!isProfileValid || saving}
            className="flex items-center gap-2 bg-[#8C1D19] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6b1411] disabled:opacity-50">
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />} Lưu thay đổi
          </button>
        </div>
        <div className="p-6 space-y-4">
          {msg.text && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {msg.type === 'error' ? <FiXCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
              {msg.text}
            </div>
          )}

          <FormField label="Họ và tên" required>
            <input value={form.hoTen} onChange={e => setForm(p => ({ ...p, hoTen: e.target.value }))} className={inputCls} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email">
              <input value={profile.email || ''} disabled className={inputDisabledCls} />
            </FormField>
            <FormField label="Vai trò">
              <input value={VAI_TRO_LABEL[profile.vaiTro] || profile.vaiTro || ''} disabled className={inputDisabledCls} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Số điện thoại">
              <input value={form.soDienThoai} onChange={e => setForm(p => ({ ...p, soDienThoai: e.target.value }))} className={inputCls} placeholder="VD: 0912345678" />
            </FormField>
            <FormField label="Ngày sinh">
              <input type="date" value={form.ngaySinh} onChange={e => setForm(p => ({ ...p, ngaySinh: e.target.value }))} className={inputCls} />
            </FormField>
          </div>
        </div>
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 flex items-center gap-2"><FiLock className="text-[#8C1D19]" /> Đổi mật khẩu</h2>
          <button onClick={handleChangePassword} disabled={!isPwValid || pwSaving}
            className="flex items-center gap-2 bg-[#8C1D19] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6b1411] disabled:opacity-50">
            {pwSaving ? <FiLoader className="animate-spin" /> : <FiSave />} Đổi mật khẩu
          </button>
        </div>
        <div className="p-6 space-y-4">
          {pwMsg.text && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${pwMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {pwMsg.type === 'error' ? <FiXCircle className="shrink-0" /> : <FiCheckCircle className="shrink-0" />}
              {pwMsg.text}
            </div>
          )}

          <FormField label="Mật khẩu cũ" required>
            <input type="password" value={pwForm.matKhauCu} onChange={e => setPwForm(p => ({ ...p, matKhauCu: e.target.value }))}
              className={inputCls} placeholder="Nhập mật khẩu cũ" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Mật khẩu mới" required>
              <input type="password" value={pwForm.matKhauMoi} onChange={e => setPwForm(p => ({ ...p, matKhauMoi: e.target.value }))}
                className={inputCls} placeholder="Tối thiểu 6 ký tự" />
            </FormField>
            <FormField label="Xác nhận lại" required>
              <input type="password" value={pwForm.xacNhan} onChange={e => setPwForm(p => ({ ...p, xacNhan: e.target.value }))}
                className={inputCls} placeholder="Nhập lại mật khẩu mới" />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  )
}
