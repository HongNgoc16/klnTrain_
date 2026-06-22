package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "LichChay")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LichChay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lich_chay")
    private Long idLichChay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tau")
    private Tau tau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ga_di")
    private GaTau gaDi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ga_den")
    private GaTau gaDen;

    @Column(name = "gio_khoi_hanh")
    private LocalTime gioKhoiHanh;

    @Column(name = "gio_du_kien_den")
    private LocalTime gioDuKienDen;

    @Column(name = "thu_trong_tuan", length = 50)
    private String thuTrongTuan;
}
