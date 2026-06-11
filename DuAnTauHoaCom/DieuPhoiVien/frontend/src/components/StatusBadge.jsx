const MAP = {
  dung_gio:     { label: 'Đúng giờ',     cls: 'bg-blue-100   text-blue-700'    },
  da_chay:      { label: 'Đã chạy',      cls: 'bg-gray-100   text-gray-600'    },
  huy:          { label: 'Đã hủy',       cls: 'bg-red-100    text-red-700'     },
  dieu_chinh:   { label: 'Điều chỉnh',   cls: 'bg-orange-100 text-orange-700'  },
  sap_den:      { label: 'Sắp đến',      cls: 'bg-green-100  text-green-700'   },
  delay:        { label: 'Chậm giờ',     cls: 'bg-yellow-100 text-yellow-700'  },
  cancel:       { label: 'Hủy chuyến',   cls: 'bg-red-100    text-red-700'     },
  maintenance:  { label: 'Bảo trì',      cls: 'bg-purple-100 text-purple-700'  },
  info:         { label: 'Thông báo',    cls: 'bg-blue-50    text-blue-600'    },
  hieu_luc:     { label: 'Hiệu lực',     cls: 'bg-green-100  text-green-700'   },
  het_hieu_luc: { label: 'Hết hiệu lực', cls: 'bg-gray-100   text-gray-500'    },
}

export default function StatusBadge({ status, className = '' }) {
  const m = MAP[status] || { label: status || '--', cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.cls} ${className}`}>
      {m.label}
    </span>
  )
}
