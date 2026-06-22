package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HoanTien")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoanTien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hoan_tien")
    private Long idHoanTien;

    @Column(name = "id_ve")
    private Long idVe;

    @Column(name = "id_don_dat_ve")
    private Long idDonDatVe;

    @Column(name = "so_tien_hoan", precision = 18, scale = 0)
    private BigDecimal soTienHoan;

    @Column(name = "phi_huy", precision = 18, scale = 0)
    private BigDecimal phiHuy;

    @Column(name = "ly_do", length = 500)
    private String lyDo;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // cho_xu_ly, da_hoan, that_bai

    @Column(name = "thoi_gian_yeu_cau")
    private LocalDateTime thoiGianYeuCau;

    @Column(name = "thoi_gian_hoan")
    private LocalDateTime thoiGianHoan;

    @PrePersist
    public void prePersist() {
        if (thoiGianYeuCau == null) thoiGianYeuCau = LocalDateTime.now();
        if (trangThai == null) trangThai = "cho_xu_ly";
    }
}
