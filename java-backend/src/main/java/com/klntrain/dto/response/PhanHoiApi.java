package com.klntrain.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PhanHoiApi<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> PhanHoiApi<T> thanhCong(T data, String message) {
        return new PhanHoiApi<>(true, message, data);
    }

    public static <T> PhanHoiApi<T> thanhCong(T data) {
        return new PhanHoiApi<>(true, null, data);
    }

    public static <T> PhanHoiApi<T> loi(String message) {
        return new PhanHoiApi<>(false, message, null);
    }
}
