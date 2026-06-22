package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThanhToan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_thanh_toan")
    private Long idThanhToan;

    @Column(name = "id_don_dat_ve")
    private Long idDonDatVe;

    @Column(name = "ma_giao_dich", length = 50)
    private String maGiaoDich;

    @Column(name = "phuong_thuc", length = 30)
    private String phuongThuc; // vietqr, momo, zalopay, tien_mat

    @Column(name = "so_tien", precision = 18, scale = 0)
    private BigDecimal soTien;

    @Column(name = "trang_thai", length = 20)
    private String trangThai; // dang_xu_ly, thanh_cong, that_bai, het_han

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @Column(name = "thoi_gian_thanh_toan")
    private LocalDateTime thoiGianThanhToan;

    @Column(name = "noi_dung_ck", length = 200)
    private String noiDungCk;

    @Column(name = "qr_code", length = 500)
    private String qrCode;

    @PrePersist
    public void prePersist() {
        if (thoiGianTao == null) thoiGianTao = LocalDateTime.now();
    }
}
