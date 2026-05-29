import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import { scheduleAPI, trainAPI, stationAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './SchedulesManagement.scss';

const SchedulesManagement = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedScheduleStations, setSelectedScheduleStations] = useState([]);
  const [formData, setFormData] = useState({
    ma_tau: '',
    ma_ga_di: '',
    ma_ga_den: '',
    gio_khoi_hanh: '06:00',
    gio_du_kien_den: '18:00',
    thu_trong_tuan: 'Hàng ngày'
  });
  const [stationForm, setStationForm] = useState({
    thu_tu_dung: 1,
    ma_ga: '',
    gio_den: '',
    gio_di: '',
    khoang_cach_km: '',
    thoi_gian_dung: 0
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

  const loadScheduleStations = async (ma_lich_chay) => {
    try {
      const res = await scheduleAPI.getStations(ma_lich_chay);
      setSelectedScheduleStations(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tải ga dừng:', error);
    }
  };

  const handleViewStations = (schedule) => {
    setSelectedSchedule(schedule);
    loadScheduleStations(schedule.ma_lich_chay);
    setShowStationModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSchedule) {
        await scheduleAPI.update(selectedSchedule.ma_lich_chay, formData);
        alert('Cập nhật thành công!');
      } else {
        await scheduleAPI.create(formData);
        alert('Thêm lịch chạy thành công!');
      }
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Có lỗi xảy ra!');
    }
  };

  const resetForm = () => {
    setSelectedSchedule(null);
    setFormData({
      ma_tau: '',
      ma_ga_di: '',
      ma_ga_den: '',
      gio_khoi_hanh: '06:00',
      gio_du_kien_den: '18:00',
      thu_trong_tuan: 'Hàng ngày'
    });
  };

  const handleDelete = async (schedule) => {
    if (window.confirm(`Xóa lịch chạy ${schedule.so_hieu_tau} - ${schedule.ga_di} → ${schedule.ga_den}?`)) {
      await scheduleAPI.delete(schedule.ma_lich_chay);
      await loadData();
    }
  };

  const getThuText = (thu) => {
    const map = {
      'Hàng ngày': 'Hàng ngày',
      'T2-T7': 'Thứ 2 - Thứ 7',
      'CN': 'Chủ nhật',
      'T7-CN': 'Thứ 7 - Chủ nhật'
    };
    return map[thu] || thu;
  };

  const columns = [
    { title: 'ID', key: 'ma_lich_chay', width: '60px' },
    { title: 'Tàu', key: 'so_hieu_tau', width: '80px' },
    { title: 'Tên tàu', key: 'ten_tau', width: '150px' },
    { title: 'Hành trình', key: 'ga_di', width: '200px', render: (_, row) => `${row.ga_di} → ${row.ga_den}` },
    { title: 'Giờ đi', key: 'gio_khoi_hanh', width: '80px' },
    { title: 'Giờ đến', key: 'gio_du_kien_den', width: '80px' },
    { title: 'Số ga dừng', key: 'so_ga_dung', width: '100px' },
    { title: 'Khoảng cách', key: 'tong_khoang_cach', width: '100px', render: (v) => v ? `${v.toLocaleString()} km` : '---' },
    { title: 'Lịch trình', key: 'thu_trong_tuan', render: (v) => getThuText(v) },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => { setSelectedSchedule(row); setFormData(row); setShowModal(true); }} title="Sửa"><FiEdit /></button>
          <button className="btn-station" onClick={() => handleViewStations(row)} title="Quản lý ga dừng"><FiMapPin /></button>
          <button className="btn-delete" onClick={() => handleDelete(row)} title="Xóa"><FiTrash2 /></button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="schedules-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý lịch chạy tàu</h1>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> Thêm lịch chạy
        </button>
      </div>

      <DataTable columns={columns} data={schedules} />

      {/* Add/Edit Schedule Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedSchedule ? 'Sửa lịch chạy' : 'Thêm lịch chạy'} size="md">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chọn tàu *</label>
            <select value={formData.ma_tau} onChange={(e) => setFormData({...formData, ma_tau: e.target.value})} required>
              <option value="">-- Chọn tàu --</option>
              {trains.map(t => <option key={t.ma_tau} value={t.ma_tau}>{t.so_hieu} - {t.ten_tau || t.so_hieu}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ga đi *</label>
              <select value={formData.ma_ga_di} onChange={(e) => setFormData({...formData, ma_ga_di: e.target.value})} required>
                <option value="">-- Chọn ga --</option>
                {stations.map(s => <option key={s.ma_ga} value={s.ma_ga}>{s.ten_ga}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ga đến *</label>
              <select value={formData.ma_ga_den} onChange={(e) => setFormData({...formData, ma_ga_den: e.target.value})} required>
                <option value="">-- Chọn ga --</option>
                {stations.map(s => <option key={s.ma_ga} value={s.ma_ga}>{s.ten_ga}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Giờ khởi hành</label><input type="time" value={formData.gio_khoi_hanh} onChange={(e) => setFormData({...formData, gio_khoi_hanh: e.target.value})} /></div>
            <div className="form-group"><label>Giờ dự kiến đến</label><input type="time" value={formData.gio_du_kien_den} onChange={(e) => setFormData({...formData, gio_du_kien_den: e.target.value})} /></div>
          </div>
          <div className="form-group">
            <label>Ngày chạy</label>
            <select value={formData.thu_trong_tuan} onChange={(e) => setFormData({...formData, thu_trong_tuan: e.target.value})}>
              <option value="Hàng ngày">Hàng ngày</option><option value="T2-T7">Thứ 2 - Thứ 7</option><option value="CN">Chủ nhật</option><option value="T7-CN">Thứ 7 - Chủ nhật</option>
            </select>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button><button type="submit" className="btn-primary">Lưu</button></div>
        </form>
      </Modal>

      {/* Station Management Modal */}
      <Modal isOpen={showStationModal} onClose={() => setShowStationModal(false)} title={`Quản lý ga dừng - ${selectedSchedule?.so_hieu_tau} ${selectedSchedule?.ga_di} → ${selectedSchedule?.ga_den}`} size="lg">
        <div className="station-list">
          <h4>Danh sách ga dừng</h4>
          <table className="station-table">
            <thead><tr><th>STT</th><th>Ga</th><th>Giờ đến</th><th>Giờ đi</th><th>Khoảng cách (km)</th><th>Dừng (phút)</th></tr></thead>
            <tbody>
              {selectedScheduleStations.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.thu_tu_dung}</td><td><strong>{s.ten_ga}</strong><br /><small>{s.tinh_thanh}</small></td>
                  <td>{s.gio_den}</td><td>{s.gio_di}</td><td>{s.khoang_cach_km?.toLocaleString()}</td><td>{s.thoi_gian_dung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default SchedulesManagement;