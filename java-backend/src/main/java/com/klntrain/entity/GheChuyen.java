package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "GheChuyen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GheChuyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ghe_chuyen")
    private Long idGheChuyen;

    @Column(name = "id_chuyen")
    private Long idChuyen;

    @Column(name = "so_toa_thu_tu")
    private Integer soToaThuTu;

    @Column(name = "so_ghe_trong_toa")
    private Integer soGheTrongToa;

    @Column(name = "id_loai_ghe")
    private Long idLoaiGhe;
}
