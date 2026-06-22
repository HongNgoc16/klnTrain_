package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "BieuGia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BieuGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bieu_gia")
    private Long idBieuGia;

    @Column(name = "ten_bieu_gia", length = 100)
    private String tenBieuGia;

    @Column(name = "don_gia_km", precision = 18, scale = 2)
    private BigDecimal donGiaKm;

    @Column(name = "he_so_tang", precision = 5, scale = 2)
    private BigDecimal heSoTang;

    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    @Column(name = "ngay_het_han")
    private LocalDate ngayHetHan;

    @Column(name = "loai", length = 20)
    private String loai; // le, he, thuong
}
