package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "DonDatVe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonDatVe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_don_dat_ve")
    private Long idDonDatVe;

    @Column(name = "ma_don", unique = true, length = 20)
    private String maDon;

    @Column(name = "ma_dat_cho", unique = true, length = 20)
    private String maDatCho;

    @Column(name = "id_tai_khoan")
    private Long idTaiKhoan;

    @Column(name = "ho_ten_lien_lac", length = 100)
    private String hoTenLienLac;

    @Column(name = "email_dat_cho", length = 100)
    private String emailDatCho;

    @Column(name = "sdt_dat_cho", length = 15)
    private String sdtDatCho;

    @Column(name = "cccd", length = 20)
    private String cccd;

    @Column(name = "loai_ve", length = 20)
    private String loaiVe; // mot_chieu, khu_hoi

    @Column(name = "tong_tien", precision = 18, scale = 0)
    private BigDecimal tongTien;

    @Column(name = "tien_giam", precision = 18, scale = 0)
    private BigDecimal tienGiam;

    @Column(name = "tien_thanh_toan", precision = 18, scale = 0)
    private BigDecimal tienThanhToan;

    @Column(name = "id_khuyen_mai")
    private Long idKhuyenMai;

    @Column(name = "trang_thai", length = 30)
    private String trangThai; // cho_thanh_toan, da_thanh_toan, da_huy, het_han

    @Column(name = "thoi_gian_dat")
    private LocalDateTime thoiGianDat;

    @Column(name = "thoi_gian_het_han")
    private LocalDateTime thoiGianHetHan;

    @OneToMany(mappedBy = "donDatVe", fetch = FetchType.LAZY)
    private List<Ve> veList;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_don_dat_ve")
    private List<ThanhToan> thanhToanList;

    @PrePersist
    public void prePersist() {
        if (thoiGianDat == null) thoiGianDat = LocalDateTime.now();
        if (tienGiam == null) tienGiam = BigDecimal.ZERO;
    }
}
