import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import { trainAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './TrainsManagement.scss';

const TrainsManagement = () => {
  // ==================== STATE ====================
   const [loading, setLoading] = useState(true);
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [formData, setFormData] = useState({
    so_hieu: '',
    ten_tau: '',
    so_toa: '',
    trang_thai: 'hoat_dong'
  });

  // ==================== LOAD DATA ====================
  useEffect(() => {
    loadTrains();
  }, []);

    // Lọc tàu theo từ khóa tìm kiếm
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredTrains(trains);
    } else {
      const filtered = trains.filter(train => 
        train.so_hieu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.ten_tau?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTrains(filtered);
    }
  }, [searchTerm, trains]);

  const loadTrains = async () => {
    setLoading(true);
    try {
      const res = await trainAPI.getAll();
      let trainsData = res.data.data || [];

  // SẮP XẾP THEO MÃ TÀU (SỐ HIỆU)
      trainsData.sort((a, b) => {
        // Tách số từ số hiệu để sắp xếp đúng (VD: SE1, SE2, SE10, TN1...)
        const aNum = parseInt(a.so_hieu.match(/\d+/) || [0]);
        const bNum = parseInt(b.so_hieu.match(/\d+/) || [0]);
        const aPrefix = a.so_hieu.match(/[A-Za-z]+/)?.[0] || '';
        const bPrefix = b.so_hieu.match(/[A-Za-z]+/)?.[0] || '';
        
        if (aPrefix === bPrefix) {
          return aNum - bNum;
        }
        return aPrefix.localeCompare(bPrefix);
      });
      
      setTrains(trainsData);
      setFilteredTrains(trainsData);
    } catch (error) {
      console.error('Lỗi tải tàu:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLE FORM ====================
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setSelectedTrain(null);
    setFormData({
      so_hieu: '',
      ten_tau: '',
      so_toa: '',
      trang_thai: 'hoat_dong'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTrain) {
        await trainAPI.update(selectedTrain.ma_tau, formData);
        alert('Cập nhật tàu thành công!');
      } else {
        await trainAPI.create(formData);
        alert('Thêm tàu thành công!');
      }
      await loadTrains();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Lỗi lưu:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  // ==================== HANDLE ACTIONS ====================
  const handleAddTrain = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (train) => {
    setSelectedTrain(train);
    setFormData({
      so_hieu: train.so_hieu,
      ten_tau: train.ten_tau || '',
      so_toa: train.so_toa,
      trang_thai: train.trang_thai
    });
    setShowAddModal(true);
  };

  const handleView = (train) => {
    setSelectedTrain(train);
    setShowDetailModal(true);
  };

  const handleDelete = async (train) => {
    if (window.confirm(`Xóa tàu ${train.so_hieu}?`)) {
      try {
        await trainAPI.delete(train.ma_tau);
        alert('Xóa tàu thành công!');
        await loadTrains();
      } catch (error) {
        console.error('Lỗi xóa:', error);
        alert('Có lỗi xảy ra, không thể xóa tàu này!');
      }
    }
  };

  // ==================== COLUMNS DEFINITION ====================
  const columns = [
    { title: 'Số hiệu', key: 'so_hieu', width: '90px' },
    { title: 'Tên tàu', key: 'ten_tau', width: '240px' },
    { title: 'Số toa', key: 'so_toa', width: '130px' },
    { title: 'Số toa thực tế', key: 'so_toa_thuc_te', width: '140px' },
    { 
      title: 'Trạng thái', 
      key: 'trang_thai',
      render: (value) => (
        <span className={`badge ${value === 'hoat_dong' ? 'badge-success' : value === 'bao_tri' ? 'badge-warning' : 'badge-danger'}`}>
          {value === 'hoat_dong' ? 'Hoạt động' : value === 'bao_tri' ? 'Bảo trì' : 'Ngừng hoạt động'}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => handleView(row)} title="Xem chi tiết">
            <FiEye />
          </button>
          <button className="btn-edit" onClick={() => handleEdit(row)} title="Sửa">
            <FiEdit />
          </button>
          <button className="btn-delete" onClick={() => handleDelete(row)} title="Xóa">
            <FiTrash2 />
          </button>
        </div>
      )
    }
  ];

  // ==================== RENDER ====================
  if (loading) return <LoadingSpinner />;

  return (
    <div className="trains-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý tàu</h1>
        </div>
        <button className="btn-primary" onClick={handleAddTrain}>
          <FiPlus /> Thêm tàu mới
        </button>
      </div>
      
      
      {/* Thanh tìm kiếm */}
      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo số hiệu hoặc tên tàu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-info">
          Tổng số: {filteredTrains.length} tàu
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={trains} 
        onRowClick={handleView}
      />
      
      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedTrain ? 'Sửa tàu' : 'Thêm tàu mới'} size="md">
        <form onSubmit={handleSubmit} className="train-form">
          <div className="form-group">
            <label>Số hiệu tàu *</label>
            <input 
              type="text" 
              name="so_hieu"
              value={formData.so_hieu}
              onChange={handleInputChange}
              placeholder="VD: SE1" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Tên tàu</label>
            <input 
              type="text" 
              name="ten_tau"
              value={formData.ten_tau}
              onChange={handleInputChange}
              placeholder="Tên tàu" 
            />
          </div>
          
          <div className="form-group">
            <label>Số toa *</label>
            <input 
              type="number" 
              name="so_toa"
              value={formData.so_toa}
              onChange={handleInputChange}
              min="1" 
              max="20" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Trạng thái</label>
            <select 
              name="trang_thai"
              value={formData.trang_thai}
              onChange={handleInputChange}
            >
              <option value="hoat_dong">Hoạt động</option>
              <option value="bao_tri">Bảo trì</option>
              <option value="ngung_hoat_dong">Ngừng hoạt động</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu lại</button>
          </div>
        </form>
      </Modal>
      
      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết tàu" size="lg">
        {selectedTrain && (
          <div className="train-detail">
            <div className="detail-section">
              <h4>Thông tin chung</h4>
              <div className="detail-row">
                <span className="label">Mã tàu:</span>
                <span className="value">{selectedTrain.ma_tau}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số hiệu:</span>
                <span className="value">{selectedTrain.so_hieu}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tên tàu:</span>
                <span className="value">{selectedTrain.ten_tau || '---'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số toa:</span>
                <span className="value">{selectedTrain.so_toa}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số toa thực tế:</span>
                <span className="value">{selectedTrain.so_toa_thuc_te || 0}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng thái:</span>
                <span className="value">
                  {selectedTrain.trang_thai === 'hoat_dong' ? 'Hoạt động' : 
                   selectedTrain.trang_thai === 'bao_tri' ? 'Bảo trì' : 'Ngừng hoạt động'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainsManagement;