package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Tau")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tau")
    private Long idTau;

    @Column(name = "so_hieu", nullable = false, length = 20)
    private String soHieu;

    @Column(name = "ten_tau", length = 100)
    private String tenTau;

    @Column(name = "loai_tau", length = 50)
    private String loaiTau;

    @Column(name = "nam_san_xuat")
    private Integer namSanXuat;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // hoat_dong, bao_tri, ngung_hoat_dong
}
