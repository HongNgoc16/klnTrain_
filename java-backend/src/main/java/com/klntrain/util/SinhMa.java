package com.klntrain.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class SinhMa {

    private static final SecureRandom random = new SecureRandom();
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public static String sinhMaDatCho() {
        StringBuilder sb = new StringBuilder("KLN");
        for (int i = 0; i < 6; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    public static String sinhMaDon() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmm"));
        return "ORD" + ts + String.format("%03d", random.nextInt(1000));
    }

    public static String sinhMaGiaoDich() {
        return "TXN" + System.currentTimeMillis() + String.format("%03d", random.nextInt(1000));
    }

    public static String sinhSoHoaDon() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "HD" + ts + String.format("%04d", random.nextInt(10000));
    }
}
