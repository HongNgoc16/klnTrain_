package com.klntrain.config;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.util.NgoaiLeUngDung;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class XuLyNgoaiLeChung {

    @ExceptionHandler(NgoaiLeUngDung.class)
    public ResponseEntity<PhanHoiApi<Void>> xuLyNgoaiLeUngDung(NgoaiLeUngDung ex) {
        return ResponseEntity.status(ex.getStatus())
            .body(PhanHoiApi.loi(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<PhanHoiApi<Void>> xuLyLoiHopLe(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(PhanHoiApi.loi("Dữ liệu không hợp lệ: " + msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<PhanHoiApi<Void>> xuLyLoiChung(Exception ex) {
        return ResponseEntity.internalServerError()
            .body(PhanHoiApi.loi("Lỗi hệ thống: " + ex.getMessage()));
    }
}
