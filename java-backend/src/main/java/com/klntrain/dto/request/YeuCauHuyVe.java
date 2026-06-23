package com.klntrain.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class YeuCauHuyVe {
    private String maDatCho;
    private List<Long> idVeList;
    private String lyDo;
}
