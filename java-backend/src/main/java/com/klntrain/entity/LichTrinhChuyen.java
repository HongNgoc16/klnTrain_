package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "LichTrinhChuyen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LichTrinhChuyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lich_trinh")
    private Long idLichTrinh;

    @Column(name = "id_lich_chay")
    private Long idLichChay;

    @Column(name = "id_ga")
    private Long idGa;

    @Column(name = "thu_tu_dung")
    private Integer thuTuDung;

    @Column(name = "gio_den")
    private LocalTime gioDen;

    @Column(name = "gio_di")
    private LocalTime gioDi;

    @Column(name = "khoang_cach_km", precision = 10, scale = 2)
    private BigDecimal khoangCachKm;

    @Column(name = "thoi_gian_dung")
    private Integer thoiGianDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ga", insertable = false, updatable = false)
    private GaTau gaTau;
}
