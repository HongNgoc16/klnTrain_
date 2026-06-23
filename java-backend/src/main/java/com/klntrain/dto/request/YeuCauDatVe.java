package com.klntrain.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class YeuCauDatVe {
    private List<ThongTinChuyen> trips;
    private List<ThongTinHanhKhach> passengers;
    private ThongTinLienLac contactInfo;
    private String maKhuyenMai;
    private String sessionId;

    @Data
    public static class ThongTinChuyen {
        private Long idChuyen;
        private Long idGaLen;
        private Long idGaXuong;
        private String sessionId;
        private List<GheHanhKhach> passengerSeats;
    }

    @Data
    public static class GheHanhKhach {
        private Integer soToaThuTu;
        private Integer soGhe;
        private BigDecimal giaVe;
    }

    @Data
    public static class ThongTinHanhKhach {
        private String hoTen;
        private String ngaySinh;
        private String cccd;
        private boolean laTreEm;
        private boolean laNguoiCaoTuoi;
        private boolean laSinhVien;
    }

    @Data
    public static class ThongTinLienLac {
        private String hoTen;
        private String email;
        private String soDienThoai;
    }
}
