package com.klntrain.dto.request;

import lombok.Data;

@Data
public class YeuCauDoiVe {
    private Long idVe;
    private Long idChuyenMoi;
    private Integer soToaMoi;
    private Integer soGheMoi;
    private Long idGaLenMoi;
    private Long idGaXuongMoi;
}
