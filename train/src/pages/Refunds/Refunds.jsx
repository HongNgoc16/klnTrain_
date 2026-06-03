import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { refundAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Refunds.scss';

const Refunds = () => {
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await refundAPI.getAll();
      console.log('📦 Refunds data:', res.data);
      
      let refundsData = res.data.data || [];
      
      // Format dữ liệu
      refundsData = refundsData.map(refund => ({
        id: refund.id_hoan || refund.id,
        ma_ve: refund.id_ve,
        ma_giao_dich: refund.ma_giao_dich,
        khach_hang: refund.ho_ten || refund.khach_hang,
        chuyen_tau: refund.so_hieu || refund.chuyen_tau,
        ngay_mua: refund.ngay_mua,
        ngay_huy: refund.ngay_huy ? new Date(refund.ngay_huy).toLocaleDateString('vi-VN') : '---',
        tien_goc: refund.tien_goc,
        phi_huy: refund.phi_huy,
        tien_hoan: refund.tien_hoan,
        ly_do: refund.ly_do,
        trang_thai: refund.trang_thai_hoan || refund.trang_thai,
        thoi_gian_hoan: refund.thoi_gian_hoan
      }));
      
      setRefunds(refundsData);
    } catch (error) {
      console.error('Lỗi tải hoàn tiền:', error);
      // Mock data khi lỗi
      setRefunds([
        { id: 1, ma_ve: 'V001', khach_hang: 'Nguyễn Văn A', chuyen_tau: 'SE1', ngay_huy: '2024-01-12', tien_goc: 1250000, phi_huy: 125000, tien_hoan: 1125000, ly_do: 'Thay đổi kế hoạch', trang_thai: 'completed' },
        { id: 2, ma_ve: 'V002', khach_hang: 'Trần Thị B', chuyen_tau: 'SE2', ngay_huy: '2024-01-08', tien_goc: 890000, phi_huy: 44500, tien_hoan: 845500, ly_do: 'Tàu bị hoãn', trang_thai: 'completed' },
        { id: 3, ma_ve: 'V003', khach_hang: 'Lê Văn C', chuyen_tau: 'TN1', ngay_huy: '2024-01-16', tien_goc: 450000, phi_huy: 22500, tien_hoan: 427500, ly_do: 'Đặt nhầm ngày', trang_thai: 'pending' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRefund = (refund) => {
    if (refund.trang_thai !== 'pending' && refund.trang_thai !== 'cho_xu_ly') {
      alert('⚠️ Yêu cầu này không thể xác nhận');
      return;
    }
    setSelectedRefund(refund);
    setConfirmAction('confirm');
    setShowConfirmDialog(true);
  };

  const handleRejectRefund = (refund) => {
    if (refund.trang_thai !== 'pending' && refund.trang_thai !== 'cho_xu_ly') {
      alert('⚠️ Yêu cầu này không thể từ chối');
      return;
    }
    setSelectedRefund(refund);
    setConfirmAction('reject');
    setShowConfirmDialog(true);
  };

  const processConfirm = async () => {
    try {
      await refundAPI.confirm(selectedRefund.id);
      alert(`✅ Đã xác nhận hoàn tiền cho vé ${selectedRefund.ma_ve}`);
      await loadRefunds();
    } catch (error) {
      console.error('Lỗi xác nhận:', error);
      alert('❌ Có lỗi xảy ra khi xác nhận hoàn tiền');
    } finally {
      setShowConfirmDialog(false);
      setSelectedRefund(null);
      setConfirmAction(null);
    }
  };

  const processReject = async () => {
    try {
      await refundAPI.reject(selectedRefund.id);
      alert(`❌ Đã từ chối hoàn tiền cho vé ${selectedRefund.ma_ve}`);
      await loadRefunds();
    } catch (error) {
      console.error('Lỗi từ chối:', error);
      alert('❌ Có lỗi xảy ra khi từ chối');
    } finally {
      setShowConfirmDialog(false);
      setSelectedRefund(null);
      setConfirmAction(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { class: 'status-completed', icon: <FiCheckCircle />, text: 'Đã hoàn tiền' },
      hoan_thanh: { class: 'status-completed', icon: <FiCheckCircle />, text: 'Đã hoàn tiền' },
      pending: { class: 'status-pending', icon: <FiClock />, text: 'Chờ xử lý' },
      cho_xu_ly: { class: 'status-pending', icon: <FiClock />, text: 'Chờ xử lý' },
      cancelled: { class: 'status-cancelled', icon: <FiXCircle />, text: 'Từ chối' },
      that_bai: { class: 'status-cancelled', icon: <FiXCircle />, text: 'Từ chối' }
    };
    return badges[status] || badges.pending;
  };

  const columns = [
    { title: 'Mã vé', key: 'ma_ve', width: '80px' },
    { title: 'Khách hàng', key: 'khach_hang', width: '150px' },
    { title: 'Chuyến tàu', key: 'chuyen_tau', width: '115px' },
    { title: 'Ngày hủy', key: 'ngay_huy', width: '100px' },
    { title: 'Tiền gốc', key: 'tien_goc', render: (v) => formatCurrency(v) },
    { title: 'Phí hủy', key: 'phi_huy', render: (v) => formatCurrency(v) },
    { title: 'Tiền hoàn', key: 'tien_hoan', render: (v) => <span className="refund-amount">{formatCurrency(v)}</span> },
    { title: 'Trạng thái', key: 'trang_thai', render: (v) => {
      const status = getStatusBadge(v);
      return <span className={`status-badge ${status.class}`}>{status.icon} {status.text}</span>;
    }},
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => { setSelectedRefund(row); setShowDetailModal(true); }} title="Xem chi tiết">
            <FiEye />
          </button>
          {(row.trang_thai === 'pending' || row.trang_thai === 'cho_xu_ly') && (
            <>
              <button className="btn-confirm" onClick={() => handleConfirmRefund(row)} title="Xác nhận hoàn tiền">
                <FiCheckCircle />
              </button>
              <button className="btn-reject" onClick={() => handleRejectRefund(row)} title="Từ chối">
                <FiXCircle />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.ma_ve?.toString().includes(searchTerm) || 
                          refund.khach_hang?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.trang_thai === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRefundAmount = refunds.reduce((sum, r) => sum + (r.tien_hoan || 0), 0);
  const totalFeeAmount = refunds.reduce((sum, r) => sum + (r.phi_huy || 0), 0);
  const pendingCount = refunds.filter(r => r.trang_thai === 'pending' || r.trang_thai === 'cho_xu_ly').length;
  const completedCount = refunds.filter(r => r.trang_thai === 'completed' || r.trang_thai === 'hoan_thanh').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="refunds-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý hủy vé & hoàn tiền</h1>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon warning"><FiClock /></div>
          <div className="summary-info">
            <span className="summary-label">Chờ xử lý</span>
            <span className="summary-value">{pendingCount}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon success"><FiCheckCircle /></div>
          <div className="summary-info">
            <span className="summary-label">Đã hoàn tiền</span>
            <span className="summary-value">{completedCount}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon primary"><FiCheckCircle /></div>
          <div className="summary-info">
            <span className="summary-label">Tổng tiền hoàn</span>
            <span className="summary-value">{formatCurrency(totalRefundAmount)}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon danger"><FiXCircle /></div>
          <div className="summary-info">
            <span className="summary-label">Tổng phí hủy</span>
            <span className="summary-value">{formatCurrency(totalFeeAmount)}</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm theo mã vé, tên KH..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="completed">Đã hoàn tiền</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredRefunds} />

      <ConfirmDialog 
        isOpen={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)} 
        onConfirm={confirmAction === 'confirm' ? processConfirm : processReject} 
        title={confirmAction === 'confirm' ? 'Xác nhận hoàn tiền' : 'Từ chối hoàn tiền'} 
        message={confirmAction === 'confirm' ? `Xác nhận hoàn tiền ${formatCurrency(selectedRefund?.tien_hoan)} cho khách hàng?` : `Từ chối yêu cầu hoàn tiền cho vé ${selectedRefund?.ma_ve}?`} 
        confirmText={confirmAction === 'confirm' ? 'Xác nhận' : 'Từ chối'} 
        cancelText="Quay lại" 
      />

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết yêu cầu hoàn tiền" size="md">
        {selectedRefund && (
          <div className="refund-detail">
            <div className="refund-header">
              <div className="refund-code">
                <span>Mã vé</span>
                <h3>{selectedRefund.ma_ve}</h3>
              </div>
              <div className={`refund-status ${getStatusBadge(selectedRefund.trang_thai).class}`}>
                {getStatusBadge(selectedRefund.trang_thai).text}
              </div>
            </div>

            <div className="refund-info">
              <div className="info-row"><span className="label">Khách hàng:</span><span className="value">{selectedRefund.khach_hang}</span></div>
              <div className="info-row"><span className="label">Chuyến tàu:</span><span className="value">{selectedRefund.chuyen_tau}</span></div>
              <div className="info-row"><span className="label">Ngày hủy:</span><span className="value">{selectedRefund.ngay_huy}</span></div>
              <div className="info-row"><span className="label">Lý do hủy:</span><span className="value">{selectedRefund.ly_do || 'Không có lý do'}</span></div>
            </div>

            <div className="refund-amounts">
              <div className="amount-item"><span>Tiền vé gốc</span><strong>{formatCurrency(selectedRefund.tien_goc)}</strong></div>
              <div className="amount-item minus"><span>Phí hủy ({((selectedRefund.phi_huy / selectedRefund.tien_goc) * 100).toFixed(0)}%)</span><strong>- {formatCurrency(selectedRefund.phi_huy)}</strong></div>
              <div className="amount-item total"><span>Tiền hoàn lại</span><strong className="refund-total">{formatCurrency(selectedRefund.tien_hoan)}</strong></div>
            </div>

            {(selectedRefund.trang_thai === 'pending' || selectedRefund.trang_thai === 'cho_xu_ly') && (
              <div className="refund-actions">
                <button className="btn-secondary" onClick={() => { setShowDetailModal(false); handleRejectRefund(selectedRefund); }}>Từ chối</button>
                <button className="btn-primary" onClick={() => { setShowDetailModal(false); handleConfirmRefund(selectedRefund); }}>Xác nhận hoàn tiền</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Refunds;