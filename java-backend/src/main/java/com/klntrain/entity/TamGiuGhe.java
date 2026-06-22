package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TamGiuGhe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TamGiuGhe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tam_giu")
    private Long idTamGiu;

    @Column(name = "id_chuyen")
    private Long idChuyen;

    @Column(name = "so_toa_thu_tu")
    private Integer soToaThuTu;

    @Column(name = "so_ghe_trong_toa")
    private Integer soGheTrongToa;

    @Column(name = "session_id", length = 50)
    private String sessionId;

    @Column(name = "id_don_dat_ve")
    private Long idDonDatVe;

    @Column(name = "id_ga_len")
    private Long idGaLen;

    @Column(name = "id_ga_xuong")
    private Long idGaXuong;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // dang_giu, da_giai_phong

    @Column(name = "thoi_gian_het_han")
    private LocalDateTime thoiGianHetHan;

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @PrePersist
    public void prePersist() {
        if (thoiGianTao == null) thoiGianTao = LocalDateTime.now();
        if (trangThai == null) trangThai = "dang_giu";
    }
}
