import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './DataTable.scss';

const DataTable = ({ 
  columns, 
  data, 
  onRowClick,
  itemsPerPage = 10,
  showPagination = true 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  return (
    <div className="data-table-container">
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="empty-row">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
            Đầu
          </button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <FiChevronLeft />
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <FiChevronRight />
          </button>
          <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
            Cuối
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;