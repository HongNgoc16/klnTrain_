package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Ve")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ve {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ve")
    private Long idVe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_don_dat_ve")
    private DonDatVe donDatVe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hanh_khach")
    private HanhKhach hanhKhach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chuyen")
    private ChuyenTau chuyenTau;

    @Column(name = "so_toa_thu_tu")
    private Integer soToaThuTu;

    @Column(name = "so_ghe_trong_toa")
    private Integer soGheTrongToa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ga_len")
    private GaTau gaLen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ga_xuong")
    private GaTau gaXuong;

    @Column(name = "loai_hanh_khach", length = 20)
    private String loaiHanhKhach;

    @Column(name = "gia_ve", precision = 18, scale = 0)
    private BigDecimal giaVe;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // cho_xac_nhan, da_xac_nhan, da_su_dung, da_huy, da_doi

    @Column(name = "qr_ve", length = 500)
    private String qrVe;

    @Column(name = "ngay_xuat_ve")
    private LocalDateTime ngayXuatVe;
}
