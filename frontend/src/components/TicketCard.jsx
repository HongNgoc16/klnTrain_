// components/TicketCard.jsx — shared ticket card with local QR
import { QRCodeSVG } from 'qrcode.react'
import { formatDate } from '../utils/dateUtils'

const nowStr = () => {
  const d = new Date()
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

// ticket shape:
// { ticketCode, bookingCode, passenger: { fullName, idCard, type },
//   fromStation, toStation, trainCode, departDate, departTime,
//   coachId, coachName, seatNumber, price, isChild }
const TicketCard = ({ ticket }) => {
  const {
    ticketCode, bookingCode,
    passenger, fromStation, toStation,
    trainCode, departDate, departTime,
    coachId, coachName, seatNumber,
    price, isChild,
  } = ticket

  const coachType = (coachName || '').replace(/^Toa \d+: /, '') || '--'
  const qrData = `${ticketCode}|${passenger?.fullName || ''}|${trainCode || ''}|${fromStation || ''}-${toStation || ''}`

  return (
    <div className="bg-white border border-gray-400 max-w-sm mx-auto mb-6 print:break-after-page text-sm">
      {/* Header */}
      <div className="text-center border-b border-gray-300 py-3 px-4">
        <p className="font-bold leading-snug">CÔNG TY CỔ PHẦN VẬN TẢI</p>
        <p className="font-bold leading-snug">ĐƯỜNG SẮT KLN</p>
        <p className="font-bold text-base mt-1 tracking-wide">THẺ LÊN TÀU HỎA / BOARDING PASS</p>
      </div>

      {/* QR */}
      <div className="flex justify-center py-3 border-b border-gray-300">
        <QRCodeSVG value={qrData} size={80} />
      </div>

      {/* Ticket code */}
      <div className="text-center py-1.5 border-b border-gray-300 bg-gray-50">
        <p>Mã vé/TicketID: <strong className="font-mono tracking-widest">{ticketCode}</strong></p>
      </div>

      {/* Stations */}
      <div className="flex justify-between px-6 py-3 border-b border-gray-300">
        <div>
          <p className="text-xs text-gray-500">Ga đi</p>
          <p className="font-black text-xl leading-tight">{(fromStation || '--').toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Ga đến</p>
          <p className="font-black text-xl leading-tight">{(toStation || '--').toUpperCase()}</p>
        </div>
      </div>

      {/* Details */}
      <table className="w-full">
        <tbody>
          {[
            ['Tàu/Train:', trainCode || '--'],
            ['Ngày đi/Date:', formatDate(departDate)],
            ['Giờ đi/Time:', departTime || '--'],
            [`Toa/Coach: ${coachId || '--'}`, `Chỗ/Seat: ${seatNumber || '--'}`],
            ['Loại chỗ/Class:', coachType],
            ['Loại vé/Ticket:', isChild ? 'Trẻ em (-25%)' : 'Người lớn'],
            ['Họ tên/Name:', passenger?.fullName || '--'],
            ...(passenger?.idCard ? [['Giấy tờ/Passport:', passenger.idCard]] : []),
            ...(price > 0 ? [['Giá/Price:', `${new Intl.NumberFormat('vi-VN').format(price)} VNĐ`]] : []),
          ].map(([label, value], i) => (
            <tr key={i} className="border-b border-gray-100 last:border-b-0">
              <td className="px-4 py-1.5 text-gray-500 whitespace-nowrap">{label}</td>
              <td className="px-4 py-1.5 font-bold">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="border-t border-gray-300 px-4 py-2 flex justify-between text-xs text-gray-500">
        <span>Mã đặt chỗ: <strong className="text-[#8C1D19]">{bookingCode}</strong></span>
        <span>{nowStr()}</span>
      </div>
    </div>
  )
}

export default TicketCard
