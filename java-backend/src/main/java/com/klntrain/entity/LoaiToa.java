package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "LoaiToa")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoaiToa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_loai_toa")
    private Long idLoaiToa;

    @Column(name = "ten_loai_toa", nullable = false, length = 50)
    private String tenLoaiToa;

    @Column(name = "mo_ta", length = 255)
    private String moTa;

    @Column(name = "so_cho_toi_da")
    private Integer soChoToiDa;

    @Column(name = "he_so_gia")
    private Double heSoGia;
}
