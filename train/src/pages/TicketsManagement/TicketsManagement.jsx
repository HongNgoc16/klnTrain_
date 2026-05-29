import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiEye, FiCheckCircle, FiXCircle, FiPrinter } from 'react-icons/fi';
import DataTable from '../../components/Common/DataTable';
import Modal from '../../components/Common/Modal';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import { ticketAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './TicketsManagement.scss';

const TicketsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

const loadTickets = async () => {
  setLoading(true);
  try {
    const res = await ticketAPI.getAll();
    console.log('📦 API Response:', res.data); // Debug - xem dữ liệu trả về
    
    // Lấy dữ liệu từ API
    let ticketsData = res.data.data || [];
    
    // Nếu không có dữ liệu, hiển thị thông báo thay vì mock data
    if (ticketsData.length === 0) {
      console.log('⚠️ Không có dữ liệu vé từ database');
      setTickets([]);
      setLoading(false);
      return;
    }
    
    // Format dữ liệu
    ticketsData = ticketsData.map(ticket => ({
      ma_ve: ticket.id_ve || ticket.ma_ve,
      hanh_khach: ticket.ho_ten || ticket.hanh_khach,
      chuyen_tau: ticket.so_hieu || ticket.chuyen_tau,
      ga_len: ticket.ga_di || ticket.ga_len,
      ga_xuong: ticket.ga_den || ticket.ga_xuong,
      ngay_di: ticket.ngay_chay || ticket.ngay_di,
      gio_di: ticket.gio_di,
      so_toa: ticket.so_toa_thu_tu,
      so_ghe: ticket.so_ghe_trong_toa,
      gia_ve: ticket.gia_ve,
      trang_thai: ticket.trang_thai === 'da_xac_nhan' ? 'hieu_luc' : ticket.trang_thai,
      ngay_dat: ticket.ngay_xuat_ve?.split('T')[0]
    }));
    
    setTickets(ticketsData);
  } catch (error) {
    console.error('❌ Lỗi tải vé:', error);
    setTickets([]); // Không dùng mock data nữa
  } finally {
    setLoading(false);
  }
};

  const handleConfirmTicket = async (ticket) => {
    if (ticket.trang_thai !== 'hieu_luc') {
      alert('⚠️ Vé không ở trạng thái có hiệu lực để xác nhận');
      return;
    }
    setSelectedTicket(ticket);
    setActionType('confirm');
    setShowConfirmDialog(true);
  };

  const handleCancelTicket = (ticket) => {
    if (ticket.trang_thai !== 'hieu_luc') {
      alert('⚠️ Không thể hủy vé này');
      return;
    }
    setSelectedTicket(ticket);
    setActionType('cancel');
    setShowConfirmDialog(true);
  };

  const processConfirmTicket = async () => {
    try {
      await ticketAPI.confirm(selectedTicket.ma_ve);
      alert(`✅ Đã xác nhận vé ${selectedTicket.ma_ve} đã được sử dụng`);
      await loadTickets();
    } catch (error) {
      console.error('Lỗi xác nhận vé:', error);
      alert('❌ Có lỗi xảy ra khi xác nhận vé');
    } finally {
      setShowConfirmDialog(false);
      setSelectedTicket(null);
      setActionType(null);
    }
  };

  const processCancelTicket = async () => {
    const lyDo = prompt('Nhập lý do hủy vé:');
    if (!lyDo) {
      setShowConfirmDialog(false);
      return;
    }
    
    try {
      await ticketAPI.cancel(selectedTicket.ma_ve, { ly_do: lyDo });
      alert(`❌ Đã hủy vé ${selectedTicket.ma_ve}`);
      await loadTickets();
    } catch (error) {
      console.error('Lỗi hủy vé:', error);
      alert('❌ Có lỗi xảy ra khi hủy vé');
    } finally {
      setShowConfirmDialog(false);
      setSelectedTicket(null);
      setActionType(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const generateBookingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handlePrintTicket = (ticket) => {
    const bookingCode = generateBookingCode();
    const currentDate = new Date().toLocaleDateString('vi-VN');
    const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vé tàu ${ticket.ma_ve} - KNL TRAIN</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #FDF2D6; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .boarding-pass { max-width: 550px; width: 100%; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
          .header { background: #8C1D19; padding: 20px; text-align: center; }
          .header h1 { color: #FDF2D6; font-size: 24px; letter-spacing: 2px; }
          .content { padding: 25px; }
          .section-title { color: #562D2E; font-size: 14px; font-weight: bold; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #8C1D19; display: inline-block; }
          .journey-section, .passenger-section, .ticket-code-section { margin-bottom: 20px; }
          .journey-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .station { text-align: center; }
          .station .name { font-size: 18px; font-weight: bold; color: #562D2E; }
          .station .code { font-size: 11px; color: #8C1D19; margin-top: 4px; }
          .arrow { font-size: 24px; color: #8C1D19; }
          .journey-details { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #8C1D19; }
          .detail-item { text-align: center; flex: 1; }
          .detail-item .label { font-size: 11px; color: #8C1D19; display: block; margin-bottom: 5px; }
          .detail-item .value { font-size: 14px; font-weight: bold; color: #562D2E; }
          .info-row { display: flex; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
          .info-row .label { width: 100px; font-size: 12px; color: #8C1D19; font-weight: 500; }
          .info-row .value { flex: 1; font-size: 13px; color: #562D2E; font-weight: 500; }
          .ticket-code-section { text-align: center; background: #FDF2D6; border-radius: 12px; padding: 20px; }
          .code { font-size: 18px; font-weight: bold; color: #8C1D19; margin-bottom: 10px; }
          .qr-placeholder { display: inline-block; background: white; padding: 10px; border-radius: 12px; margin-bottom: 10px; }
          .qr-placeholder svg { width: 100px; height: 100px; }
          .footer { background: #562D2E; padding: 15px; text-align: center; }
          .footer p { color: #FDF2D6; font-size: 11px; margin: 3px 0; }
          .thanks { font-weight: bold; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="boarding-pass">
          <div class="header"><h1>KLN TRAIN</h1></div>
          <div class="content">
            <div class="journey-section">
              <div class="section-title">THÔNG TIN HÀNH TRÌNH</div>
              <div class="journey-info">
                <div class="station"><div class="name">${ticket.ga_len || '---'}</div><div class="code">GA ĐI</div></div>
                <div class="arrow">→</div>
                <div class="station"><div class="name">${ticket.ga_xuong || '---'}</div><div class="code">GA ĐẾN</div></div>
              </div>
              <div class="journey-details">
                <div class="detail-item"><span class="label">TÀU</span><span class="value">${ticket.chuyen_tau || '---'}</span></div>
                <div class="detail-item"><span class="label">NGÀY ĐI</span><span class="value">${formatDate(ticket.ngay_di)}</span></div>
                <div class="detail-item"><span class="label">GIỜ ĐI</span><span class="value">${ticket.gio_di || '06:00'}</span></div>
                <div class="detail-item"><span class="label">TOA</span><span class="value">${ticket.so_toa || '1'}</span></div>
                <div class="detail-item"><span class="label">GHẾ</span><span class="value">${ticket.so_ghe || '---'}</span></div>
              </div>
            </div>
            <div class="passenger-section">
              <div class="section-title">THÔNG TIN HÀNH KHÁCH</div>
              <div class="info-row"><div class="label">Họ tên:</div><div class="value">${ticket.hanh_khach || '---'}</div></div>
              <div class="info-row"><div class="label">Giá vé:</div><div class="value">${formatCurrency(ticket.gia_ve)}</div></div>
            </div>
            <div class="ticket-code-section">
              <div class="section-title">MÃ ĐẶT CHỖ & MÃ VÉ</div>
              <div class="code">Mã đặt chỗ: ${bookingCode}</div>
              <div class="code">Mã vé: ${ticket.ma_ve}</div>
              <div class="qr-placeholder">
                <svg viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#562D2E"/>
                  <rect x="5" y="5" width="20" height="20" fill="none" stroke="#FDF2D6" stroke-width="3"/>
                  <rect x="10" y="10" width="10" height="10" fill="#FDF2D6"/>
                  <rect x="75" y="5" width="20" height="20" fill="none" stroke="#FDF2D6" stroke-width="3"/>
                  <rect x="80" y="10" width="10" height="10" fill="#FDF2D6"/>
                  <rect x="5" y="75" width="20" height="20" fill="none" stroke="#FDF2D6" stroke-width="3"/>
                  <rect x="10" y="80" width="10" height="10" fill="#FDF2D6"/>
                </svg>
              </div>
              <p class="qr-note">📱 Quét mã QR khi lên tàu</p>
            </div>
          </div>
          <div class="footer">
            <p class="thanks">CẢM ƠN QUÝ KHÁCH ĐÃ SỬ DỤNG DỊCH VỤ</p>
            <p>Hotline: 1900 1234 | Email: support@klntrain.vn</p>
            <p>Ngày xuất vé: ${currentDate} - ${currentTime}</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.print();
  };

  const getStatusText = (status) => {
    const statuses = {
      hieu_luc: { text: 'Có hiệu lực', class: 'badge-success' },
      da_su_dung: { text: 'Đã sử dụng', class: 'badge-info' },
      da_huy: { text: 'Đã hủy', class: 'badge-danger' },
      da_xac_nhan: { text: 'Đã xác nhận', class: 'badge-success' }
    };
    return statuses[status] || { text: status, class: 'badge-secondary' };
  };

  const stats = {
    total: tickets.length,
    hieu_luc: tickets.filter(t => t.trang_thai === 'hieu_luc' || t.trang_thai === 'da_xac_nhan').length,
    da_su_dung: tickets.filter(t => t.trang_thai === 'da_su_dung').length,
    da_huy: tickets.filter(t => t.trang_thai === 'da_huy').length
  };

  const columns = [
    { title: 'Mã vé', key: 'ma_ve', width: '80px' },
    { title: 'Khách hàng', key: 'hanh_khach', width: '150px' },
    { title: 'Chuyến tàu', key: 'chuyen_tau', width: '80px' },
    { title: 'Hành trình', key: 'ga_len', width: '200px', render: (_, row) => `${row.ga_len} → ${row.ga_xuong}` },
    { title: 'Ngày đi', key: 'ngay_di', width: '100px', render: (v) => formatDate(v) },
    { title: 'Giá vé', key: 'gia_ve', render: (v) => formatCurrency(v) },
    { title: 'Trạng thái', key: 'trang_thai', render: (v) => {
      const status = getStatusText(v);
      return <span className={`status-badge ${status.class}`}>{status.text}</span>;
    }},
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="btn-view" onClick={() => { setSelectedTicket(row); setShowDetailModal(true); }} title="Xem chi tiết"><FiEye /></button>
          {(row.trang_thai === 'hieu_luc' || row.trang_thai === 'da_xac_nhan') && (
            <>
              <button className="btn-cancel" onClick={() => handleCancelTicket(row)} title="Hủy vé"><FiXCircle /></button>
            </>
          )}
          <button className="btn-print" onClick={() => handlePrintTicket(row)} title="In vé"><FiPrinter /></button>
        </div>
      )
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ma_ve?.toString().includes(searchTerm) || 
                          ticket.hanh_khach?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.trang_thai === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="tickets-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý vé</h1>
          <p className="page-subtitle">Quản lý toàn bộ vé đã bán, xác nhận vé, hủy vé</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = '/reports'}>
          <FiDownload /> Xuất báo cáo
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-box primary"><span className="stat-label">Tổng số vé</span><span className="stat-value">{stats.total}</span></div>
        <div className="stat-box success"><span className="stat-label">Có hiệu lực</span><span className="stat-value">{stats.hieu_luc}</span></div>
        <div className="stat-box info"><span className="stat-label">Đã sử dụng</span><span className="stat-value">{stats.da_su_dung}</span></div>
        <div className="stat-box danger"><span className="stat-label">Đã hủy</span><span className="stat-value">{stats.da_huy}</span></div>
      </div>

      <div className="filter-bar">
        <div className="search-input"><FiSearch /><input type="text" placeholder="Tìm kiếm theo mã vé, tên KH..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group"><FiFilter /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="hieu_luc">Có hiệu lực</option>
          <option value="da_su_dung">Đã sử dụng</option>
          <option value="da_huy">Đã hủy</option>
        </select></div>
      </div>

      <DataTable columns={columns} data={filteredTickets} />

      <ConfirmDialog isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} onConfirm={actionType === 'confirm' ? processConfirmTicket : processCancelTicket} title={actionType === 'confirm' ? 'Xác nhận vé' : 'Hủy vé'} message={actionType === 'confirm' ? `Xác nhận vé ${selectedTicket?.ma_ve} đã được sử dụng?` : `Bạn có chắc chắn muốn hủy vé ${selectedTicket?.ma_ve}?`} confirmText={actionType === 'confirm' ? 'Xác nhận' : 'Hủy vé'} cancelText="Quay lại" />

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết vé" size="md">
        {selectedTicket && (
          <div className="ticket-detail">
            <div className="ticket-header">
              <div className="ticket-code"><span>Mã vé</span><h2>{selectedTicket.ma_ve}</h2></div>
              <div className={`ticket-status ${getStatusText(selectedTicket.trang_thai).class}`}>{getStatusText(selectedTicket.trang_thai).text}</div>
            </div>
            <div className="ticket-info">
              <div className="info-row"><span className="label">Khách hàng:</span><span className="value">{selectedTicket.hanh_khach}</span></div>
              <div className="info-row"><span className="label">Chuyến tàu:</span><span className="value">{selectedTicket.chuyen_tau}</span></div>
              <div className="info-row"><span className="label">Ngày khởi hành:</span><span className="value">{formatDate(selectedTicket.ngay_di)}</span></div>
              <div className="info-row"><span className="label">Ga lên tàu:</span><span className="value">{selectedTicket.ga_len}</span></div>
              <div className="info-row"><span className="label">Ga xuống tàu:</span><span className="value">{selectedTicket.ga_xuong}</span></div>
              <div className="info-row"><span className="label">Toa:</span><span className="value">{selectedTicket.so_toa || '---'}</span></div>
              <div className="info-row"><span className="label">Ghế:</span><span className="value">{selectedTicket.so_ghe || '---'}</span></div>
              <div className="info-row"><span className="label">Loại ghế:</span><span className="value">{selectedTicket.loai_ghe || 'Ghế ngồi điều hòa'}</span></div>
              <div className="info-row"><span className="label">Giá vé:</span><span className="value price">{formatCurrency(selectedTicket.gia_ve)}</span></div>
            </div>
            {(selectedTicket.trang_thai === 'hieu_luc' || selectedTicket.trang_thai === 'da_xac_nhan') && (
              <div className="modal-actions">
                <button className="btn-confirm" onClick={() => { setShowDetailModal(false); handleConfirmTicket(selectedTicket); }}><FiCheckCircle /> Xác nhận</button>
                <button className="btn-cancel" onClick={() => { setShowDetailModal(false); handleCancelTicket(selectedTicket); }}><FiXCircle /> Hủy vé</button>
                <button className="btn-print" onClick={() => handlePrintTicket(selectedTicket)}><FiPrinter /> In vé</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TicketsManagement;