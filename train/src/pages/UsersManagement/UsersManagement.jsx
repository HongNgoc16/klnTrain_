import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiSearch, FiEye, FiLock, FiUnlock, 
  FiRefreshCw, FiUser, FiUserCheck, FiUserX, FiMail, FiPhone, FiCalendar
} from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './UsersManagement.scss';

const UsersManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    ho_ten: '',
    so_dien_thoai: '',
    ngay_sinh: '',
    gioi_tinh: 'nam',
    vai_tro: 'nhan_vien',
    mat_khau: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải người dùng:', error);
      // Mock data
      setUsers([
        { id_tai_khoan: 1, email: 'admin@klntrain.vn', ho_ten: 'Nguyễn Quản Trị', so_dien_thoai: '0912345678', vai_tro: 'quan_tri', trang_thai: 'hoat_dong', ngay_tao: '2024-01-15', ngay_sinh: '1985-03-15', gioi_tinh: 'nam' },
        { id_tai_khoan: 2, email: 'nv1@klntrain.vn', ho_ten: 'Trần Thị Nhân Viên', so_dien_thoai: '0923456789', vai_tro: 'nhan_vien', trang_thai: 'hoat_dong', ngay_tao: '2024-02-20', ngay_sinh: '1992-07-20', gioi_tinh: 'nu' },
        { id_tai_khoan: 3, email: 'nv2@klntrain.vn', ho_ten: 'Lê Văn Bán Vé', so_dien_thoai: '0934567890', vai_tro: 'nhan_vien', trang_thai: 'bi_khoa', ngay_tao: '2024-03-10', ngay_sinh: '1990-11-05', gioi_tinh: 'nam' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await userAPI.update(selectedUser.id_tai_khoan, {
          ho_ten: formData.ho_ten,
          so_dien_thoai: formData.so_dien_thoai,
          ngay_sinh: formData.ngay_sinh,
          gioi_tinh: formData.gioi_tinh,
          vai_tro: formData.vai_tro
        });
        alert('Cập nhật người dùng thành công');
      } else {
        await userAPI.create(formData);
        alert('Thêm người dùng thành công');
      }
      await loadUsers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    try {
      await userAPI.delete(deleteTarget.id_tai_khoan);
      alert('Xóa người dùng thành công');
      await loadUsers();
      setShowConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      alert('Không thể xóa người dùng này');
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.trang_thai === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong';
    const actionText = newStatus === 'hoat_dong' ? 'mở khóa' : 'khóa';
    
    if (window.confirm(`${actionText.toUpperCase()} tài khoản ${user.ho_ten}?`)) {
      try {
        await userAPI.updateStatus(user.id_tai_khoan, { trang_thai: newStatus });
        alert(`Đã ${actionText} tài khoản thành công`);
        await loadUsers();
      } catch (error) {
        alert('Có lỗi xảy ra');
      }
    }
  };

  const handleResetPassword = async (user) => {
    if (window.confirm(`Đặt lại mật khẩu cho ${user.ho_ten}? Mật khẩu mới sẽ là 123456`)) {
      try {
        await userAPI.resetPassword(user.id_tai_khoan);
        alert('Đặt lại mật khẩu thành công');
      } catch (error) {
        alert('Đặt lại mật khẩu thất bại');
      }
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      ho_ten: '',
      so_dien_thoai: '',
      ngay_sinh: '',
      gioi_tinh: 'nam',
      vai_tro: 'nhan_vien',
      mat_khau: ''
    });
  };

  const getRoleText = (role) => {
    const roles = {
      quan_tri: { text: 'Quản trị viên', class: 'role-admin', icon: <FiUserCheck /> },
      nhan_vien: { text: 'Nhân viên', class: 'role-staff', icon: <FiUser /> },
      khach_hang: { text: 'Khách hàng', class: 'role-customer', icon: <FiUser /> }
    };
    return roles[role] || { text: role, class: '', icon: <FiUser /> };
  };

  const getStatusBadge = (status) => {
    if (status === 'hoat_dong') return { class: 'badge-success', text: 'Hoạt động', icon: <FiUnlock /> };
    return { class: 'badge-danger', text: 'Đã khóa', icon: <FiLock /> };
  };

  const columns = [
    { title: 'ID', key: 'id_tai_khoan', width: '45px' },
    { title: 'Email', key: 'email', width: '160px' },
    { title: 'Họ tên', key: 'ho_ten', width: '150px' },
    { title: 'Số điện thoại', key: 'so_dien_thoai', width: '120px' },
    { 
      title: 'Vai trò', 
      key: 'vai_tro', 
      width: '130px',
      render: (v) => {
        const role = getRoleText(v);
        return (
          <span className={`role-badge ${role.class}`}>
            {role.icon} {role.text}
          </span>
        );
      }
    },
    { title: 'Ngày tạo', key: 'ngay_tao', width: '100px', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '---' },
    { 
      title: 'Trạng thái', 
      key: 'trang_thai', 
      width: '100px',
      render: (v) => {
        const status = getStatusBadge(v);
        return <span className={`badge ${status.class}`}>{status.icon} {status.text}</span>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => { setSelectedUser(row); setShowDetailModal(true); }} title="Xem chi tiết"><FiEye /></button>
          <button className="btn-edit" onClick={() => { setSelectedUser(row); setFormData(row); setShowModal(true); }} title="Sửa"><FiEdit /></button>
          <button className="btn-status" onClick={() => handleStatusToggle(row)} title={row.trang_thai === 'hoat_dong' ? 'Khóa' : 'Mở khóa'}>
            {row.trang_thai === 'hoat_dong' ? <FiLock /> : <FiUnlock />}
          </button>
          <button className="btn-reset" onClick={() => handleResetPassword(row)} title="Đặt lại mật khẩu"><FiRefreshCw /></button>
          <button className="btn-delete" onClick={() => { setDeleteTarget(row); setShowConfirm(true); }} title="Xóa"><FiTrash2 /></button>
        </div>
      )
    }
  ];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.so_dien_thoai?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || u.vai_tro === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.trang_thai === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="users-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Thêm người dùng
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm theo tên, email, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Tất cả vai trò</option>
          <option value="quan_tri">Quản trị viên</option>
          <option value="nhan_vien">Nhân viên</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="hoat_dong">Hoạt động</option>
          <option value="bi_khoa">Đã khóa</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredUsers} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedUser ? 'Thông tin người dùng' : 'Thêm người dùng mới'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={!!selectedUser} />
          </div>
          <div className="form-group">
            <label>Họ tên *</label>
            <input type="text" value={formData.ho_ten} onChange={(e) => setFormData({...formData, ho_ten: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="tel" value={formData.so_dien_thoai} onChange={(e) => setFormData({...formData, so_dien_thoai: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input type="date" value={formData.ngay_sinh} onChange={(e) => setFormData({...formData, ngay_sinh: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Giới tính</label>
              <select value={formData.gioi_tinh} onChange={(e) => setFormData({...formData, gioi_tinh: e.target.value})}>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <select value={formData.vai_tro} onChange={(e) => setFormData({...formData, vai_tro: e.target.value})}>
                <option value="quan_tri">Quản trị viên</option>
                <option value="nhan_vien">Nhân viên</option>
              </select>
            </div>
          </div>
          {!selectedUser && (
            <div className="form-group">
              <label>Mật khẩu (mặc định: 123456)</label>
              <input type="password" value={formData.mat_khau} onChange={(e) => setFormData({...formData, mat_khau: e.target.value})} placeholder="Để trống dùng mật khẩu mặc định" />
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết người dùng" size="lg">
        {selectedUser && (
          <div className="user-detail">
            <div className="detail-header">
              <div className="user-avatar">
                {selectedUser.gioi_tinh === 'nam' ? '👨' : '👩'}
              </div>
              <div className="user-name">
                <h3>{selectedUser.ho_ten}</h3>
                <span className={`role-badge ${getRoleText(selectedUser.vai_tro).class}`}>
                  {getRoleText(selectedUser.vai_tro).icon} {getRoleText(selectedUser.vai_tro).text}
                </span>
              </div>
            </div>
            <div className="detail-info">
              <div className="info-row"><FiMail /><span>{selectedUser.email}</span></div>
              <div className="info-row"><FiPhone /><span>{selectedUser.so_dien_thoai || '---'}</span></div>
              <div className="info-row"><FiCalendar /><span>Ngày sinh: {selectedUser.ngay_sinh ? new Date(selectedUser.ngay_sinh).toLocaleDateString('vi-VN') : '---'}</span></div>
              <div className="info-row"><FiUser /><span>Giới tính: {selectedUser.gioi_tinh === 'nam' ? 'Nam' : 'Nữ'}</span></div>
              <div className="info-row"><FiCalendar /><span>Ngày tạo: {new Date(selectedUser.ngay_tao).toLocaleString('vi-VN')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Xóa người dùng" message={`Xóa người dùng ${deleteTarget?.ho_ten}?`} confirmText="Xóa" cancelText="Hủy" />
    </div>
  );
};

export default UsersManagement;