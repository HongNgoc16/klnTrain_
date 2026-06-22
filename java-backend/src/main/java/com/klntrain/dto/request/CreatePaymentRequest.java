package com.klntrain.dto.request;

import lombok.Data;

@Data
public class CreatePaymentRequest {
    private Long idDonDatVe;
    private String phuongThuc; // vietqr, momo, zalopay, tien_mat
}
