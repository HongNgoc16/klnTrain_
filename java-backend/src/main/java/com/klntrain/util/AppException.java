package com.klntrain.util;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {
    private final HttpStatus status;

    public AppException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public static AppException badRequest(String msg) {
        return new AppException(HttpStatus.BAD_REQUEST, msg);
    }

    public static AppException notFound(String msg) {
        return new AppException(HttpStatus.NOT_FOUND, msg);
    }

    public static AppException unauthorized(String msg) {
        return new AppException(HttpStatus.UNAUTHORIZED, msg);
    }

    public static AppException conflict(String msg) {
        return new AppException(HttpStatus.CONFLICT, msg);
    }
}
