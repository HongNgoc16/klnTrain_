import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Định dạng số tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Xuất dữ liệu ra file Excel
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  // Tạo workbook
  const wb = XLSX.utils.book_new();
  
  // Chuyển đổi dữ liệu
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Điều chỉnh độ rộng cột
  const cols = [];
  if (data.length > 0) {
    Object.keys(data[0]).forEach(key => {
      let maxLen = key.length;
      data.forEach(row => {
        const val = row[key]?.toString() || '';
        maxLen = Math.max(maxLen, val.length);
      });
      cols.push({ wch: Math.min(maxLen + 2, 30) });
    });
    ws['!cols'] = cols;
  }
  
  // Thêm sheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Xuất file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
};

// Xuất nhiều sheet
export const exportMultiSheetToExcel = (sheets, filename) => {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
};

// Xuất báo cáo doanh thu
export const exportRevenueReport = (data, dateRange) => {
  const exportData = data.map(item => ({
    'Tháng': item.month,
    'Doanh thu': formatCurrency(item.revenue),
    'Số vé': item.tickets,
    'Doanh thu (số)': item.revenue,
    'Số vé (số)': item.tickets
  }));
  
  exportToExcel(exportData, `bao_cao_doanh_thu_${dateRange}`, 'Doanh thu');
};

// Xuất báo cáo tuyến đường
export const exportRouteReport = (data) => {
  const exportData = data.map((item, idx) => ({
    'STT': idx + 1,
    'Tuyến đường': `${item.from_station} → ${item.to_station}`,
    'Số vé': item.total_tickets,
    'Doanh thu': formatCurrency(item.total_revenue),
    'Doanh thu (số)': item.total_revenue
  }));
  
  exportToExcel(exportData, 'bao_cao_tuyen_duong', 'Tuyến đường');
};

// Xuất báo cáo đoàn tàu
export const exportTrainReport = (data) => {
  const exportData = data.map((item, idx) => ({
    'STT': idx + 1,
    'Mã tàu': item.train_code,
    'Tên tàu': item.train_name,
    'Số vé': item.total_tickets,
    'Doanh thu': formatCurrency(item.total_revenue),
    'Tỷ lệ lấp đầy': `${item.occupancy_rate}%`,
    'Doanh thu (số)': item.total_revenue
  }));
  
  exportToExcel(exportData, 'bao_cao_doan_tau', 'Đoàn tàu');
};

// Xuất báo cáo khách hàng
export const exportCustomerReport = (data, summary) => {
  const exportData = data.map(item => ({
    'Loại khách hàng': item.name,
    'Số lượng': item.value,
    'Tỷ lệ': `${item.value}%`,
    'Số lượng (số)': item.value
  }));
  
  // Thêm dòng tổng kết
  exportData.push({
    'Loại khách hàng': '=== TỔNG KẾT ===',
    'Số lượng': summary.total_customers,
    'Tỷ lệ': '100%',
    'Số lượng (số)': summary.total_customers
  });
  
  exportToExcel(exportData, 'bao_cao_khach_hang', 'Khách hàng');
};

// Xuất tất cả báo cáo
export const exportAllReports = (revenueData, routeData, trainData, customerData, summary, dateRange) => {
  const sheets = [
    {
      name: 'Doanh thu',
      data: revenueData.map(item => ({
        'Tháng': item.month,
        'Doanh thu': formatCurrency(item.revenue),
        'Số vé': item.tickets
      }))
    },
    {
      name: 'Tuyến đường',
      data: routeData.map((item, idx) => ({
        'STT': idx + 1,
        'Tuyến đường': `${item.from_station} → ${item.to_station}`,
        'Số vé': item.total_tickets,
        'Doanh thu': formatCurrency(item.total_revenue)
      }))
    },
    {
      name: 'Đoàn tàu',
      data: trainData.map((item, idx) => ({
        'STT': idx + 1,
        'Mã tàu': item.train_code,
        'Tên tàu': item.train_name,
        'Số vé': item.total_tickets,
        'Doanh thu': formatCurrency(item.total_revenue),
        'Tỷ lệ lấp đầy': `${item.occupancy_rate}%`
      }))
    },
    {
      name: 'Khách hàng',
      data: customerData.map(item => ({
        'Loại khách hàng': item.name,
        'Số lượng': item.value,
        'Tỷ lệ': `${item.value}%`
      }))
    },
    {
      name: 'Tổng quan',
      data: [{
        'Chỉ tiêu': 'Tổng doanh thu',
        'Giá trị': formatCurrency(summary.total_revenue),
        'Ghi chú': `Tăng trưởng ${summary.growth_revenue}%`
      }, {
        'Chỉ tiêu': 'Tổng vé đã bán',
        'Giá trị': summary.total_tickets,
        'Ghi chú': `Tăng trưởng ${summary.growth_tickets}%`
      }, {
        'Chỉ tiêu': 'Tổng khách hàng',
        'Giá trị': summary.total_customers,
        'Ghi chú': ''
      }, {
        'Chỉ tiêu': 'Tỷ lệ lấp đầy TB',
        'Giá trị': `${summary.avg_occupancy}%`,
        'Ghi chú': ''
      }, {
        'Chỉ tiêu': 'Tỷ lệ hủy vé',
        'Giá trị': `${summary.cancel_rate}%`,
        'Ghi chú': ''
      }]
    }
  ];
  
  exportMultiSheetToExcel(sheets, `bao_cao_tong_hop_${dateRange}`);
};