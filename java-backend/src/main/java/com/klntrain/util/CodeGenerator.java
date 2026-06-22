package com.klntrain.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CodeGenerator {

    private static final SecureRandom random = new SecureRandom();
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public static String genBookingCode() {
        StringBuilder sb = new StringBuilder("KLN");
        for (int i = 0; i < 6; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    public static String genOrderCode() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmm"));
        return "ORD" + ts + String.format("%03d", random.nextInt(1000));
    }

    public static String genTransactionCode() {
        return "TXN" + System.currentTimeMillis() + String.format("%03d", random.nextInt(1000));
    }

    public static String genInvoiceNumber() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "HD" + ts + String.format("%04d", random.nextInt(10000));
    }
}
