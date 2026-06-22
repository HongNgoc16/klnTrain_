package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DieuPhoi")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DieuPhoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dieu_phoi")
    private Long idDieuPhoi;

    @Column(name = "id_chuyen")
    private Long idChuyen;

    @Column(name = "loai_su_kien", length = 30)
    private String loaiSuKien; // delay, cancel, maintenance, info

    @Column(name = "mo_ta", length = 1000)
    private String moTa;

    @Column(name = "delay_phut")
    private Integer delayPhut;

    @Column(name = "id_ga_anh_huong")
    private Long idGaAnhHuong;

    @Column(name = "so_toa")
    private Integer soToa;

    @Column(name = "nguoi_tao")
    private Long nguoiTao;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // hieu_luc, da_huy

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ga_anh_huong", insertable = false, updatable = false)
    private GaTau gaAnhHuong;

    @PrePersist
    public void prePersist() {
        if (thoiGianTao == null) thoiGianTao = LocalDateTime.now();
        if (trangThai == null) trangThai = "hieu_luc";
    }
}
