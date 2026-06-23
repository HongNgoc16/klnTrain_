package com.klntrain.util;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class NgoaiLeUngDung extends RuntimeException {
    private final HttpStatus status;

    public NgoaiLeUngDung(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public static NgoaiLeUngDung loiYeuCau(String msg) {
        return new NgoaiLeUngDung(HttpStatus.BAD_REQUEST, msg);
    }

    public static NgoaiLeUngDung khongTimThay(String msg) {
        return new NgoaiLeUngDung(HttpStatus.NOT_FOUND, msg);
    }

    public static NgoaiLeUngDung chuaXacThuc(String msg) {
        return new NgoaiLeUngDung(HttpStatus.UNAUTHORIZED, msg);
    }

    public static NgoaiLeUngDung xungDot(String msg) {
        return new NgoaiLeUngDung(HttpStatus.CONFLICT, msg);
    }
}
