import React, { useState, useEffect } from 'react';
import { 
  FiSend, FiBell, FiUsers, FiUserCheck, FiMail, 
  FiCalendar, FiClock, FiEye, FiTrash2, FiSearch,
  FiMessageCircle, FiAlertCircle, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { notificationAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './NotificationsManagement.scss';

const NotificationsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    tieu_de: '',
    noi_dung: '',
    loai: 'he_thong',
    lien_ket: '',
    gui_den: 'tat_ca'  // 'tat_ca', 'quan_tri', 'nhan_vien', 'khach_hang'
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
      // Mock data
      setNotifications([
        { id_thong_bao: 1, tieu_de: 'Bảo trì hệ thống', noi_dung: 'Hệ thống sẽ bảo trì từ 02:00-04:00 ngày mai', loai: 'he_thong', da_doc: false, thoi_gian_tao: '2024-01-15T08:00:00' },
        { id_thong_bao: 2, tieu_de: 'Khuyến mãi mùa hè', noi_dung: 'Giảm 20% cho các chuyến đi tháng 6', loai: 'khuyen_mai', da_doc: true, thoi_gian_tao: '2024-01-14T10:30:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      if (formData.gui_den === 'tat_ca') {
        await notificationAPI.sendBroadcast({
          tieu_de: formData.tieu_de,
          noi_dung: formData.noi_dung,
          loai: formData.loai,
          lien_ket: formData.lien_ket
        });
        alert('Đã gửi thông báo đến tất cả người dùng');
      } else {
        await notificationAPI.sendGroup({
          vai_tro: formData.gui_den,
          tieu_de: formData.tieu_de,
          noi_dung: formData.noi_dung,
          loai: formData.loai,
          lien_ket: formData.lien_ket
        });
        alert(`Đã gửi thông báo đến nhóm ${formData.gui_den}`);
      }
      await loadNotifications();
      setShowSendModal(false);
      resetForm();
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi thông báo');
    }
  };

  const handleDelete = async () => {
    try {
      await notificationAPI.delete(deleteTarget.id_thong_bao);
      await loadNotifications();
      setShowConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      alert('Không thể xóa thông báo');
    }
  };

  const resetForm = () => {
    setFormData({
      tieu_de: '',
      noi_dung: '',
      loai: 'he_thong',
      lien_ket: '',
      gui_den: 'tat_ca'
    });
  };

  const getLoaiText = (loai) => {
    const types = {
      he_thong: { text: 'Hệ thống', icon: <FiSettings />, class: 'badge-info' },
      khuyen_mai: { text: 'Khuyến mãi', icon: <FiAlertCircle />, class: 'badge-warning' },
      dat_ve: { text: 'Đặt vé', icon: <FiCheckCircle />, class: 'badge-success' },
      doi_ve: { text: 'Đổi vé', icon: <FiRefreshCw />, class: 'badge-info' },
      huy_ve: { text: 'Hủy vé', icon: <FiXCircle />, class: 'badge-danger' }
    };
    return types[loai] || { text: loai, icon: <FiBell />, class: 'badge-secondary' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
  };

  const columns = [
    { title: 'ID', key: 'id_thong_bao', width: '60px' },
    { title: 'Tiêu đề', key: 'tieu_de', width: '200px' },
    { title: 'Nội dung', key: 'noi_dung', width: '300px' },
    { 
      title: 'Loại', 
      key: 'loai', 
      width: '100px',
      render: (v) => {
        const type = getLoaiText(v);
        return <span className={`badge ${type.class}`}>{type.icon} {type.text}</span>;
      }
    },
    { 
      title: 'Trạng thái', 
      key: 'da_doc', 
      width: '100px',
      render: (v) => v ? 'Đã đọc' : 'Chưa đọc'
    },
    { title: 'Thời gian', key: 'thoi_gian_tao', width: '160px', render: (v) => formatDate(v) },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => { setSelectedNotif(row); setShowDetailModal(true); }} title="Xem chi tiết"><FiEye /></button>
          <button className="btn-delete" onClick={() => { setDeleteTarget(row); setShowConfirm(true); }} title="Xóa"><FiTrash2 /></button>
        </div>
      )
    }
  ];

  const filteredNotifs = notifications.filter(n => 
    n.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.noi_dung?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý thông báo</h1>
          <p className="page-subtitle">Gửi thông báo đến người dùng, quản lý thông báo hệ thống</p>
        </div>
        <button className="btn-primary" onClick={() => setShowSendModal(true)}>
          <FiSend /> Gửi thông báo
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><FiBell /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng thông báo</span>
            <span className="stat-value">{notifications.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiMail /></div>
          <div className="stat-info">
            <span className="stat-label">Đã gửi</span>
            <span className="stat-value">{notifications.filter(n => n.trang_thai === 'da_gui').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiEye /></div>
          <div className="stat-info">
            <span className="stat-label">Đã đọc</span>
            <span className="stat-value">{notifications.filter(n => n.da_doc).length}</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm thông báo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="he_thong">Hệ thống</option>
          <option value="khuyen_mai">Khuyến mãi</option>
          <option value="dat_ve">Đặt vé</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredNotifs} />

      {/* Send Notification Modal */}
      <Modal isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Gửi thông báo" size="md">
        <form onSubmit={handleSendNotification}>
          <div className="form-group">
            <label>Gửi đến</label>
            <select value={formData.gui_den} onChange={(e) => setFormData({...formData, gui_den: e.target.value})}>
              <option value="tat_ca">Tất cả người dùng</option>
              <option value="quan_tri">Quản trị viên</option>
              <option value="nhan_vien">Nhân viên</option>
              <option value="khach_hang">Khách hàng</option>
            </select>
          </div>
          <div className="form-group">
            <label>Loại thông báo</label>
            <select value={formData.loai} onChange={(e) => setFormData({...formData, loai: e.target.value})}>
              <option value="he_thong">Hệ thống</option>
              <option value="khuyen_mai">Khuyến mãi</option>
              <option value="dat_ve">Đặt vé</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tiêu đề</label>
            <input type="text" value={formData.tieu_de} onChange={(e) => setFormData({...formData, tieu_de: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Nội dung</label>
            <textarea rows="4" value={formData.noi_dung} onChange={(e) => setFormData({...formData, noi_dung: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Đường dẫn liên kết (tùy chọn)</label>
            <input type="text" value={formData.lien_ket} onChange={(e) => setFormData({...formData, lien_ket: e.target.value})} placeholder="VD: /promotions" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowSendModal(false)}>Hủy</button>
            <button type="submit" className="btn-primary"><FiSend /> Gửi</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết thông báo" size="md">
        {selectedNotif && (
          <div className="notif-detail">
            <div className={`notif-icon ${getLoaiText(selectedNotif.loai).class}`}>
              {getLoaiText(selectedNotif.loai).icon}
            </div>
            <div className="notif-header">
              <h3>{selectedNotif.tieu_de}</h3>
              <span className="notif-time"><FiClock /> {formatDate(selectedNotif.thoi_gian_tao)}</span>
            </div>
            <div className="notif-content">
              <p>{selectedNotif.noi_dung}</p>
            </div>
            {selectedNotif.lien_ket && (
              <div className="notif-link">
                <a href={selectedNotif.lien_ket}>Xem chi tiết →</a>
              </div>
            )}
            <div className="notif-footer">
              <span className={`badge ${getLoaiText(selectedNotif.loai).class}`}>
                {getLoaiText(selectedNotif.loai).text}
              </span>
              <span className="status">{selectedNotif.da_doc ? 'Đã đọc' : 'Chưa đọc'}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Xóa thông báo" message={`Xóa thông báo "${deleteTarget?.tieu_de}"?`} confirmText="Xóa" cancelText="Hủy" />
    </div>
  );
};

export default NotificationsManagement;