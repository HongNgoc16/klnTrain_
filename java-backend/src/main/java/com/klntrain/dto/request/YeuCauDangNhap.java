package com.klntrain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YeuCauDangNhap {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String matKhau;
}
