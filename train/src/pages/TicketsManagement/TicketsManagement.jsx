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
  <title>Vé tàu SE8 - Đường sắt Hà Nội</title>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #e9ecef;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .boarding-pass {
      max-width: 550px;
      width: 100%;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    /* Header đỏ - giống ảnh */
    .header {
      background: #b12a2a;
      padding: 16px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffefc0;
      font-size: 22px;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .header .sub {
      color: #ffefc0;
      font-size: 12px;
      margin-top: 4px;
    }
    /* Nội dung chính */
    .content {
      padding: 20px 24px;
    }
    .ticket-id {
      text-align: right;
      font-size: 12px;
      color: #b12a2a;
      font-weight: bold;
      margin-bottom: 16px;
    }
    /* Hàng trình 2 cột SÀI GÒN - HÀ NỘI */
    .journey-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fef7e6;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .station-box {
      text-align: center;
      flex: 1;
    }
    .station-name {
      font-size: 24px;
      font-weight: 800;
      color: #2c3e2f;
      letter-spacing: 1px;
    }
    .station-name small {
      font-size: 12px;
      font-weight: normal;
    }
    .arrow-icon {
      font-size: 28px;
      color: #b12a2a;
      font-weight: bold;
      padding: 0 8px;
    }
    /* Thông tin chi tiết dạng lưới */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 16px;
      margin-bottom: 20px;
    }
    .info-item {
      border-bottom: 1px dashed #ddd;
      padding-bottom: 6px;
    }
    .info-label {
      font-size: 11px;
      color: #b12a2a;
      font-weight: 600;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 16px;
      font-weight: 700;
      color: #1e2a1e;
      margin-top: 2px;
    }
    /* Hàng ghế + loại vé đặc biệt */
    .seat-class-row {
      background: #f5f2eb;
      border-radius: 10px;
      padding: 12px 16px;
      margin: 16px 0;
      display: flex;
      justify-content: space-between;
    }
    .full-width {
      margin: 12px 0;
    }
    .price {
      font-size: 18px;
      font-weight: bold;
      color: #b12a2a;
    }
    .note {
      font-size: 11px;
      color: #666;
      margin-top: 12px;
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 12px;
    }
    .invoice-link {
      font-size: 11px;
      background: #f5f2eb;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
      margin: 12px 0;
      word-break: break-all;
    }
    .footer-print {
      background: #2c2e2a;
      padding: 12px;
      text-align: center;
      font-size: 10px;
      color: #ccc;
    }
    hr {
      margin: 12px 0;
      border: none;
      border-top: 1px dashed #b12a2a;
    }
  </style>
</head>
<body>
<div class="boarding-pass">
  <div class="header">
    <h1>CÔNG TY CỔ PHẦN VẬN TẢI<br>ĐƯỜNG SẮT KLN</h1>
    <div class="sub">THẺ LÊN TÀU HỎA / BOARDING PASS</div>
  </div>
  <div class="content">
    <div class="ticket-id">Mã vé/TicketID: 90213282</div>

    <!-- Ga đi - Ga đến dạng lớn như ảnh -->
    <div class="journey-row">
      <div class="station-box">
        <div class="station-name">SÀI GÒN</div>
      </div>
      <div class="arrow-icon">→</div>
      <div class="station-box">
        <div class="station-name">HÀ NỘI</div>
      </div>
    </div>

    <!-- Thông tin chuyến đi dạng 4 cột như ảnh gốc: Tàu, Ngày đi, Giờ đi, Toa, Chỗ... -->
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Tàu/Train</div><div class="info-value">SE8</div></div>
      <div class="info-item"><div class="info-label">Ngày đi/Date</div><div class="info-value">23/5/2026</div></div>
      <div class="info-item"><div class="info-label">Giờ đi/Time</div><div class="info-value">06:00</div></div>
      <div class="info-item"><div class="info-label">Toa/Coach</div><div class="info-value">2</div></div>
      <div class="info-item"><div class="info-label">Chỗ/Seat</div><div class="info-value">41</div></div>
      <div class="info-item"><div class="info-label">Loại chỗ/Class</div><div class="info-value">Ngồi mềm điều hòa</div></div>
      <div class="info-item"><div class="info-label">Loại vé/Ticket</div><div class="info-value">Toàn vé</div></div>
      <div class="info-item"><div class="info-label">Họ tên/Name</div><div class="info-value">NGUYỄN VĂN A</div></div>
      <div class="info-item"><div class="info-label">Giấy tờ/Passport</div><div class="info-value">---</div></div>
    </div>

    <!-- Giá vé nổi bật -->
    <div class="seat-class-row">
      <span><strong>Giá/Price:</strong></span>
      <span class="price">908.000 VNĐ</span>
    </div>

    <!-- Ghi chú hóa đơn điện tử giống ảnh -->
    <div class="invoice-link">
      📍 Ghi chú: Để tra cứu và nhận hóa đơn điện tử xin vui lòng truy cập<br>
      http://hoadon.klntrain.vn<br>
      <strong>Mã tra cứu hóa đơn: S2NFBIDF</strong>
    </div>

    <div class="note">
      Thẻ này không có giá trị thanh toán.<br>
      This boarding pass is not an official invoice.
    </div>
    <hr>
    <div style="font-size: 10px; text-align: center; color:#666;">
      HN010-5421302. Ngày in/Printed date: 24/5/2026 (1)
    </div>
  </div>
  <div class="footer-print">
    Hotline hỗ trợ: 1900 1234 | www.klntrain.vn
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
      da_xac_nhan: { text: 'Đã xác nhận', class: 'badge-success' },
      cho_xac_nhan: { text: 'Chờ xác nhận', class: 'badge-warning' }
    };
    return statuses[status] || { text: status, class: 'badge-secondary' };
  };

  const stats = {
    total: tickets.length,
    hieu_luc: tickets.filter(t => t.trang_thai === 'hieu_luc' || t.trang_thai === 'da_xac_nhan').length,
    da_su_dung: tickets.filter(t => t.trang_thai === 'da_su_dung').length,
    da_huy: tickets.filter(t => t.trang_thai === 'da_huy').length,
    cho_xac_nhan: tickets.filter(t => t.trang_thai === 'cho_xac_nhan').length
  };

  const columns = [
    { title: 'Mã vé', key: 'ma_ve', width: '80px' },
    { title: 'Khách hàng', key: 'hanh_khach', width: '150px' },
    { title: 'Chuyến tàu', key: 'chuyen_tau', width: '120px' },
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