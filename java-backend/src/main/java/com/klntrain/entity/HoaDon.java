package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HoaDon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hoa_don")
    private Long idHoaDon;

    @Column(name = "so_hoa_don", unique = true, length = 30)
    private String soHoaDon;

    @Column(name = "id_don_dat_ve")
    private Long idDonDatVe;

    @Column(name = "id_thanh_toan")
    private Long idThanhToan;

    @Column(name = "tong_tien", precision = 18, scale = 0)
    private BigDecimal tongTien;

    @Column(name = "thoi_gian_xuat")
    private LocalDateTime thoiGianXuat;

    @PrePersist
    public void prePersist() {
        if (thoiGianXuat == null) thoiGianXuat = LocalDateTime.now();
    }
}
