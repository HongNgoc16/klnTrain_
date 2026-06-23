package com.klntrain.service;

import com.klntrain.entity.ThongBao;
import com.klntrain.repository.ThongBaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ThongBaoService {

    private final ThongBaoRepository thongBaoRepo;

    public List<ThongBao> layThongBao(Long idTaiKhoan) {
        return thongBaoRepo.findByIdTaiKhoanOrderByThoiGianTaoDesc(idTaiKhoan);
    }

    public long demChuaDoc(Long idTaiKhoan) {
        return thongBaoRepo.countByIdTaiKhoanAndDaDocFalse(idTaiKhoan);
    }

    @Transactional
    public void danhDauDaDoc(Long idThongBao, Long idTaiKhoan) {
        thongBaoRepo.markAsRead(idThongBao, idTaiKhoan);
    }

    @Transactional
    public void danhDauTatCaDaDoc(Long idTaiKhoan) {
        thongBaoRepo.markAllAsRead(idTaiKhoan);
    }

    public void guiThongBao(Long idTaiKhoan, String tieuDe, String noiDung, String loai, String lienKet) {
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
