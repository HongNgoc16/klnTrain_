package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "KhuyenMai")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhuyenMai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_khuyen_mai")
    private Long idKhuyenMai;

    @Column(name = "ma_khuyen_mai", unique = true, length = 20)
    private String maKhuyenMai;

    @Column(name = "ten_khuyen_mai", length = 200)
    private String tenKhuyenMai;

    @Column(name = "loai_giam", length = 20)
    private String loaiGiam; // phan_tram, so_tien

    @Column(name = "gia_tri", precision = 18, scale = 2)
    private BigDecimal giaTri;

    @Column(name = "giam_toi_da", precision = 18, scale = 2)
    private BigDecimal giamToiDa;

    @Column(name = "gia_tri_don_toi_thieu", precision = 18, scale = 2)
    private BigDecimal giaTri_donToiThieu;

    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    @Column(name = "ngay_het_han")
    private LocalDate ngayHetHan;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "da_dung")
    private Integer daDung;

    @Column(name = "trang_thai", length = 20)
    private String trangThai;
}
