import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import { stationAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './StationsManagement.scss';

const StationsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [formData, setFormData] = useState({
    ma_ga_viet_tat: '',
    ten_ga: '',
    tinh_thanh: '',
    thu_tu_tuyen: 1,
    do_uu_tien: 3,
    trang_thai: 'hoat_dong'
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoading(true);
    try {
      const res = await stationAPI.getAll();
      setStations(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải ga:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setSelectedStation(null);
    setFormData({
      ma_ga_viet_tat: '',
      ten_ga: '',
      tinh_thanh: '',
      thu_tu_tuyen: 1,
      do_uu_tien: 3,
      trang_thai: 'hoat_dong'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStation) {
        await stationAPI.update(selectedStation.ma_ga, formData);
        alert('Cập nhật ga thành công!');
      } else {
        await stationAPI.create(formData);
        alert('Thêm ga thành công!');
      }
      await loadStations();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Lỗi lưu:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (station) => {
    setSelectedStation(station);
    setFormData({
      ma_ga_viet_tat: station.ma_ga_viet_tat,
      ten_ga: station.ten_ga,
      tinh_thanh: station.tinh_thanh || '',
      thu_tu_tuyen: station.thu_tu_tuyen,
      do_uu_tien: station.do_uu_tien,
      trang_thai: station.trang_thai
    });
    setShowModal(true);
  };

  const handleView = (station) => {
    setSelectedStation(station);
    setShowDetailModal(true);
  };

  const handleDelete = async (station) => {
    if (window.confirm(`Xóa ga ${station.ten_ga}?`)) {
      try {
        await stationAPI.delete(station.ma_ga);
        alert('Xóa ga thành công!');
        await loadStations();
      } catch (error) {
        alert('Không thể xóa ga này!');
      }
    }
  };

  const getUuTienText = (level) => {
    const levels = { 1: 'Đầu mối', 2: 'Tỉnh lớn', 3: 'Khu vực', 4: 'Huyện', 5: 'Nhỏ' };
    return levels[level] || 'Khác';
  };

  const filteredStations = stations.filter(s => 
    s.ten_ga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tinh_thanh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ma_ga_viet_tat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { title: 'Mã ga', key: 'ma_ga_viet_tat', width: '90px' },
    { title: 'Tên ga', key: 'ten_ga', width: '220px' },
    { title: 'Tỉnh/Thành', key: 'tinh_thanh', width: '150px' },
    { title: 'Thứ tự', key: 'thu_tu_tuyen', width: '80px' },
    { title: 'Độ ưu tiên', key: 'do_uu_tien',width: '100px', render: (v) => getUuTienText(v) },
    { 
      title: 'Trạng thái', 
      key: 'trang_thai',
      render: (v) => (
        <span className={`badge ${v === 'hoat_dong' ? 'badge-success' : 'badge-danger'}`}>
          {v === 'hoat_dong' ? 'Hoạt động' : 'Ngừng'}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => handleView(row)}><FiEye /></button>
          <button className="btn-edit" onClick={() => handleEdit(row)}><FiEdit /></button>
          <button className="btn-delete" onClick={() => handleDelete(row)}><FiTrash2 /></button>
        </div>
      )
    } 
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="stations-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý ga tàu</h1>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <FiPlus /> Thêm ga mới
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm ga..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <DataTable columns={columns} data={filteredStations} />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedStation ? 'Sửa ga' : 'Thêm ga mới'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã ga (viết tắt) *</label>
            <input type="text" name="ma_ga_viet_tat" value={formData.ma_ga_viet_tat} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Tên ga *</label>
            <input type="text" name="ten_ga" value={formData.ten_ga} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Tỉnh/Thành</label>
            <input type="text" name="tinh_thanh" value={formData.tinh_thanh} onChange={handleInputChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Thứ tự tuyến</label>
              <input type="number" name="thu_tu_tuyen" value={formData.thu_tu_tuyen} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Độ ưu tiên</label>
              <select name="do_uu_tien" value={formData.do_uu_tien} onChange={handleInputChange}>
                <option value="1">1 - Đầu mối</option>
                <option value="2">2 - Tỉnh lớn</option>
                <option value="3">3 - Khu vực</option>
                <option value="4">4 - Huyện</option>
                <option value="5">5 - Nhỏ</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select name="trang_thai" value={formData.trang_thai} onChange={handleInputChange}>
              <option value="hoat_dong">Hoạt động</option>
              <option value="ngung_hoat_dong">Ngừng hoạt động</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết ga">
        {selectedStation && (
          <div>
            <p><strong>Mã ga:</strong> {selectedStation.ma_ga_viet_tat}</p>
            <p><strong>Tên ga:</strong> {selectedStation.ten_ga}</p>
            <p><strong>Tỉnh/Thành:</strong> {selectedStation.tinh_thanh || '---'}</p>
            <p><strong>Thứ tự tuyến:</strong> {selectedStation.thu_tu_tuyen}</p>
            <p><strong>Độ ưu tiên:</strong> {getUuTienText(selectedStation.do_uu_tien)}</p>
            <p><strong>Trạng thái:</strong> {selectedStation.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Ngừng'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StationsManagement;