package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "HanhKhach")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HanhKhach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hanh_khach")
    private Long idHanhKhach;

    @Column(name = "id_tai_khoan")
    private Long idTaiKhoan;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "cccd", length = 20)
    private String cccd;

    @Column(name = "loai_hanh_khach", length = 20)
    private String loaiHanhKhach; // nguoi_lon, tre_em, nguoi_cao_tuoi, sinh_vien

    @Column(name = "so_dien_thoai", length = 15)
    private String soDienThoai;

    @Column(name = "la_chinh")
    private Boolean laChinh;
}
