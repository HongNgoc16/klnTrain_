package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "GaTau")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GaTau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ga")
    private Long idGa;

    @Column(name = "ten_ga", nullable = false, length = 100)
    private String tenGa;

    @Column(name = "ma_ga_viet_tat", length = 10)
    private String maGaVietTat;

    @Column(name = "tinh_thanh", length = 50)
    private String tinhThanh;

    @Column(name = "thu_tu_tuyen")
    private Integer thuTuTuyen;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // hoat_dong, tam_dung
}
