import React, { useState } from 'react';
import { FiEdit2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import './Policies.scss';

const CUSTOMERS = [
  { id: 1, ten: 'Người lớn', phan_tram_giam: 0 },
  { id: 2, ten: 'Sinh viên', phan_tram_giam: 15 },
  { id: 3, ten: 'Trẻ em (6–12 tuổi)', phan_tram_giam: 30 },
  { id: 4, ten: 'Người cao tuổi (>60 tuổi)', phan_tram_giam: 20 },
];

const CANCELS = [
  { id: 1, gio: 24, phi: 30 },
  { id: 2, gio: 12, phi: 50 },
  { id: 3, gio: 6,  phi: 70 },
  { id: 4, gio: 2,  phi: 90 },
];

const OCCASIONS = [
  { id: 1, ten: 'Ngày thường',   he_so: 1.0, tu: null,    den: null },
  { id: 2, ten: 'Cuối tuần',     he_so: 1.2, tu: null,    den: null },
  { id: 3, ten: 'Tết Nguyên Đán',he_so: 1.8, tu: '20/01', den: '20/02' },
  { id: 4, ten: 'Hè',            he_so: 1.3, tu: '01/06', den: '31/08' },
];

const SEAT_FACTORS = [
  { ten: 'Ghế cứng',            he_so: 1.0 },
  { ten: 'Ghế mềm điều hòa',    he_so: 1.5 },
  { ten: 'Giường nằm 6 chỗ',    he_so: 2.0 },
  { ten: 'Giường nằm 4 chỗ',    he_so: 2.5 },
];

const TABS = [
  { id: 'customer',  label: 'Loại khách hàng' },
  { id: 'cancel',    label: 'Hủy & hoàn tiền' },
  { id: 'occasion',  label: 'Dịp đặc biệt' },
  { id: 'base',      label: 'Giá cơ bản' },
];

function discountBadge(v) {
  if (v === 0)  return <span className="badge badge-info">Giá gốc</span>;
  if (v <= 15)  return <span className="badge badge-success">−{v}%</span>;
  if (v <= 25)  return <span className="badge badge-warning">−{v}%</span>;
  return              <span className="badge badge-danger">−{v}%</span>;
}

function cancelBadge(phi) {
  if (phi <= 30) return <span className="badge badge-success">Thấp</span>;
  if (phi <= 60) return <span className="badge badge-warning">Trung bình</span>;
  return               <span className="badge badge-danger">Cao</span>;
}

function occasionBadge(he_so) {
  const pct = he_so > 1 ? `+${((he_so - 1) * 100).toFixed(0)}%` : 'Giá gốc';
  if (he_so <= 1)   return <span className="badge badge-info">{pct}</span>;
  if (he_so < 1.5)  return <span className="badge badge-success">{pct}</span>;
  if (he_so < 1.7)  return <span className="badge badge-warning">{pct}</span>;
  return                   <span className="badge badge-danger">{pct}</span>;
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

export default function Policies() {
  const [activeTab, setActiveTab] = useState('customer');
  const [editing, setEditing] = useState(null); // 'c-1' | 'cancel-2' | 'occ-3'

  const [customers, setCustomers]   = useState(CUSTOMERS);
  const [cancels, setCancels]       = useState(CANCELS);
  const [occasions, setOccasions]   = useState(OCCASIONS);

  const stopEdit = () => setEditing(null);

  const saveCustomer = (id, val) => {
    setCustomers(prev => prev.map(p => p.id === id ? { ...p, phan_tram_giam: Math.max(0, Math.min(100, parseInt(val) || 0)) } : p));
    stopEdit();
  };
  const saveCancel = (id, val) => {
    setCancels(prev => prev.map(p => p.id === id ? { ...p, phi: Math.max(0, Math.min(100, parseInt(val) || 0)) } : p));
    stopEdit();
  };
  const saveOccasion = (id, val) => {
    setOccasions(prev => prev.map(p => p.id === id ? { ...p, he_so: Math.max(0.5, parseFloat(val) || 1) } : p));
    stopEdit();
  };

  return (
    <div className="pol-page">
      <div className="pol-page__header">
        <h1 className="pol-page__title">Chính sách giá</h1>
      </div>

      {/* Tabs */}
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
              <tr>
                <th>Đối tượng</th>
                <th>Mức giảm</th>
                <th>Phân loại</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customers.map(p => {
                const key = `c-${p.id}`;
                const isEdit = editing === key;
                return (
                  <tr key={p.id}>
                    <td className="td--name">{p.ten}</td>
                    <td>
                      {isEdit
                        ? <InlineEdit value={p.phan_tram_giam} unit="%" onSave={v => saveCustomer(p.id, v)} onCancel={stopEdit} />
                        : <span className="num">{p.phan_tram_giam}%</span>
                      }
                    </td>
                    <td>{discountBadge(p.phan_tram_giam)}</td>
                    <td><span className="status-dot" /><span className="status-text">Đang áp dụng</span></td>
                    <td className="td--action">
                      {!isEdit && (
                        <div className="action-buttons">
                          <button className="btn-edit" title="Sửa" onClick={() => setEditing(key)}><FiEdit2 /></button>
                        </div>
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
              <tr>
                <th>Thời điểm hủy</th>
                <th>Phí hủy</th>
                <th>Khách được hoàn</th>
                <th>Mức độ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cancels.map(p => {
                const key = `cancel-${p.id}`;
                const isEdit = editing === key;
                const refund = 100 - p.phi;
                return (
                  <tr key={p.id}>
                    <td>Trước <strong>{p.gio}h</strong> giờ chạy</td>
                    <td>
                      {isEdit
                        ? <InlineEdit value={p.phi} unit="%" onSave={v => saveCancel(p.id, v)} onCancel={stopEdit} />
                        : <span className="num num--danger">{p.phi}%</span>
                      }
                    </td>
                    <td><span className="num num--success">{refund}%</span></td>
                    <td>{cancelBadge(p.phi)}</td>
                    <td className="td--action">
                      {!isEdit && (
                        <div className="action-buttons">
                          <button className="btn-edit" title="Sửa" onClick={() => setEditing(key)}><FiEdit2 /></button>
                        </div>
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
              <tr>
                <th>Dịp</th>
                <th>Hệ số</th>
                <th>Tăng so với ngày thường</th>
                <th>Thời gian áp dụng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {occasions.map(p => {
                const key = `occ-${p.id}`;
                const isEdit = editing === key;
                return (
                  <tr key={p.id}>
                    <td className="td--name">{p.ten}</td>
                    <td>
                      {isEdit
                        ? <InlineEdit value={p.he_so} step={0.1} unit="x" onSave={v => saveOccasion(p.id, v)} onCancel={stopEdit} />
                        : <span className="num">{p.he_so}x</span>
                      }
                    </td>
                    <td>{occasionBadge(p.he_so)}</td>
                    <td className="td--muted">{p.tu ? `${p.tu} → ${p.den}` : 'Cả năm'}</td>
                    <td className="td--action">
                      {!isEdit && (
                        <div className="action-buttons">
                          <button className="btn-edit" title="Sửa" onClick={() => setEditing(key)}><FiEdit2 /></button>
                        </div>
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
              Giá vé = Khoảng cách (km) × <strong>1.500đ</strong> × Hệ số loại ghế × Hệ số dịp − Chiết khấu đối tượng
            </p>
          </div>

          <div className="base-cards">
            <div className="base-card">
              <p className="base-card__label">Đơn giá cơ bản</p>
              <p className="base-card__value">1.500đ</p>
              <p className="base-card__note">/ km / khách</p>
            </div>
            <div className="base-card">
              <p className="base-card__label">Áp dụng từ</p>
              <p className="base-card__value base-card__value--md">01/01/2024</p>
              <p className="base-card__note">Chưa có ngày hết hạn</p>
            </div>
          </div>

          <p className="pol-section__label" style={{ marginTop: 28 }}>Hệ số loại ghế / giường</p>
          <table className="pol-table">
            <thead>
              <tr>
                <th>Loại ghế</th>
                <th>Hệ số</th>
                <th>Ví dụ giá (500 km)</th>
              </tr>
            </thead>
            <tbody>
              {SEAT_FACTORS.map((s, i) => (
                <tr key={i}>
                  <td className="td--name">{s.ten}</td>
                  <td><span className="num">{s.he_so}x</span></td>
                  <td className="td--muted">{(500 * 1500 * s.he_so).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}