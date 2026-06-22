package com.klntrain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThongBao")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_thong_bao")
    private Long idThongBao;

    @Column(name = "id_tai_khoan")
    private Long idTaiKhoan;

    @Column(name = "tieu_de", length = 200)
    private String tieuDe;

    @Column(name = "noi_dung", length = 1000)
    private String noiDung;

    @Column(name = "loai", length = 30)
    private String loai; // delay, cancel, maintenance, info, payment

    @Column(name = "da_doc")
    private Boolean daDoc;

    @Column(name = "lien_ket", length = 200)
    private String lienKet;

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @PrePersist
    public void prePersist() {
        if (thoiGianTao == null) thoiGianTao = LocalDateTime.now();
        if (daDoc == null) daDoc = false;
    }
}
