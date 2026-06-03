import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';
import { policyAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
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
        <button className="btn-view" onClick={() => handleView(row)} title="Xem chi tiết">
                    <FiEye />
        </button>
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
      alert('Cập nhật thành công');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Cập nhật thất bại');
    }
    stopEdit();
  };

  const saveCancel = async (id, val) => {
    try {
      await policyAPI.updateCancelFee(id, { phi_huy: val });
      setCancels(prev => prev.map(p => p.id_cs_huy === id ? { ...p, phi_huy: val } : p));
      alert('Cập nhật thành công');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Cập nhật thất bại');
    }
    stopEdit();
  };

  const saveOccasion = async (id, val) => {
    try {
      await policyAPI.updateOccasionPolicy(id, { he_so_tang: val });
      setOccasions(prev => prev.map(p => p.id_bieu_gia === id ? { ...p, he_so_tang: val } : p));
      alert('Cập nhật thành công');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Cập nhật thất bại');
    }
    stopEdit();
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
          <p className="pol-section__label">Chiết khấu theo đối tượng khách</p>
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
          <p className="pol-section__label">Phí hủy vé theo thời điểm</p>
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
          <p className="pol-section__label">Hệ số giá theo dịp</p>
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
    </div>
  );
}