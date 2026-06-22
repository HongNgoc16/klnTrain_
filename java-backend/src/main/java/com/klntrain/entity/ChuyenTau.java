package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "ChuyenTau")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChuyenTau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chuyen")
    private Long idChuyen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lich_chay")
    private LichChay lichChay;

    @Column(name = "ngay_chay")
    private LocalDate ngayChay;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // dung_gio, da_chay, huy, dieu_chinh, sap_den

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;
}
