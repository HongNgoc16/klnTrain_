package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CauHinhToa")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CauHinhToa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cau_hinh_toa")
    private Long idCauHinhToa;

    @Column(name = "id_tau")
    private Long idTau;

    @Column(name = "so_toa_thu_tu")
    private Integer soToaThuTu;

    @Column(name = "id_loai_toa")
    private Long idLoaiToa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loai_toa", insertable = false, updatable = false)
    private LoaiToa loaiToa;
}
