import React, { useState } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import './CustomersManagement.scss';

const CustomersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Mock data - từ bảng HanhKhach và TaiKhoan
  const [customers] = useState([
    { 
      id: 1, 
      ho_ten: 'Nguyễn Văn A', 
      email: 'nguyenvana@email.com',
      so_dien_thoai: '0912345678',
      cccd: '012345678901',
      loai_hanh_khach: 'nguoi_lon',
      tong_ve_da_mua: 3,
      tong_tien: 5890000
    },
    { 
      id: 2, 
      ho_ten: 'Trần Thị B', 
      email: 'tranthib@email.com',
      so_dien_thoai: '0987654321',
      cccd: '987654321098',
      loai_hanh_khach: 'nguoi_lon',
      tong_ve_da_mua: 8,
      tong_tien: 8900000
    },
    { 
      id: 3, 
      ho_ten: 'Lê Văn C', 
      email: 'levanc@email.com',
      so_dien_thoai: '0965432187',
      cccd: '456789123456',
      loai_hanh_khach: 'sinh_vien',
      tong_ve_da_mua: 5,
      tong_tien: 3200000
    }
  ]);
  
  const getLoaiKhachText = (type) => {
    const types = {
      nguoi_lon: 'Người lớn',
      sinh_vien: 'Sinh viên',
      tre_em: 'Trẻ em',
      nguoi_cao_tuoi: 'Người cao tuổi'
    };
    return types[type] || type;
  };
  
  const columns = [
    { title: 'Họ tên', key: 'ho_ten', width: '180px' },
    { title: 'Email', key: 'email', width: '200px' },
    { title: 'Số điện thoại', key: 'so_dien_thoai', width: '120px' },
    { title: 'CCCD', key: 'cccd', width: '130px' },
    { 
      title: 'Loại KH', 
      key: 'loai_hanh_khach',
      render: (value) => getLoaiKhachText(value)
    },
    { title: 'Số vé đã mua', key: 'tong_ve_da_mua', width: '120px' },
    { 
      title: 'Tổng chi tiêu', 
      key: 'tong_tien',
      render: (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <button className="btn-view" onClick={() => handleView(row)}>
          <FiEye />
        </button>
      )
    }
  ];
  
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };
  
  const filteredCustomers = customers.filter(c => 
    c.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.so_dien_thoai.includes(searchTerm)
  );
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
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
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, SĐT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-info">
          Tổng số: {customers.length} khách hàng
        </div>
      </div>
      
      <DataTable columns={columns} data={filteredCustomers} />
      
      {/* Customer Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết khách hàng" size="lg">
        {selectedCustomer && (
          <div className="customer-detail">
            <div className="detail-section">
              <h4>Thông tin cá nhân</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Họ tên:</span>
                  <span className="value">{selectedCustomer.ho_ten}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedCustomer.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedCustomer.so_dien_thoai}</span>
                </div>
                <div className="info-item">
                  <span className="label">CCCD:</span>
                  <span className="value">{selectedCustomer.cccd}</span>
                </div>
                <div className="info-item">
                  <span className="label">Loại khách hàng:</span>
                  <span className="value">{getLoaiKhachText(selectedCustomer.loai_hanh_khach)}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Thống kê mua vé</h4>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Tổng vé đã mua</div>
                  <div className="stat-number">{selectedCustomer.tong_ve_da_mua}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Tổng chi tiêu</div>
                  <div className="stat-number">{formatCurrency(selectedCustomer.tong_tien)}</div>
                </div>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Lịch sử mua vé</h4>
              <table className="history-table">
                <thead>
                  <tr><th>Ngày mua</th><th>Chuyến tàu</th><th>Hành trình</th><th>Số vé</th><th>Số tiền</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>15/01/2024</td>
                    <td>SE1</td>
                    <td>Hà Nội → Sài Gòn</td>
                    <td>2</td>
                    <td>2,500,000đ</td>
                  </tr>
                  <tr>
                    <td>10/12/2023</td>
                    <td>SE2</td>
                    <td>Sài Gòn → Đà Nẵng</td>
                    <td>1</td>
                    <td>890,000đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersManagement;