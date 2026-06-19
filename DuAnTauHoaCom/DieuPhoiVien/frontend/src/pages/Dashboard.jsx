import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiXCircle, FiClock, FiTool, FiInfo, FiBell } from 'react-icons/fi'
import { FaTrain } from 'react-icons/fa'
import { IoMdSpeedometer } from 'react-icons/io'
import { getDashboard } from '../api/dieuphoi'
import StatusBadge from '../components/StatusBadge'

const pTime = (t) => {
  if (!t) return '--:--'
  const s = String(t)
  const m = s.match(/T(\d{2}:\d{2})/)
  return m ? m[1] : s.slice(0, 5)
}

const LOAI_LABEL = {
  delay:       { icon: FiClock,        label: 'Chậm giờ',  color: 'text-orange-500' },
  cancel:      { icon: FiXCircle,      label: 'Hủy chuyến', color: 'text-red-500'    },
  maintenance: { icon: FiTool,         label: 'Bảo trì',    color: 'text-gray-500'   },
  info:        { icon: FiInfo,         label: 'Thông báo',  color: 'text-blue-500'   },
}

const Card = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <Icon className="text-2xl opacity-60" />
    </div>
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const load = () => {
    getDashboard()
      .then(r => { setData(r.data || r); setLastUpdate(new Date()) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60000) // Auto-refresh every 1 minute
    return () => clearInterval(id)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-400">
        <FaTrain className="text-4xl mb-3 animate-pulse mx-auto text-[#8C1D19]" />
        <p className="text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  )

  if (!data) return <div className="p-8 text-red-500">Không tải được dữ liệu</div>

  const today = data.today || {}
  const s = today.byStatus || {}

  return (
    <div className="p-6 space-y-6 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span className="text-gray-600 font-medium flex items-center gap-1"><IoMdSpeedometer /> Tổng quan</span>
            <span>/</span>
            <span>{new Date().toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' })}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Xin chào, Điều Phối Viên</h1>
        </div>
        <div className="text-right text-xs text-gray-400">
          <button onClick={load} className="text-[#8C1D19] hover:text-[#6b1411] font-medium flex items-center gap-1.5">
            <FiRefreshCw /> Làm mới
          </button>
          {lastUpdate && <p className="mt-0.5">Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={FaTrain}      label="Tổng chuyến hôm nay" value={today.total || 0} color="border-[#8C1D19]" sub="tất cả trạng thái" />
        <Card icon={FiCheckCircle} label="Đang đúng giờ"   value={s.dung_gio || 0}  color="border-green-500"  sub="sẵn sàng khởi hành" />
        <Card icon={FiAlertTriangle} label="Cần chú ý"       value={(s.dieu_chinh||0)+(s.sap_den||0)} color="border-orange-500" sub="chậm / điều chỉnh" />
        <Card icon={FiXCircle}    label="Đã hủy hôm nay"  value={s.huy || 0}       color="border-red-500"   sub={`${data.tomorrowCount || 0} chuyến ngày mai`} />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Trips today */}
        <div className="bg-white rounded-2xl shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-gray-700 flex items-center gap-2"><FaTrain className="text-[#8C1D19]" /> Chuyến tàu hôm nay ({today.total || 0})</h2>
            <Link to="/dispatcher/chuyen-tau" className="text-xs text-[#8C1D19] hover:text-[#6b1411]">Xem tất cả →</Link>
          </div>
          <div className="divide-y flex-1 overflow-y-auto">
            {(today.trips || []).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Không có chuyến nào hôm nay</p>
            )}
            {(today.trips || []).map(c => (
              <Link to={`/dispatcher/chuyen-tau/${c.idChuyen}`} key={c.idChuyen}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#8C1D19]/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-[#8C1D19] text-sm">{c.maTau}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{c.gaDi} → {c.gaDen}</p>
                    <p className="text-xs text-gray-400">{c.tenTau}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-mono text-sm text-gray-500">{c.gioKhoiHanh}</span>
                  <StatusBadge status={c.trangThai} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent events */}
        <div className="bg-white rounded-2xl shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-gray-700 flex items-center gap-2"><FiBell className="text-[#8C1D19]" /> Sự kiện gần đây (24h)</h2>
          </div>
          <div className="divide-y flex-1 overflow-y-auto">
            {(data.recentEvents || []).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Không có sự kiện nào</p>
            )}
            {(data.recentEvents || []).map(e => (
              <div key={e.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                        {(() => {
                          const item = LOAI_LABEL[e.loaiSuKien]
                          if (!item) return e.loaiSuKien
                          const Icon = item.icon
                          return <><Icon className={item.color} /> {item.label}</>
                        })()}
                      </span>
                      <span className="text-xs text-[#8C1D19] font-medium">Tàu {e.maTau}</span>
                      {e.delayPhut && <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">+{e.delayPhut}p</span>}
                      {e.gaAnhHuong && <span className="text-xs text-gray-400">@ {e.gaAnhHuong}</span>}
                    </div>
                    {e.moTa && <p className="text-xs text-gray-500 mt-1 truncate">{e.moTa}</p>}
                  </div>
                  <span className="text-xs text-gray-300 shrink-0">
                    {new Date(e.thoiGian).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
