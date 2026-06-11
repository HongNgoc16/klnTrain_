import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiPlus } from 'react-icons/fi';
import { policyAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Modal from '../../components/Common/Modal';
import AlertDialog from '../../components/Common/AlertDialog';
import './Policies.scss';

function discountBadge(v) {
  if (v === 0) return <span className="badge badge-info">Giá gốc</span>;
  if (v <= 15) return <span className="badge badge-success">−{v}%</span>;
  if (v <= 25) return <span className="badge badge-warning">−{v}%</span>;
  return <span className="badge badge-danger">−{v}%</span>;
}

function cancelBadge(phi) {
  if (phi <= 30) return <span className="badge badge-success">Thấp</span>;
  if (phi <= 60) return <span className="badge badge-warning">Trung bình</span>;
  return <span className="badge badge-danger">Cao</span>;
}

function occasionBadge(he_so) {
  const pct = he_so > 1 ? `+${((he_so - 1) * 100).toFixed(0)}%` : 'Giá gốc';
  if (he_so <= 1) return <span className="badge badge-info">{pct}</span>;
  if (he_so < 1.5) return <span className="badge badge-success">{pct}</span>;
  if (he_so < 1.7) return <span className="badge badge-warning">{pct}</span>;
  return <span className="badge badge-danger">{pct}</span>;
}

function InlineEdit({ value, step, unit, onSave, onCancel }) {
  const [val, setVal] = useState(value);
  return (
    <div className="inline-edit">
      <input
        type="number"
        step={step || 1}
        value={val}
        autoFocus
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(val);
          if (e.key === 'Escape') onCancel();
        }}
      />
      <span className="inline-edit__unit">{unit}</span>
      <div className="action-buttons">
        <button className="btn-save" title="Lưu" onClick={() => onSave(val)}><FiSave /></button>
        <button className="btn-cancel-edit" title="Hủy" onClick={onCancel}><FiX /></button>
      </div>
    </div>
  );
}

// Định nghĩa TABS ở đây
const TABS = [
  { id: 'customer', label: 'Loại khách hàng' },
  { id: 'cancel', label: 'Hủy & hoàn tiền' },
  { id: 'occasion', label: 'Dịp đặc biệt' },
  { id: 'base', label: 'Giá cơ bản' },
];

