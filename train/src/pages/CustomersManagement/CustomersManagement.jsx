import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiEdit, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import { CiLock, CiUnlock } from "react-icons/ci";
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { customerAPI, userAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './CustomersManagement.scss';

const CustomersManagement = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);  // Thêm state cho confirm khóa/mở
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);  // Thêm state cho target status
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    ngay_sinh: '',
    gioi_tinh: 'nam',
    trang_thai: 'hoat_dong'
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll();
      setCustomers(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải khách hàng:', error);
      setCustomers([
        { id_tai_khoan: 1, ho_ten: 'Nguyễn Văn A', email: 'nguyenvana@email.com', so_dien_thoai: '0912345678', tong_ve: 12, tong_tien: 15000000, trang_thai: 'hoat_dong', ngay_tao: '2024-01-15' },
        { id_tai_khoan: 2, ho_ten: 'Trần Thị B', email: 'tranthib@email.com', so_dien_thoai: '0987654321', tong_ve: 8, tong_tien: 8900000, trang_thai: 'hoat_dong', ngay_tao: '2024-02-20' },
        { id_tai_khoan: 3, ho_ten: 'Lê Văn C', email: 'levanc@email.com', so_dien_thoai: '0965432187', tong_ve: 5, tong_tien: 3200000, trang_thai: 'bi_khoa', ngay_tao: '2024-03-10' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerTickets = async (id) => {
    try {
      const res = await customerAPI.getTickets(id);
      setCustomerTickets(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải vé khách hàng:', error);
      setCustomerTickets([
        { id_ve: 1001, chuyen_tau: 'SE1', ga_len: 'Hà Nội', ga_xuong: 'Sài Gòn', ngay_di: '2024-05-20', gia_ve: 1250000, trang_thai: 'da_su_dung' },
        { id_ve: 1002, chuyen_tau: 'SE2', ga_len: 'Đà Nẵng', ga_xuong: 'Hà Nội', ngay_di: '2024-05-15', gia_ve: 890000, trang_thai: 'hieu_luc' }
      ]);
    }
  };

  const handleViewDetail = async (customer) => {
    setSelectedCustomer(customer);
    await loadCustomerTickets(customer.id_tai_khoan);
    setShowDetailModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      ho_ten: customer.ho_ten,
      email: customer.email,
      so_dien_thoai: customer.so_dien_thoai || '',
      ngay_sinh: customer.ngay_sinh || '',
      gioi_tinh: customer.gioi_tinh || 'nam',
      trang_thai: customer.trang_thai || 'hoat_dong'
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.update(selectedCustomer.id_tai_khoan, formData);
      alert('Cập nhật thông tin thành công');
      await loadCustomers();
      setShowEditModal(false);
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  // Xử lý khi bấm nút khóa/mở khóa - hiện dialog
  const handleToggleStatusClick = (customer) => {
    setStatusTarget(customer);
    setShowStatusConfirm(true);
  };

  // Xử lý xác nhận khóa/mở khóa
  const handleConfirmToggleStatus = async () => {
    if (!statusTarget) return;
    
    const newStatus = statusTarget.trang_thai === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong';
    const actionText = newStatus === 'hoat_dong' ? 'mở khóa' : 'khóa';
    
    try {
      await userAPI.updateStatus(statusTarget.id_tai_khoan, { trang_thai: newStatus });
      alert(`Đã ${actionText} tài khoản ${statusTarget.ho_ten} thành công`);
      await loadCustomers();
    } catch (error) {
      alert(`Có lỗi xảy ra khi ${actionText} tài khoản`);
    } finally {
      setShowStatusConfirm(false);
      setStatusTarget(null);
    }
  };

  const handleDelete = async () => {
    try {
      await customerAPI.delete(deleteTarget.id_tai_khoan);
      alert('Xóa khách hàng thành công');
      await loadCustomers();
      setShowConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      alert('Không thể xóa khách hàng này');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    if (status === 'hoat_dong') return { class: 'badge-success', text: 'Hoạt động' };
    return { class: 'badge-danger', text: 'Đã khóa' };
  };

  const columns = [
    { title: 'ID', key: 'id_tai_khoan', width: '50px' },
    { title: 'Họ tên', key: 'ho_ten', width: '160px' },
    { title: 'Email', key: 'email', width: '200px' },
    { title: 'Số điện thoại', key: 'so_dien_thoai', width: '100px' },
    { title: 'Số vé đã mua', key: 'tong_ve', width: '90px' },
    { title: 'Tổng chi tiêu', key: 'tong_tien', render: (v) => formatCurrency(v) },
    { title: 'Ngày tạo', key: 'ngay_tao', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '---' },
    { title: 'Trạng thái', key: 'trang_thai', render: (v) => {
      const status = getStatusBadge(v);
      return <span className={`badge ${status.class}`}>{status.text}</span>;
    }},
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => handleViewDetail(row)} title="Xem chi tiết"><FiEye /></button>
          <button className="btn-status" onClick={() => handleToggleStatusClick(row)} title={row.trang_thai === 'hoat_dong' ? 'Khóa' : 'Mở khóa'}>
            {row.trang_thai === 'hoat_dong' ? <CiLock /> : <CiUnlock />}
          </button>
        </div>
      )
    }
  ];

  const filteredCustomers = customers.filter(c => 
    c.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.so_dien_thoai?.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="customers-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý khách hàng</h1>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm theo tên, email, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="stats-info">Tổng số: {customers.length} khách hàng</div>
      </div>

      <DataTable columns={columns} data={filteredCustomers} />

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết khách hàng" size="lg">
        {selectedCustomer && (
          <div className="customer-detail">
            <div className="detail-section">
              <h4>Thông tin cá nhân</h4>
              <div className="info-grid">
                <div className="info-item"><span className="label">Họ tên:</span><span className="value">{selectedCustomer.ho_ten}</span></div>
                <div className="info-item"><span className="label">Email:</span><span className="value"><FiMail /> {selectedCustomer.email}</span></div>
                <div className="info-item"><span className="label">Số điện thoại:</span><span className="value"><FiPhone /> {selectedCustomer.so_dien_thoai || '---'}</span></div>
                <div className="info-item"><span className="label">Ngày tạo:</span><span className="value">{new Date(selectedCustomer.ngay_tao).toLocaleDateString('vi-VN')}</span></div>
                <div className="info-item"><span className="label">Trạng thái:</span><span className={`badge ${getStatusBadge(selectedCustomer.trang_thai).class}`}>{getStatusBadge(selectedCustomer.trang_thai).text}</span></div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thống kê mua vé</h4>
              <div className="stats-box">
                <div className="stat-item"><span className="stat-label">Tổng vé đã mua</span><span className="stat-value">{selectedCustomer.tong_ve || 0}</span></div>
                <div className="stat-item"><span className="stat-label">Tổng chi tiêu</span><span className="stat-value">{formatCurrency(selectedCustomer.tong_tien || 0)}</span></div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Lịch sử mua vé</h4>
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr><th>Mã vé</th><th>Chuyến tàu</th><th>Hành trình</th><th>Ngày đi</th><th>Giá vé</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    {customerTickets.map(ticket => (
                      <tr key={ticket.id_ve}>
                        <td>{ticket.id_ve}</td><td>{ticket.chuyen_tau}</td>
                        <td>{ticket.ga_len} → {ticket.ga_xuong}</td>
                        <td>{new Date(ticket.ngay_di).toLocaleDateString('vi-VN')}</td>
                        <td>{formatCurrency(ticket.gia_ve)}</td>
                        <td><span className={`badge ${ticket.trang_thai === 'da_su_dung' ? 'badge-info' : 'badge-success'}`}>
                          {ticket.trang_thai === 'da_su_dung' ? 'Đã sử dụng' : 'Có hiệu lực'}
                        </span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Sửa thông tin khách hàng">
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Họ tên</label><input type="text" value={formData.ho_ten} onChange={(e) => setFormData({...formData, ho_ten: e.target.value})} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
          <div className="form-row"><div className="form-group"><label>Số điện thoại</label><input type="tel" value={formData.so_dien_thoai} onChange={(e) => setFormData({...formData, so_dien_thoai: e.target.value})} /></div>
          <div className="form-group"><label>Ngày sinh</label><input type="date" value={formData.ngay_sinh} onChange={(e) => setFormData({...formData, ngay_sinh: e.target.value})} /></div></div>
          <div className="form-row"><div className="form-group"><label>Giới tính</label><select value={formData.gioi_tinh} onChange={(e) => setFormData({...formData, gioi_tinh: e.target.value})}><option value="nam">Nam</option><option value="nu">Nữ</option></select></div>
          <div className="form-group"><label>Trạng thái</label><select value={formData.trang_thai} onChange={(e) => setFormData({...formData, trang_thai: e.target.value})}><option value="hoat_dong">Hoạt động</option><option value="bi_khoa">Khóa</option></select></div></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        onConfirm={handleDelete} 
        title="Xóa khách hàng" 
        message={`Bạn có chắc chắn muốn xóa khách hàng "${deleteTarget?.ho_ten}"? Hành động này không thể hoàn tác.`} 
        confirmText="Xóa" 
        cancelText="Hủy" 
      />

      {/* Confirm Status Change Dialog (Khóa/Mở khóa) */}
      <ConfirmDialog 
        isOpen={showStatusConfirm} 
        onClose={() => setShowStatusConfirm(false)} 
        onConfirm={handleConfirmToggleStatus} 
        title={statusTarget?.trang_thai === 'hoat_dong' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'} 
        message={
          statusTarget?.trang_thai === 'hoat_dong' 
            ? `Bạn có chắc chắn muốn KHÓA tài khoản "${statusTarget?.ho_ten}"? Khách hàng sẽ không thể đăng nhập và đặt vé.`
            : `Bạn có chắc chắn muốn MỞ KHÓA tài khoản "${statusTarget?.ho_ten}"? Khách hàng sẽ có thể đăng nhập và đặt vé bình thường.`
        } 
        confirmText={statusTarget?.trang_thai === 'hoat_dong' ? 'Khóa' : 'Mở khóa'} 
        cancelText="Hủy" 
      />
    </div>
  );
};

export default CustomersManagement;