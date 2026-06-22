package com.klntrain.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {

    private final EntityManager em;

    // Cập nhật trạng thái ChuyenTau mỗi 5 phút
    @Scheduled(fixedDelay = 5 * 60 * 1000, initialDelay = 5000)
    @Transactional
    public void capNhatTrangThaiChuyen() {
        try {
            em.createNativeQuery("EXEC sp_CapNhatTrangThaiChuyen").executeUpdate();
        } catch (Exception e) {
            // SP chưa được cài — bỏ qua
        }
    }

    // Giải phóng ghế giữ đã hết hạn mỗi 5 phút
    @Scheduled(fixedDelay = 5 * 60 * 1000, initialDelay = 10000)
    @Transactional
    public void giaiPhongGheHetHan() {
        try {
            int released = em.createQuery(
                "UPDATE TamGiuGhe t SET t.trangThai = 'da_giai_phong' WHERE t.thoiGianHetHan < CURRENT_TIMESTAMP AND t.trangThai = 'dang_giu'"
            ).executeUpdate();
            if (released > 0) log.info("[Scheduler] Đã giải phóng {} ghế hết hạn", released);
        } catch (Exception e) {
            log.warn("[Scheduler] Lỗi giải phóng ghế: {}", e.getMessage());
        }
    }

    // Hủy đơn hàng hết hạn mỗi 10 phút
    @Scheduled(fixedDelay = 10 * 60 * 1000, initialDelay = 15000)
    @Transactional
    public void huyDonHetHan() {
        try {
            em.createQuery(
                "UPDATE DonDatVe d SET d.trangThai = 'het_han' WHERE d.trangThai = 'cho_thanh_toan' AND d.thoiGianHetHan < CURRENT_TIMESTAMP"
            ).executeUpdate();
        } catch (Exception e) {
            log.warn("[Scheduler] Lỗi hủy đơn hết hạn: {}", e.getMessage());
        }
    }
}
