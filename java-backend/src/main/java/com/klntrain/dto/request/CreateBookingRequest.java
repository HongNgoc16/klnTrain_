package com.klntrain.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateBookingRequest {
    private List<TripInfo> trips;
    private List<PassengerInfo> passengers;
    private ContactInfo contactInfo;
    private String maKhuyenMai;
    private String sessionId;

    @Data
    public static class TripInfo {
        private Long idChuyen;
        private Long idGaLen;
        private Long idGaXuong;
        private String sessionId;
        private List<PassengerSeat> passengerSeats;
    }

    @Data
    public static class PassengerSeat {
        private Integer soToaThuTu;
        private Integer seatNumber;
        private BigDecimal seatPrice;
    }

    @Data
    public static class PassengerInfo {
        private String hoTen;
        private String ngaySinh;
        private String cccd;
        private boolean isChild;
        private boolean isElderly;
        private boolean isStudent;
    }

    @Data
    public static class ContactInfo {
        private String hoTen;
        private String email;
        private String phone;
    }
}
