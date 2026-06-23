package com.klntrain.service;

import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.NgoaiLeUngDung;
import com.klntrain.util.SinhMa;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

    private final DonDatVeRepository donDatVeRepo;
    private final ThanhToanRepository thanhToanRepo;
    private final HoaDonRepository hoaDonRepo;
    private final VeRepository veRepo;

    @Value("${sepay.webhook-token:}")
    private String sePayWebhookToken;

    @Transactional
    public Map<String, Object> taoThanhToan(Long idDonDatVe, String phuongThuc) {
        DonDatVe don = donDatVeRepo.findById(idDonDatVe)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy đơn đặt vé"));

        if (!"cho_thanh_toan".equals(don.getTrangThai())) {
            throw NgoaiLeUngDung.loiYeuCau("Đơn hàng không ở trạng thái chờ thanh toán");
        }

        String maGiaoDich = SinhMa.sinhMaGiaoDich();
        String noiDungCk  = "KLN " + don.getMaDon();
        String qrUrl = taoUrlVietQr(don.getTienThanhToan().longValue(), noiDungCk);

        ThanhToan tt = ThanhToan.builder()
            .idDonDatVe(idDonDatVe)
            .maGiaoDich(maGiaoDich)
            .phuongThuc(phuongThuc != null ? phuongThuc : "vietqr")
            .soTien(don.getTienThanhToan())
            .trangThai("dang_xu_ly")
            .noiDungCk(noiDungCk)
            .qrCode(qrUrl)
            .build();
        tt = thanhToanRepo.save(tt);

        return Map.of(
            "idThanhToan", tt.getIdThanhToan(),
            "maGiaoDich", maGiaoDich,
            "soTien", don.getTienThanhToan(),
            "qrUrl", qrUrl,
            "noiDungCk", noiDungCk,
            "hetHan", don.getThoiGianHetHan()
        );
    }

    @Transactional
    public Map<String, Object> xacNhanThanhToan(Long idThanhToan) {
        ThanhToan tt = thanhToanRepo.findById(idThanhToan)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy giao dịch"));

        if ("thanh_cong".equals(tt.getTrangThai())) {
            throw NgoaiLeUngDung.loiYeuCau("Giao dịch đã được xác nhận trước đó");
        }

        tt.setTrangThai("thanh_cong");
        tt.setThoiGianThanhToan(LocalDateTime.now());
        thanhToanRepo.save(tt);

        DonDatVe don = donDatVeRepo.findById(tt.getIdDonDatVe())
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy đơn"));
        don.setTrangThai("da_thanh_toan");
        donDatVeRepo.save(don);

        veRepo.findByDonDatVeIdDonDatVe(don.getIdDonDatVe())
            .forEach(ve -> {
                if ("cho_xac_nhan".equals(ve.getTrangThai())) {
                    ve.setTrangThai("da_xac_nhan");
                    veRepo.save(ve);
                }
            });

        String soHoaDon = SinhMa.sinhSoHoaDon();
        HoaDon hd = HoaDon.builder()
            .soHoaDon(soHoaDon)
            .idDonDatVe(don.getIdDonDatVe())
            .idThanhToan(idThanhToan)
            .tongTien(tt.getSoTien())
            .build();
        hoaDonRepo.save(hd);

        return Map.of(
            "maDon", don.getMaDon(),
            "maDatCho", don.getMaDatCho(),
            "soHoaDon", soHoaDon,
            "trangThai", "da_thanh_toan"
        );
    }

    public Map<String, Object> layTrangThaiThanhToan(Long idThanhToan) {
        ThanhToan tt = thanhToanRepo.findById(idThanhToan)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy giao dịch"));
        return Map.of(
            "idThanhToan", tt.getIdThanhToan(),
            "trangThai", tt.getTrangThai(),
            "soTien", tt.getSoTien(),
            "thoiGianTao", tt.getThoiGianTao()
        );
    }

    @Transactional
    public void xuLyWebhook(Map<String, Object> body) {
        String content = String.valueOf(body.getOrDefault("content", ""));
        if (!content.toUpperCase().contains("KLN")) return;

        String[] parts = content.toUpperCase().split("\\s+");
        for (String part : parts) {
            if (part.startsWith("ORD")) {
                donDatVeRepo.findByMaDon(part).ifPresent(don -> {
                    if ("cho_thanh_toan".equals(don.getTrangThai())) {
                        thanhToanRepo.findFirstByIdDonDatVeAndTrangThaiOrderByIdThanhToanDesc(
                            don.getIdDonDatVe(), "dang_xu_ly"
                        ).ifPresent(tt -> {
                            try { xacNhanThanhToan(tt.getIdThanhToan()); } catch (Exception ignored) {}
                        });
                    }
                });
                break;
            }
        }
    }

    @Transactional
    public Map<String, Object> xacNhanDevTheoMaDon(String maDon) {
        DonDatVe don = donDatVeRepo.findByMaDon(maDon.toUpperCase())
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy đơn"));
        ThanhToan tt = thanhToanRepo
            .findFirstByIdDonDatVeAndTrangThaiOrderByIdThanhToanDesc(don.getIdDonDatVe(), "dang_xu_ly")
            .orElseThrow(() -> NgoaiLeUngDung.loiYeuCau("Không tìm thấy giao dịch đang xử lý"));
        return xacNhanThanhToan(tt.getIdThanhToan());
    }

    private String taoUrlVietQr(long soTien, String noiDung) {
        String bankId = "970422"; // MB Bank
        String accountNo = "0123456789";
        return String.format(
            "https://img.vietqr.io/image/%s-%s-compact2.jpg?amount=%d&addInfo=%s",
            bankId, accountNo, soTien, noiDung.replace(" ", "%20")
        );
    }
}
