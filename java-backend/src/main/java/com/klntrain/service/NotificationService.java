package com.klntrain.service;

import com.klntrain.entity.ThongBao;
import com.klntrain.repository.ThongBaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final ThongBaoRepository thongBaoRepo;

    public List<ThongBao> getNotifications(Long idTaiKhoan) {
        return thongBaoRepo.findByIdTaiKhoanOrderByThoiGianTaoDesc(idTaiKhoan);
    }

    public long countUnread(Long idTaiKhoan) {
        return thongBaoRepo.countByIdTaiKhoanAndDaDocFalse(idTaiKhoan);
    }

    @Transactional
    public void markAsRead(Long idThongBao, Long idTaiKhoan) {
        thongBaoRepo.markAsRead(idThongBao, idTaiKhoan);
    }

    @Transactional
    public void markAllAsRead(Long idTaiKhoan) {
        thongBaoRepo.markAllAsRead(idTaiKhoan);
    }

    public void sendNotification(Long idTaiKhoan, String tieuDe, String noiDung, String loai, String lienKet) {
        ThongBao tb = ThongBao.builder()
            .idTaiKhoan(idTaiKhoan)
            .tieuDe(tieuDe)
            .noiDung(noiDung)
            .loai(loai)
            .daDoc(false)
            .lienKet(lienKet)
            .build();
        thongBaoRepo.save(tb);
    }
}
