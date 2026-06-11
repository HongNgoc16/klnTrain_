import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiLock, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Profile.scss';

const VAI_TRO_LABEL = {
  quan_tri: 'Quản trị viên',
  nhan_vien: 'Nhân viên',
  dieu_phoi: 'Điều phối viên',
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ ho_ten: '', so_dien_thoai: '', ngay_sinh: '', gioi_tinh: 'nam' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      const data = res.data.data;
      setProfile(data);
      setForm({
        ho_ten: data.ho_ten || '',
        so_dien_thoai: data.so_dien_thoai || '',
        ngay_sinh: data.ngay_sinh ? String(data.ngay_sinh).slice(0, 10) : '',
        gioi_tinh: data.gioi_tinh || 'nam'
      });
    } catch (error) {
      console.error('Lỗi tải thông tin cá nhân:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const showPwMsg = (text, type = 'success') => {
    setPwMsg({ text, type });
    setTimeout(() => setPwMsg({ text: '', type: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);

      const stored = JSON.parse(localStorage.getItem('admin_user') || '{}');
      localStorage.setItem('admin_user', JSON.stringify({ ...stored, name: form.ho_ten }));

      setProfile((prev) => ({ ...prev, ...form }));
      showMsg('Cập nhật thông tin thành công');
    } catch (error) {
      showMsg(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password.length < 6) {
      return showPwMsg('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
    }
    if (pwForm.new_password !== pwForm.confirm) {
      return showPwMsg('Xác nhận mật khẩu không khớp', 'error');
    }
    setPwSaving(true);
    try {
      await authAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      showPwMsg('Đổi mật khẩu thành công');
    } catch (error) {
      showPwMsg(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Thông tin cá nhân</h1>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card__header">
          <h2><FiUser /> Thông tin cơ bản</h2>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <FiLoader className="spin" /> : <FiSave />} Lưu thay đổi
          </button>
        </div>
        <div className="profile-card__body">
          {msg.text && (
            <div className={`alert-msg ${msg.type === 'error' ? 'alert-msg--error' : 'alert-msg--success'}`}>
              {msg.type === 'error' ? <FiXCircle /> : <FiCheckCircle />}
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" value={form.ho_ten} onChange={(e) => setForm({ ...form, ho_ten: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <input type="text" value={VAI_TRO_LABEL[profile?.vai_tro] || profile?.vai_tro || ''} disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" value={form.so_dien_thoai} onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })} placeholder="VD: 0912345678" />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input type="date" value={form.ngay_sinh} onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Giới tính</label>
              <select value={form.gioi_tinh} onChange={(e) => setForm({ ...form, gioi_tinh: e.target.value })}>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
                <option value="khac">Khác</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card__header">
          <h2><FiLock /> Đổi mật khẩu</h2>
          <button className="btn-primary" onClick={handleChangePassword} disabled={pwSaving}>
            {pwSaving ? <FiLoader className="spin" /> : <FiSave />} Đổi mật khẩu
          </button>
        </div>
        <div className="profile-card__body">
          {pwMsg.text && (
            <div className={`alert-msg ${pwMsg.type === 'error' ? 'alert-msg--error' : 'alert-msg--success'}`}>
              {pwMsg.type === 'error' ? <FiXCircle /> : <FiCheckCircle />}
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Mật khẩu cũ</label>
              <input type="password" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} placeholder="Nhập mật khẩu cũ" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} placeholder="Tối thiểu 6 ký tự" required />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Nhập lại mật khẩu mới" required />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
