package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ToaChuyen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ToaChuyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_toa_chuyen")
    private Long idToaChuyen;

    @Column(name = "id_chuyen")
    private Long idChuyen;

    @Column(name = "so_toa_thu_tu")
    private Integer soToaThuTu;

    @Column(name = "id_loai_toa")
    private Long idLoaiToa;

    @Column(name = "so_ghe_toi_da")
    private Integer soGheToiDa;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // hoat_dong, ngung

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loai_toa", insertable = false, updatable = false)
    private LoaiToa loaiToa;
}
