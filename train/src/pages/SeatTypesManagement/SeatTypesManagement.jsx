import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiGrid, FiLayers } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { seatTypeAPI, carriageTypeAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SeatTypesManagement.scss';

const SeatTypesManagement = () => {
  const [loading, setLoading] = useState(true);
  const [seatTypes, setSeatTypes] = useState([]);
  const [carriageTypes, setCarriageTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSeatConfigModal, setShowSeatConfigModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedCarriage, setSelectedCarriage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [seatConfig, setSeatConfig] = useState([]);
  const [formData, setFormData] = useState({
    ma_loai_ghe: '',
    id_loai_toa: '',
    ten_loai_ghe: '',
    he_so_gia: 1.0,
    trang_thai: 'dang_ban'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [seatRes, carriageRes] = await Promise.all([
        seatTypeAPI.getAll(),
        carriageTypeAPI.getAll()
      ]);
      setSeatTypes(seatRes.data.data || []);
      setCarriageTypes(carriageRes.data.data || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      // Mock data
      setSeatTypes([
        { id_loai_ghe: 1, ma_loai_ghe: 'GN4T', ten_loai_ghe: 'Giường nằm khoang 4 - tầng trên', he_so_gia: 1.55, trang_thai: 'dang_ban', ten_loai_toa: 'Giường nằm khoang 4 điều hòa' },
        { id_loai_ghe: 2, ma_loai_ghe: 'GN4G', ten_loai_ghe: 'Giường nằm khoang 4 - tầng giữa', he_so_gia: 1.70, trang_thai: 'dang_ban', ten_loai_toa: 'Giường nằm khoang 4 điều hòa' },
        { id_loai_ghe: 3, ma_loai_ghe: 'GN4D', ten_loai_ghe: 'Giường nằm khoang 4 - tầng dưới', he_so_gia: 1.85, trang_thai: 'dang_ban', ten_loai_toa: 'Giường nằm khoang 4 điều hòa' }
      ]);
      setCarriageTypes([
        { id_loai_toa: 1, ma_loai_toa: 'GN4_DH', ten_loai_toa: 'Giường nằm khoang 4 điều hòa', so_cho_toi_da: 28 },
        { id_loai_toa: 2, ma_loai_toa: 'GN6_DH', ten_loai_toa: 'Giường nằm khoang 6 điều hòa', so_cho_toi_da: 42 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSeatConfiguration = async (carriageId) => {
    try {
      const res = await seatTypeAPI.getConfiguration(carriageId);
      setSeatConfig(res.data.data || []);
      setSelectedCarriage(carriageTypes.find(c => c.id_loai_toa === carriageId));
      setShowSeatConfigModal(true);
    } catch (error) {
      console.error('Lỗi tải cấu hình ghế:', error);
      setSeatConfig([
        { so_ghe_trong_toa: 1, vi_tri: 'Khoang 1 - A - Trên', tang: 'Tren', khoang_so: 1, ben: 'A', ten_loai_ghe: 'Giường nằm khoang 4 - tầng trên', he_so_gia: 1.55 },
        { so_ghe_trong_toa: 2, vi_tri: 'Khoang 1 - A - Dưới', tang: 'Duoi', khoang_so: 1, ben: 'A', ten_loai_ghe: 'Giường nằm khoang 4 - tầng dưới', he_so_gia: 1.85 }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSeat) {
        await seatTypeAPI.update(selectedSeat.id_loai_ghe, formData);
      } else {
        await seatTypeAPI.create(formData);
      }
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    try {
      await seatTypeAPI.delete(deleteTarget.id_loai_ghe);
      await loadData();
      setShowConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      alert('Không thể xóa loại ghế này');
    }
  };

  const resetForm = () => {
    setSelectedSeat(null);
    setFormData({
      ma_loai_ghe: '',
      id_loai_toa: '',
      ten_loai_ghe: '',
      he_so_gia: 1.0,
      trang_thai: 'dang_ban'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'dang_ban') return { class: 'badge-success', text: 'Đang bán' };
    return { class: 'badge-danger', text: 'Ngừng bán' };
  };

  const columns = [
    { title: 'Mã loại ghế', key: 'ma_loai_ghe', width: '100px' },
    { title: 'Tên loại ghế', key: 'ten_loai_ghe', width: '250px' },
    { title: 'Loại toa', key: 'ten_loai_toa', width: '200px' },
    { title: 'Hệ số giá', key: 'he_so_gia', render: (v) => `${v}x` },
    { title: 'Trạng thái', key: 'trang_thai', render: (v) => {
      const status = getStatusBadge(v);
      return <span className={`badge ${status.class}`}>{status.text}</span>;
    }},
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-edit" onClick={() => { setSelectedSeat(row); setFormData(row); setShowModal(true); }}><FiEdit /></button>
          <button className="btn-delete" onClick={() => { setDeleteTarget(row); setShowConfirm(true); }}><FiTrash2 /></button>
        </div>
      )
    }
  ];

  const configColumns = [
    { title: 'Số ghế', key: 'so_ghe_trong_toa', width: '80px' },
    { title: 'Vị trí', key: 'vi_tri', width: '200px' },
    { title: 'Tầng', key: 'tang', width: '80px', render: (v) => v === 'Tren' ? 'Trên' : v === 'Duoi' ? 'Dưới' : v === 'Giua' ? 'Giữa' : v },
    { title: 'Khoang', key: 'khoang_so', width: '80px' },
    { title: 'Bên', key: 'ben', width: '60px' },
    { title: 'Loại ghế', key: 'ten_loai_ghe', width: '200px' },
    { title: 'Hệ số', key: 'he_so_gia', render: (v) => `${v}x` }
  ];

  const filteredSeats = seatTypes.filter(s => 
    s.ten_loai_ghe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ma_loai_ghe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="seat-types-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý loại ghế</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Thêm loại ghế
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input"><FiSearch /><input type="text" placeholder="Tìm kiếm loại ghế..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="stats-info">Tổng số: {seatTypes.length} loại ghế</div>
      </div>

      <DataTable columns={columns} data={filteredSeats} />

      {/* Thêm nút xem cấu hình ghế cho từng loại toa */}
      <div className="carriage-config-section">
        <h3>Cấu hình ghế theo loại toa</h3>
        <div className="carriage-config-grid">
          {carriageTypes.map(carriage => (
            <div key={carriage.id_loai_toa} className="carriage-config-card" onClick={() => loadSeatConfiguration(carriage.id_loai_toa)}>
              <div className="carriage-icon"><FiLayers /></div>
              <div className="carriage-info">
                <div className="carriage-name">{carriage.ten_loai_toa}</div>
                <div className="carriage-code">{carriage.ma_loai_toa}</div>
                <div className="carriage-seats">Số chỗ tối đa: {carriage.so_cho_toi_da}</div>
              </div>
              <button className="btn-config">Xem cấu hình</button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal cấu hình ghế trong toa */}
      <Modal isOpen={showSeatConfigModal} onClose={() => setShowSeatConfigModal(false)} title={`Cấu hình ghế - ${selectedCarriage?.ten_loai_toa}`} size="lg">
        <div className="seat-config">
          <div className="config-stats">
            <span>Tổng số ghế: {seatConfig.length}</span>
            <span>Số chỗ tối đa: {selectedCarriage?.so_cho_toi_da}</span>
          </div>
          <div className="table-responsive">
            <table className="config-table">
              <thead>
                <tr><th>Số ghế</th><th>Vị trí</th><th>Khoang</th><th>Bên</th><th>Tầng</th><th>Loại ghế</th><th>Hệ số</th></tr>
              </thead>
              <tbody>
                {seatConfig.map((seat, idx) => (
                  <tr key={idx}>
                    <td>{seat.so_ghe_trong_toa}</td>
                    <td className="td--name">{seat.vi_tri || '---'}</td>
                    <td>{seat.khoang_so || '---'}</td>
                    <td>{seat.ben || '---'}</td>
                    <td>{seat.tang === 'Tren' ? 'Trên' : seat.tang === 'Duoi' ? 'Dưới' : seat.tang === 'Giua' ? 'Giữa' : '---'}</td>
                    <td className="td--name">{seat.ten_loai_ghe}</td>
                    <td>{seat.he_so_gia}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedSeat ? 'Sửa loại ghế' : 'Thêm loại ghế'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Mã loại ghế *</label><input type="text" value={formData.ma_loai_ghe} onChange={(e) => setFormData({...formData, ma_loai_ghe: e.target.value.toUpperCase()})} required /></div>
          <div className="form-group"><label>Tên loại ghế *</label><input type="text" value={formData.ten_loai_ghe} onChange={(e) => setFormData({...formData, ten_loai_ghe: e.target.value})} required /></div>
          <div className="form-group"><label>Loại toa</label><select value={formData.id_loai_toa} onChange={(e) => setFormData({...formData, id_loai_toa: e.target.value})} required>
            <option value="">-- Chọn loại toa --</option>{carriageTypes.map(c => <option key={c.id_loai_toa} value={c.id_loai_toa}>{c.ten_loai_toa}</option>)}
          </select></div>
          <div className="form-row"><div className="form-group"><label>Hệ số giá</label><input type="number" step="0.05" value={formData.he_so_gia} onChange={(e) => setFormData({...formData, he_so_gia: e.target.value})} /></div>
          <div className="form-group"><label>Trạng thái</label><select value={formData.trang_thai} onChange={(e) => setFormData({...formData, trang_thai: e.target.value})}><option value="dang_ban">Đang bán</option><option value="ngung_ban">Ngừng bán</option></select></div></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Xóa loại ghế" message={`Xóa loại ghế ${deleteTarget?.ten_loai_ghe}?`} confirmText="Xóa" cancelText="Hủy" />
    </div>
  );
};

export default SeatTypesManagement;