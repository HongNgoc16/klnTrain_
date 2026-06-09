import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiMapPin, FiEye, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { scheduleAPI, trainAPI, stationAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SchedulesManagement.scss';

const SchedulesManagement = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleStations, setScheduleStations] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    id_tau: '',
    id_ga_di: '',
    id_ga_den: '',
    gio_khoi_hanh: '06:00',
    gio_du_kien_den: '18:00',
    thu_trong_tuan: 'Hàng ngày'
  });
  const [stationForm, setStationForm] = useState({
    thu_tu_dung: 1,
    id_ga: '',
    gio_den: '',
    gio_di: '',
    khoang_cach_km: 0,
    thoi_gian_dung: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, trainsRes, stationsRes] = await Promise.all([
        scheduleAPI.getAll(),
        trainAPI.getAll(),
        stationAPI.getAll()
      ]);
      setSchedules(schedulesRes.data.data || []);
      setTrains(trainsRes.data.data || []);
      setStations(stationsRes.data.data || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleStations = async (id) => {
    try {
      const res = await scheduleAPI.getStations(id);
      setScheduleStations(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải ga dừng:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await scheduleAPI.create(formData);
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    try {
      await scheduleAPI.delete(deleteTarget.id_lich_chay);
      await loadData();
      setShowConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa lịch này');
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      await scheduleAPI.addStation(selectedSchedule.id_lich_chay, stationForm);
      await loadScheduleStations(selectedSchedule.id_lich_chay);
      setShowAddStationModal(false);
      resetStationForm();
    } catch (error) {
      alert('Thêm ga dừng thất bại');
    }
  };

  const handleRemoveStation = async (stationId) => {
    if (window.confirm('Xóa ga dừng này?')) {
      try {
        await scheduleAPI.removeStation(selectedSchedule.id_lich_chay, stationId);
        await loadScheduleStations(selectedSchedule.id_lich_chay);
      } catch (error) {
        alert('Xóa ga dừng thất bại');
      }
    }
  };

  const resetForm = () => {
    setSelectedSchedule(null);
    setFormData({ id_tau: '', id_ga_di: '', id_ga_den: '', gio_khoi_hanh: '06:00', gio_du_kien_den: '18:00', thu_trong_tuan: 'Hàng ngày' });
  };

  const resetStationForm = () => {
    setStationForm({ thu_tu_dung: scheduleStations.length + 1, id_ga: '', gio_den: '', gio_di: '', khoang_cach_km: 0, thoi_gian_dung: 5 });
  };

  const getThuText = (thu) => {
    const map = { 'hang_ngay': 'Hàng ngày', 'T2-T7': 'Thứ 2 - Thứ 7', 'CN': 'Chủ nhật', 'T7-CN': 'Thứ 7 - Chủ nhật' };
    return map[thu] || thu;
  };

  const columns = [
    { title: 'ID', key: 'id_lich_chay', width: '50px' },
    { title: 'Tàu', key: 'so_hieu', width: '70px' },
    { title: 'Tên tàu', key: 'ten_tau', width: '150px' },
    { title: 'Hành trình', key: 'ga_di', width: '190px', render: (_, r) => `${r.ga_di} → ${r.ga_den}` },
    { title: 'Giờ đi', key: 'gio_khoi_hanh', width: '80px' },
    { title: 'Giờ đến', key: 'gio_du_kien_den', width: '80px' },
    { title: 'Số ga dừng', key: 'so_ga_dung', width: '80px' },
    { title: 'Khoảng cách', key: 'tong_khoang_cach', width: '100px', render: (v) => v ? `${v.toLocaleString()} km` : '---' },
    { title: 'Lịch trình', key: 'thu_trong_tuan', render: (v) => getThuText(v) },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-station" onClick={() => { setSelectedSchedule(row); loadScheduleStations(row.id_lich_chay); setShowStationModal(true); }} title="Xem ga dừng"><FiMapPin /></button>
          <button className="btn-delete" onClick={() => { setDeleteTarget(row); setShowConfirm(true); }} title="Xóa"><FiTrash2 /></button>
        </div>
      )
    }
  ];

  const filteredSchedules = schedules.filter(s => 
    s.so_hieu?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.ten_tau?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="schedules-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý lịch chạy tàu</h1>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input"><FiSearch /><input type="text" placeholder="Tìm kiếm theo tàu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="stats-info">Tổng số: {schedules.length} lịch chạy</div>
      </div>

      <DataTable columns={columns} data={filteredSchedules} />

      {/* Station Detail Modal */}
      <Modal isOpen={showStationModal} onClose={() => setShowStationModal(false)} title={`Chi tiết lộ trình - ${selectedSchedule?.so_hieu} (${selectedSchedule?.ga_di} → ${selectedSchedule?.ga_den})`} size="lg">
        <div className="station-list">
          <div className="station-header">
            <h4>Các ga dừng trên hành trình</h4>
          </div>
          
          {/* Tổng quan */}
          <div className="route-summary">
            <div className="summary-item">
              <span className="summary-label">Tổng số ga dừng</span>
              <span className="summary-value">{scheduleStations.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tổng khoảng cách</span>
              <span className="summary-value">{scheduleStations[scheduleStations.length - 1]?.khoang_cach_km?.toLocaleString() || 0} km</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tổng thời gian dừng</span>
              <span className="summary-value">{scheduleStations.reduce((sum, s) => sum + (s.thoi_gian_dung || 0), 0)} phút</span>
            </div>
          </div>

          {/* Bảng ga dừng */}
          <div className="table-responsive">
            <table className="station-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Ga</th>
                  <th>Tỉnh/Thành</th>
                  <th>Giờ đến</th>
                  <th>Giờ đi</th>
                  <th>Km với ga trước</th>
                  <th>Tổng km</th>
                  <th>Dừng (phút)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {scheduleStations.map((s, idx) => (
                  <tr key={idx}>
                    <td className="stt-cell">{s.thu_tu_dung}</td>
                    <td className="station-name-cell"><strong>{s.ten_ga}</strong><br /><small className="station-code">{s.ma_ga_viet_tat}</small></td>
                    <td className="province-cell">{s.tinh_thanh || '---'}</td>
                    <td className="time-cell">{s.gio_den || '---'}</td>
                    <td className="time-cell">{s.gio_di || '---'}</td>
                    <td className="km-cell">{idx === 0 ? '0' : (s.khoang_cach_km - (scheduleStations[idx-1]?.khoang_cach_km || 0)).toLocaleString()}</td>
                    <td className="km-cell">{s.khoang_cach_km?.toLocaleString()}</td>
                    <td className="minute-cell">{s.thoi_gian_dung || 0}</td>
                    <td className="action-cell">
                      <button className="btn-delete-sm" onClick={() => handleRemoveStation(s.id_ga)} title="Xóa ga dừng"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
                {scheduleStations.length === 0 && (
                  <tr><td colSpan="9" className="empty-row">Chưa có ga dừng nào. Hãy thêm ga dừng đầu tiên.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Timeline */}
          {scheduleStations.length > 0 && (
            <div className="route-timeline">
              <div className="timeline-title">Sơ đồ hành trình</div>
              <div className="timeline">
                {scheduleStations.map((s, idx) => (
                  <div key={idx} className="timeline-node">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-station">{s.ten_ga}</div>
                      <div className="timeline-time">{s.gio_di || s.gio_den}</div>
                      <div className="timeline-km">{idx === 0 ? '0 km' : `${(s.khoang_cach_km - (scheduleStations[idx-1]?.khoang_cach_km || 0)).toLocaleString()} km`}</div>
                    </div>
                    {idx < scheduleStations.length - 1 && <div className="timeline-line"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Xóa lịch chạy" message={`Xóa lịch chạy ${deleteTarget?.so_hieu} - ${deleteTarget?.ga_di} → ${deleteTarget?.ga_den}?`} confirmText="Xóa" cancelText="Hủy" />
    </div>
  );
};

export default SchedulesManagement;