package com.klntrain.service;

import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CancelService {

    private final VeRepository veRepo;
    private final DonDatVeRepository donDatVeRepo;
    private final ChinhSachHuyRepository chinhSachHuyRepo;
    private final HoanTienRepository hoanTienRepo;

    public Map<String, Object> tinhPhiHuy(Long idVe) {
        Ve ve = veRepo.findById(idVe)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy vé"));

        if ("da_huy".equals(ve.getTrangThai())) {
            throw AppException.badRequest("Vé đã bị hủy trước đó");
        }

        // Tính số giờ còn lại trước khi tàu chạy
        // (đơn giản hóa: dùng ngày chạy của chuyến)
        int gioConLai = 48; // mặc định 48h nếu không tính được

        ChinhSachHuy policy = chinhSachHuyRepo.findApplicablePolicy(gioConLai).orElse(null);
        BigDecimal phanTramPhiHuy = policy != null ? policy.getPhanTramPhiHuy() : new BigDecimal("30");
        BigDecimal phiHuy = ve.getGiaVe().multiply(phanTramPhiHuy).divide(new BigDecimal("100"), 0, RoundingMode.FLOOR);
        BigDecimal tienHoan = ve.getGiaVe().subtract(phiHuy);

        return Map.of(
            "idVe", idVe,
            "giaVe", ve.getGiaVe(),
            "phiHuy", phiHuy,
            "tienHoan", tienHoan,
            "phanTramPhiHuy", phanTramPhiHuy
        );
    }

    @Transactional
    public Map<String, Object> cancelTickets(String maDatCho, List<Long> idVeList, String lyDo) {
        DonDatVe don = donDatVeRepo.findByMaDatCho(maDatCho)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy đơn"));

        int soVeHuy = 0;
        BigDecimal tongTienHoan = BigDecimal.ZERO;

        for (Long idVe : idVeList) {
            Ve ve = veRepo.findById(idVe)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy vé " + idVe));

            if (!"da_huy".equals(ve.getTrangThai())) {
                var phiInfo = tinhPhiHuy(idVe);
                BigDecimal tienHoan = (BigDecimal) phiInfo.get("tienHoan");
                BigDecimal phiHuy   = (BigDecimal) phiInfo.get("phiHuy");

                ve.setTrangThai("da_huy");
                veRepo.save(ve);

                HoanTien ht = HoanTien.builder()
                    .idVe(idVe)
                    .idDonDatVe(don.getIdDonDatVe())
                    .soTienHoan(tienHoan)
                    .phiHuy(phiHuy)
                    .lyDo(lyDo)
                    .trangThai("cho_xu_ly")
                    .build();
                hoanTienRepo.save(ht);

                tongTienHoan = tongTienHoan.add(tienHoan);
                soVeHuy++;
            }
        }

        // Nếu tất cả vé bị hủy → hủy đơn
        long veConLai = don.getVeList() != null
            ? don.getVeList().stream().filter(v -> !"da_huy".equals(v.getTrangThai())).count()
            : 0;
        if (veConLai == 0) {
            don.setTrangThai("da_huy");
            donDatVeRepo.save(don);
        }

        return Map.of(
            "soVeHuy", soVeHuy,
            "tongTienHoan", tongTienHoan
        );
    }
}