export default function Policies() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customer');
  const [editing, setEditing] = useState(null);

  // State từ database
  const [customers, setCustomers] = useState([]);
  const [cancels, setCancels] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [basePrice, setBasePrice] = useState({ don_gia: 1500, tu_ngay: '2024-01-01' });
  const [seatFactors, setSeatFactors] = useState([]);

  // State cho thêm mới chính sách
  const [showAddModal, setShowAddModal] = useState(null); // 'customer' | 'cancel' | 'occasion' | null
  const [customerForm, setCustomerForm] = useState({ ten_chinh_sach: '', loai_hanh_khach: 'nguoi_lon', phan_tram_giam: '', tu_ngay: '', den_ngay: '' });
  const [cancelForm, setCancelForm] = useState({ gio_truoc_gio_chay: '', phi_huy: '' });
  const [occasionForm, setOccasionForm] = useState({ ten_dip: '', ngay_bat_dau: '', ngay_ket_thuc: '', he_so_tang: '', don_gia_km_goc: 540 });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const showAlert = (message, type = 'error', title = type === 'error' ? 'Lỗi' : 'Thành công') => {
    setAlertDialog({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const [customerRes, cancelRes, occasionRes, baseRes, seatRes] = await Promise.all([
        policyAPI.getCustomerDiscounts(),
        policyAPI.getCancelFees(),
        policyAPI.getOccasionPolicies(),
        policyAPI.getBasePrice(),
        policyAPI.getSeatFactors()
      ]);

      setCustomers(customerRes.data.data || []);
      setCancels(cancelRes.data.data || []);
      setOccasions(occasionRes.data.data || []);
      setBasePrice(baseRes.data.data || { don_gia: 1500, tu_ngay: '2024-01-01' });
      setSeatFactors(seatRes.data.data || []);
    } catch (error) {
      console.error('Lỗi tải chính sách:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopEdit = () => setEditing(null);

  const saveCustomer = async (id, val) => {
    try {
      await policyAPI.updateCustomerDiscount(id, { phan_tram_giam: val });
      setCustomers(prev => prev.map(p => p.id_chinh_sach === id ? { ...p, phan_tram_giam: val } : p));
      showAlert('Cập nhật thành công', 'success');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      showAlert('Cập nhật thất bại', 'error');
    }
    stopEdit();
  };

  const saveCancel = async (id, val) => {
    try {
      await policyAPI.updateCancelFee(id, { phi_huy: val });
      setCancels(prev => prev.map(p => p.id_cs_huy === id ? { ...p, phi_huy: val } : p));
      showAlert('Cập nhật thành công', 'success');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      showAlert('Cập nhật thất bại', 'error');
    }
    stopEdit();
  };

  const saveOccasion = async (id, val) => {
    try {
      await policyAPI.updateOccasionPolicy(id, { he_so_tang: val });
      setOccasions(prev => prev.map(p => p.id_bieu_gia === id ? { ...p, he_so_tang: val } : p));
      showAlert('Cập nhật thành công', 'success');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      showAlert('Cập nhật thất bại', 'error');
    }
    stopEdit();
  };

  const closeAddModal = () => setShowAddModal(null);

  const createCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await policyAPI.createCustomerDiscount(customerForm);
      setCustomers(prev => [...prev, res.data.data]);
      setCustomerForm({ ten_chinh_sach: '', loai_hanh_khach: 'nguoi_lon', phan_tram_giam: '', tu_ngay: '', den_ngay: '' });
      closeAddModal();
      showAlert('Thêm chính sách thành công', 'success');
    } catch (error) {
      console.error('Lỗi thêm chính sách:', error);
      showAlert('Thêm chính sách thất bại', 'error');
    }
  };

  const createCancel = async (e) => {
    e.preventDefault();
    try {
      const res = await policyAPI.createCancelFee(cancelForm);
      setCancels(prev => [...prev, res.data.data]);
      setCancelForm({ gio_truoc_gio_chay: '', phi_huy: '' });
      closeAddModal();
      showAlert('Thêm chính sách thành công', 'success');
    } catch (error) {
      console.error('Lỗi thêm chính sách:', error);
      showAlert('Thêm chính sách thất bại', 'error');
    }
  };

  const createOccasion = async (e) => {
    e.preventDefault();
    try {
      const res = await policyAPI.createOccasionPolicy(occasionForm);
      setOccasions(prev => [...prev, res.data.data]);
      setOccasionForm({ ten_dip: '', ngay_bat_dau: '', ngay_ket_thuc: '', he_so_tang: '', don_gia_km_goc: 540 });
      closeAddModal();
      showAlert('Thêm chính sách thành công', 'success');
    } catch (error) {
      console.error('Lỗi thêm chính sách:', error);
      showAlert('Thêm chính sách thất bại', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pol-page">
      <div className="page-header">
        <h1 className="page-title">Chính sách giá</h1>
      </div>

      <div className="pol-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`pol-tab${activeTab === t.id ? ' pol-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Loại khách hàng */}
      {activeTab === 'customer' && (
        <div className="pol-section">
          <div className="pol-section__header">
            <p className="pol-section__label">Chiết khấu theo đối tượng khách</p>
            <button className="btn-primary" onClick={() => setShowAddModal('customer')}><FiPlus /> Thêm chính sách</button>
          </div>
          <table className="pol-table">
            <thead>
              <tr><th>Đối tượng</th><th>Mức giảm</th><th>Phân loại</th><th>Trạng thái</th><th /></tr>
            </thead>
            <tbody>
              {customers.map(p => {
                const key = `c-${p.id_chinh_sach}`;
                const isEdit = editing === key;
                return (
                  <tr key={p.id_chinh_sach}>
                    <td className="td--name">{p.ten_chinh_sach}</td>
                    <td>
                      {isEdit
                        ? <InlineEdit value={p.phan_tram_giam} unit="%" onSave={v => saveCustomer(p.id_chinh_sach, v)} onCancel={stopEdit} />
                        : <span className="num">{p.phan_tram_giam}%</span>
                      }
                    </td>
                    <td>{discountBadge(p.phan_tram_giam)}</td>
                    <td><span className="status-dot" /><span className="status-text">Đang áp dụng</span></td>
                    <td className="td-action">
                      {!isEdit && (
                        <button className="btn-edit" onClick={() => setEditing(key)}><FiEdit /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Hủy & hoàn tiền */}
      {activeTab === 'cancel' && (
        <div className="pol-section">
          <div className="pol-section__header">
            <p className="pol-section__label">Phí hủy vé theo thời điểm</p>
            <button className="btn-primary" onClick={() => setShowAddModal('cancel')}><FiPlus /> Thêm chính sách</button>
          </div>
          <table className="pol-table">
            <thead>
              <tr><th>Thời điểm hủy</th><th>Phí hủy</th><th>Khách được hoàn</th><th>Mức độ</th><th /></tr>
            </thead>
            <tbody>
              {cancels.map(p => {
                const key = `cancel-${p.id_cs_huy}`;
                const isEdit = editing === key;
                const refund = 100 - p.phi_huy;
                return (
                  <tr key={p.id_cs_huy}>
                    <td>Trước <strong>{p.gio_truoc_gio_chay}h</strong> giờ chạy</td>
                    <td>
                      {isEdit
                        ? <InlineEdit value={p.phi_huy} unit="%" onSave={v => saveCancel(p.id_cs_huy, v)} onCancel={stopEdit} />
                        : <span className="num num--danger">{p.phi_huy}%</span>
                      }
                    </td>
                    <td><span className="num num--success">{refund}%</span></td>
                    <td>{cancelBadge(p.phi_huy)}</td>
                    <td className="td-action">
                      {!isEdit && (
                        <button className="btn-edit" onClick={() => setEditing(key)}><FiEdit /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Dịp đặc biệt */}
      {activeTab === 'occasion' && (
        <div className="pol-section">
          <div className="pol-section__header">
            <p className="pol-section__label">Hệ số giá theo dịp</p>
            <button className="btn-primary" onClick={() => setShowAddModal('occasion')}><FiPlus /> Thêm biểu giá</button>
          </div>
          <table className="pol-table">
            <thead>
              <tr><th>Dịp</th><th>Hệ số</th><th>Tăng so với ngày thường</th><th>Thời gian áp dụng</th><th /></tr>
            </thead>
            <tbody>
              {occasions.map(p => {
                const key = `occ-${p.id_bieu_gia}`;
                const isEdit = editing === key;
                return (
                  <tr key={p.id_bieu_gia}>
                    <td className="td--name">{p.ten_dip}</td>
                    <td>
                      {isEdit
                        ? <InlineEdit value={p.he_so_tang} step={0.1} unit="x" onSave={v => saveOccasion(p.id_bieu_gia, v)} onCancel={stopEdit} />
                        : <span className="num">{p.he_so_tang}x</span>
                      }
                    </td>
                    <td>{occasionBadge(p.he_so_tang)}</td>
                    <td className="td--muted">{p.ngay_bat_dau ? `${p.ngay_bat_dau} → ${p.ngay_ket_thuc}` : 'Cả năm'}</td>
                    <td className="td-action">
                      {!isEdit && (
                        <button className="btn-edit" onClick={() => setEditing(key)}><FiEdit /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Giá cơ bản */}
      {activeTab === 'base' && (
        <div className="pol-section">
          <div className="formula-box">
            <span className="formula-box__label">Công thức tính giá vé</span>
            <p className="formula-box__text">
              Giá vé = Khoảng cách (km) × <strong>{basePrice.don_gia?.toLocaleString()}đ</strong> × Hệ số loại ghế × Hệ số dịp − Chiết khấu đối tượng
            </p>
          </div>

          <div className="base-cards">
            <div className="base-card">
              <p className="base-card__label">Đơn giá cơ bản</p>
              <p className="base-card__value">{basePrice.don_gia?.toLocaleString()}đ</p>
              <p className="base-card__note">/ km / khách</p>
            </div>
            <div className="base-card">
              <p className="base-card__label">Áp dụng từ</p>
              <p className="base-card__value base-card__value--md">{basePrice.tu_ngay ? new Date(basePrice.tu_ngay).toLocaleDateString('vi-VN') : '01/01/2024'}</p>
              <p className="base-card__note">Chưa có ngày hết hạn</p>
            </div>
          </div>

          <p className="pol-section__label" style={{ marginTop: 28 }}>Hệ số loại ghế / giường</p>
          <table className="pol-table">
            <thead>
              <tr><th>Loại ghế</th><th>Hệ số</th><th>Ví dụ giá (500 km)</th></tr>
            </thead>
            <tbody>
              {seatFactors.map((s, i) => (
                <tr key={i}>
                  <td className="td--name">{s.ten_loai_ghe}</td>
                  <td><span className="num">{s.he_so_gia}x</span></td>
                  <td className="td--muted">{(500 * basePrice.don_gia * s.he_so_gia).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Thêm chính sách giá theo loại khách hàng */}
      <Modal isOpen={showAddModal === 'customer'} onClose={closeAddModal} title="Thêm chính sách giá">
        <form onSubmit={createCustomer}>
          <div className="form-group">
            <label>Tên chính sách *</label>
            <input type="text" value={customerForm.ten_chinh_sach} onChange={e => setCustomerForm({ ...customerForm, ten_chinh_sach: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Loại hành khách *</label>
              <select value={customerForm.loai_hanh_khach} onChange={e => setCustomerForm({ ...customerForm, loai_hanh_khach: e.target.value })}>
                <option value="nguoi_lon">Người lớn</option>
                <option value="tre_em">Trẻ em</option>
                <option value="nguoi_cao_tuoi">Người cao tuổi</option>
                <option value="sinh_vien">Học sinh, sinh viên</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mức giảm (%) *</label>
              <input type="number" step="0.01" min="0" max="100" value={customerForm.phan_tram_giam} onChange={e => setCustomerForm({ ...customerForm, phan_tram_giam: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Áp dụng từ ngày</label>
              <input type="date" value={customerForm.tu_ngay} onChange={e => setCustomerForm({ ...customerForm, tu_ngay: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Đến ngày</label>
              <input type="date" value={customerForm.den_ngay} onChange={e => setCustomerForm({ ...customerForm, den_ngay: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeAddModal}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Thêm chính sách hủy vé */}
      <Modal isOpen={showAddModal === 'cancel'} onClose={closeAddModal} title="Thêm chính sách hủy vé">
        <form onSubmit={createCancel}>
          <div className="form-row">
            <div className="form-group">
              <label>Trước giờ chạy (giờ) *</label>
              <input type="number" min="0" value={cancelForm.gio_truoc_gio_chay} onChange={e => setCancelForm({ ...cancelForm, gio_truoc_gio_chay: e.target.value })} required />
              <small className="hint">VD: 24 nghĩa là từ 24 giờ trở lên trước giờ chạy</small>
            </div>
            <div className="form-group">
              <label>Phí hủy (%) *</label>
              <input type="number" step="0.01" min="0" max="100" value={cancelForm.phi_huy} onChange={e => setCancelForm({ ...cancelForm, phi_huy: e.target.value })} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeAddModal}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Thêm biểu giá theo dịp */}
      <Modal isOpen={showAddModal === 'occasion'} onClose={closeAddModal} title="Thêm biểu giá theo dịp">
        <form onSubmit={createOccasion}>
          <div className="form-group">
            <label>Tên dịp *</label>
            <input type="text" value={occasionForm.ten_dip} onChange={e => setOccasionForm({ ...occasionForm, ten_dip: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Từ ngày *</label>
              <input type="date" value={occasionForm.ngay_bat_dau} onChange={e => setOccasionForm({ ...occasionForm, ngay_bat_dau: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Đến ngày *</label>
              <input type="date" value={occasionForm.ngay_ket_thuc} onChange={e => setOccasionForm({ ...occasionForm, ngay_ket_thuc: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Hệ số tăng giá *</label>
              <input type="number" step="0.1" min="0" value={occasionForm.he_so_tang} onChange={e => setOccasionForm({ ...occasionForm, he_so_tang: e.target.value })} required />
              <small className="hint">VD: 1.3 nghĩa là tăng 30% so với giá thường</small>
            </div>
            <div className="form-group">
              <label>Đơn giá/km gốc</label>
              <input type="number" step="0.01" min="0" value={occasionForm.don_gia_km_goc} onChange={e => setOccasionForm({ ...occasionForm, don_gia_km_goc: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeAddModal}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu</button>
          </div>
        </form>
      </Modal>

      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
}