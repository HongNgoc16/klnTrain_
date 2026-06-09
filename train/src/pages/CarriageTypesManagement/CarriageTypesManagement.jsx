import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiLayers, FiGrid, FiEye } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { carriageTypeAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './CarriageTypesManagement.scss';

const CarriageTypesManagement = () => {
  const [loading, setLoading] = useState(true);
  const [carriageTypes, setCarriageTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [formData, setFormData] = useState({
    ma_loai_toa: '',
    ten_loai_toa: '',
    loai_ghe_chinh: 'giuong',
    so_cho_toi_da: ''
  });

  useEffect(() => {
    loadCarriageTypes();
  }, []);

  const loadCarriageTypes = async () => {
    setLoading(true);
    try {
      const res = await carriageTypeAPI.getAll();
      setCarriageTypes(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải loại toa:', error);
      // Mock data
      setCarriageTypes([
        { id_loai_toa: 1, ma_loai_toa: 'GN4_DH', ten_loai_toa: 'Giường nằm khoang 4 điều hòa', loai_ghe_chinh: 'giuong', so_cho_toi_da: 28 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedType) {
        await carriageTypeAPI.update(selectedType.id_loai_toa, formData);
      } else {
        await carriageTypeAPI.create(formData);
      }
      await loadCarriageTypes();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    try {
      await carriageTypeAPI.delete(deleteTarget.id_loai_toa);
      await loadCarriageTypes();
      setShowConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      alert('Không thể xóa loại toa này (đang được sử dụng)');
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData({
      ma_loai_toa: '',
      ten_loai_toa: '',
      loai_ghe_chinh: 'giuong',
      so_cho_toi_da: ''
    });
  };

  const getLoaiGheText = (type) => {
    const types = {
      giuong: 'Giường nằm',
      ngoimem: 'Ghế ngồi mềm',
      ngoicung: 'Ghế cứng'
    };
    return types[type] || type;
  };

  const getLoaiGheClass = (type) => {
    const classes = {
      giuong: 'badge-bed',
      ngoimem: 'badge-soft',
      ngoicung: 'badge-hard'
    };
    return classes[type] || '';
  };

  const columns = [
    { title: 'Mã loại toa', key: 'ma_loai_toa', width: '120px' },
    { title: 'Tên loại toa', key: 'ten_loai_toa', width: '310px' },
    { title: 'Loại ghế chính', key: 'loai_ghe_chinh', render: (v) => (
      <span className={`badge-type ${getLoaiGheClass(v)}`}>{getLoaiGheText(v)}</span>
    ) },
    { title: 'Số chỗ tối đa', key: 'so_cho_toi_da', render: (v) => `${v} chỗ` },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-edit" onClick={() => { setSelectedType(row); setFormData(row); setShowModal(true); }} title="Sửa"><FiEdit /></button>
          <button className="btn-delete" onClick={() => { setDeleteTarget(row); setShowConfirm(true); }} title="Xóa"><FiTrash2 /></button>
        </div>
      )
    }
  ];

  const filteredTypes = carriageTypes.filter(t => 
    t.ten_loai_toa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ma_loai_toa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="carriage-types-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý loại toa</h1>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}>
              <FiLayers /> Thẻ
            </button>
            <button className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
              <FiGrid /> Bảng
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Thêm loại toa
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm loại toa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="stats-info">Tổng số: {carriageTypes.length} loại toa</div>
      </div>

      {/* Card View - Panel trắng như cấu hình ghế */}
      {viewMode === 'card' && (
        <div className="carriage-cards-panel">
          <div className="panel-header">
            <h3>Danh sách loại toa</h3>
            <span className="panel-total">{carriageTypes.length} </span>
          </div>
          <div className="cards-grid">
            {filteredTypes.map(type => (
              <div key={type.id_loai_toa} className="carriage-card">
                <div className="card-header">
                  <div className="card-icon">
                    {type.loai_ghe_chinh === 'giuong' ? <FiLayers /> : <FiGrid />}
                  </div>
                  <div className="card-code">{type.ma_loai_toa}</div>
                  <div className="card-actions">
                    <button className="icon-btn edit" onClick={() => { setSelectedType(type); setFormData(type); setShowModal(true); }}>
                      <FiEdit />
                    </button>
                    <button className="icon-btn delete" onClick={() => { setDeleteTarget(type); setShowConfirm(true); }}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-name">{type.ten_loai_toa}</div>
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Loại ghế</span>
                      <span className={`stat-value badge-type ${getLoaiGheClass(type.loai_ghe_chinh)}`}>
                        {getLoaiGheText(type.loai_ghe_chinh)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Sức chứa</span>
                      <span className="stat-value">{type.so_cho_toi_da} chỗ</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button className="btn-detail" onClick={() => window.location.href = `/seat-config?carriage=${type.id_loai_toa}`}>
                    <FiEye /> Xem cấu hình ghế
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredTypes.length === 0 && (
            <div className="empty-state">
              <p>Không tìm thấy loại toa nào</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable columns={columns} data={filteredTypes} />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedType ? 'Sửa loại toa' : 'Thêm loại toa'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã loại toa *</label>
            <input type="text" value={formData.ma_loai_toa} onChange={(e) => setFormData({...formData, ma_loai_toa: e.target.value.toUpperCase()})} required />
            <small className="hint">VD: GN4_DH, GN6_DH, NM_DH, NC</small>
          </div>
          <div className="form-group">
            <label>Tên loại toa *</label>
            <input type="text" value={formData.ten_loai_toa} onChange={(e) => setFormData({...formData, ten_loai_toa: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Loại ghế chính</label>
              <select value={formData.loai_ghe_chinh} onChange={(e) => setFormData({...formData, loai_ghe_chinh: e.target.value})}>
                <option value="giuong">Giường nằm</option>
                <option value="ngoimem">Ghế ngồi mềm</option>
                <option value="ngoicung">Ghế cứng</option>
              </select>
            </div>
            <div className="form-group">
              <label>Số chỗ tối đa *</label>
              <input type="number" value={formData.so_cho_toi_da} onChange={(e) => setFormData({...formData, so_cho_toi_da: e.target.value})} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Xóa loại toa" message={`Xóa loại toa ${deleteTarget?.ten_loai_toa}?`} confirmText="Xóa" cancelText="Hủy" />
    </div>
  );
};

export default CarriageTypesManagement;