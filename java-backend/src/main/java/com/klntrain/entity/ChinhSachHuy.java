package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ChinhSachHuy")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChinhSachHuy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chinh_sach_huy")
    private Long idChinhSachHuy;

    @Column(name = "gio_truoc_khi_chay_tu")
    private Integer gioTruocKhiChayTu;

    @Column(name = "gio_truoc_khi_chay_den")
    private Integer gioTruocKhiChayDen;

    @Column(name = "phan_tram_phi_huy", precision = 5, scale = 2)
    private BigDecimal phanTramPhiHuy;

    @Column(name = "mo_ta", length = 255)
    private String moTa;
}
