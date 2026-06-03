import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiCalendar, FiPercent, FiDollarSign } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import './Coupons.scss';

const Coupons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  
  // Mock data - từ bảng Coupon trong CSDL
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      ma_km: 'WELCOME10',
      mo_ta: 'Giảm 10% cho đơn hàng đầu tiên',
      loai_giam: 'percent',
      gia_tri: 10,
      so_luong: 100,
      da_dung: 60,
      ngay_bat_dau: '2024-01-01',
      ngay_het_han: '2024-12-31',
      trang_thai: 'active'
    },
    {
      id: 2,
      ma_km: 'SUMMER50',
      mo_ta: 'Giảm 50,000đ cho đơn từ 500,000đ',
      loai_giam: 'fixed',
      gia_tri: 50000,
      so_luong: 50,
      da_dung: 32,
      ngay_bat_dau: '2024-6-01',
      ngay_het_han: '2026-9-31',
      trang_thai: 'active'
    },
    {
      id: 3,
      ma_km: 'DBP2026',
      mo_ta: 'Giảm 20% kỉ niệm Giải phóng Điện Biên',
      loai_giam: 'percent',
      gia_tri: 20,
      so_luong: 200,
      da_dung: 0,
      ngay_bat_dau: '2026-5-5',
      ngay_het_han: '2026-5-20',
      trang_thai: 'expired'
    },
    {
      id: 4,
      ma_km: 'STUDENT30',
      mo_ta: 'Giảm 20% lễ 30/5 - 1/5',
      loai_giam: 'percent',
      gia_tri: 30,
      so_luong: 500,
      da_dung: 120,
      ngay_bat_dau: '2026-4-20',
      ngay_het_han: '2026-5-05',
      trang_thai: 'active'
    }
  ]);

  const [formData, setFormData] = useState({
    ma_km: '',
    mo_ta: '',
    loai_giam: 'percent',
    gia_tri: '',
    so_luong: '',
    ngay_bat_dau: '',
    ngay_het_han: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCoupon) {
      // Cập nhật
      setCoupons(coupons.map(c => c.id === selectedCoupon.id ? { ...formData, id: c.id, da_dung: c.da_dung, trang_thai: c.trang_thai } : c));
    } else {
      // Thêm mới
      const newCoupon = {
        ...formData,
        id: coupons.length + 1,
        da_dung: 0,
        trang_thai: new Date(formData.ngay_het_han) > new Date() ? 'active' : 'expired'
      };
      setCoupons([...coupons, newCoupon]);
    }
    setShowModal(false);
    setSelectedCoupon(null);
    setFormData({
      ma_km: '',
      mo_ta: '',
      loai_giam: 'percent',
      gia_tri: '',
      so_luong: '',
      ngay_bat_dau: '',
      ngay_het_han: ''
    });
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      ma_km: coupon.ma_km,
      mo_ta: coupon.mo_ta,
      loai_giam: coupon.loai_giam,
      gia_tri: coupon.gia_tri,
      so_luong: coupon.so_luong,
      ngay_bat_dau: coupon.ngay_bat_dau,
      ngay_het_han: coupon.ngay_het_han
    });
    setShowModal(true);
  };

  const handleDelete = (coupon) => {
    if (window.confirm(`Xóa mã giảm giá ${coupon.ma_km}?`)) {
      setCoupons(coupons.filter(c => c.id !== coupon.id));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.ngay_bat_dau);
    const endDate = new Date(coupon.ngay_het_han);
    
    if (now < startDate) return { class: 'badge-warning', text: 'Sắp diễn ra' };
    if (now > endDate) return { class: 'badge-danger', text: 'Hết hạn' };
    if (coupon.da_dung >= coupon.so_luong) return { class: 'badge-secondary', text: 'Hết lượt' };
    return { class: 'badge-success', text: 'Đang hoạt động' };
  };

  const columns = [
    { title: 'Mã code', key: 'ma_km', width: '120px' },
    { title: 'Mô tả', key: 'mo_ta', width: '250px' },
    { 
      title: 'Loại giảm', 
      key: 'loai_giam',
      render: (value) => value === 'percent' ? 'Phần trăm' : 'Tiền mặt'
    },
    { 
      title: 'Giá trị', 
      key: 'gia_tri',
      render: (value, row) => row.loai_giam === 'percent' ? `${value}%` : formatCurrency(value)
    },
    { 
      title: 'Số lượng', 
      key: 'so_luong',
      render: (value, row) => `${row.da_dung.toLocaleString()} / ${value.toLocaleString()}`
    },
    { 
      title: 'Thời gian', 
      key: 'ngay_bat_dau',
      render: (_, row) => `${row.ngay_bat_dau} → ${row.ngay_het_han}`
    },
    { 
      title: 'Trạng thái', 
      key: 'trang_thai',
      render: (_, row) => {
        const status = getStatusBadge(row);
        return <span className={`badge ${status.class}`}>{status.text}</span>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-edit" onClick={() => handleEdit(row)}><FiEdit /></button>
          <button className="btn-delete" onClick={() => handleDelete(row)}><FiTrash2 /></button>
        </div>
      )
    }
  ];

  const filteredCoupons = coupons.filter(c => 
    c.ma_km.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mo_ta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="coupons-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý mã giảm giá</h1>
          <p className="page-subtitle"> </p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedCoupon(null); setFormData({ ma_km: '', mo_ta: '', loai_giam: 'percent', gia_tri: '', so_luong: '', ngay_bat_dau: '', ngay_het_han: '' }); setShowModal(true); }}>
          <FiPlus /> Thêm mã giảm giá
        </button>
      </div> 

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm mã code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="stats-info">
          Tổng số: {coupons.length} mã | Đã dùng: {coupons.reduce((sum, c) => sum + c.da_dung, 0).toLocaleString()} lượt
        </div>
      </div>

      <DataTable columns={columns} data={filteredCoupons} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCoupon ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'} size="md">
        <form onSubmit={handleSubmit} className="coupon-form">
          <div className="form-group">
            <label>Mã code *</label>
            <input type="text" name="ma_km" value={formData.ma_km} onChange={handleInputChange} placeholder="VD: SUMMER50" required />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="mo_ta" value={formData.mo_ta} onChange={handleInputChange} rows="2" placeholder="Mô tả chương trình..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loại giảm giá</label>
              <select name="loai_giam" value={formData.loai_giam} onChange={handleInputChange}>
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Tiền mặt (VNĐ)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Giá trị giảm</label>
              <input type="number" name="gia_tri" value={formData.gia_tri} onChange={handleInputChange} placeholder={formData.loai_giam === 'percent' ? 'VD: 10' : 'VD: 50000'} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số lượng</label>
              <input type="number" name="so_luong" value={formData.so_luong} onChange={handleInputChange} placeholder="Số lượng mã" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" name="ngay_bat_dau" value={formData.ngay_bat_dau} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" name="ngay_het_han" value={formData.ngay_het_han} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu lại</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;