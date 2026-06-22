package com.klntrain.service;

import com.klntrain.dto.request.LoginRequest;
import com.klntrain.dto.request.RegisterRequest;
import com.klntrain.entity.TaiKhoan;
import com.klntrain.repository.TaiKhoanRepository;
import com.klntrain.security.JwtTokenProvider;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TaiKhoanRepository taiKhoanRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public Map<String, Object> register(RegisterRequest req) {
        if (taiKhoanRepo.existsByEmail(req.getEmail().toLowerCase())) {
            throw AppException.badRequest("Email đã được đăng ký");
        }

        TaiKhoan tk = TaiKhoan.builder()
            .email(req.getEmail().toLowerCase().strip())
            .matKhau(passwordEncoder.encode(req.getMatKhau()))
            .hoTen(req.getHoTen().strip())
            .soDienThoai(req.getSoDienThoai())
            .vaiTro("khach_hang")
            .trangThai("hoat_dong")
            .build();

        tk = taiKhoanRepo.save(tk);
        String token = tokenProvider.generateToken(tk.getIdTaiKhoan(), tk.getEmail(), tk.getVaiTro());
        return Map.of("token", token, "user", sanitize(tk));
    }

    public Map<String, Object> login(LoginRequest req) {
        TaiKhoan tk = taiKhoanRepo.findByEmail(req.getEmail().toLowerCase())
            .orElseThrow(() -> AppException.unauthorized("Email hoặc mật khẩu không đúng"));

        if (!"hoat_dong".equals(tk.getTrangThai())) {
            throw AppException.unauthorized("Tài khoản đã bị khóa");
        }
        if (!passwordEncoder.matches(req.getMatKhau(), tk.getMatKhau())) {
            throw AppException.unauthorized("Email hoặc mật khẩu không đúng");
        }

        String token = tokenProvider.generateToken(tk.getIdTaiKhoan(), tk.getEmail(), tk.getVaiTro());
        return Map.of("token", token, "user", sanitize(tk));
    }

    public Map<String, Object> getProfile(Long idTaiKhoan) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy tài khoản"));
        return sanitize(tk);
    }

    public Map<String, Object> updateProfile(Long idTaiKhoan, Map<String, Object> data) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy tài khoản"));

        if (data.containsKey("hoTen"))       tk.setHoTen((String) data.get("hoTen"));
        if (data.containsKey("soDienThoai")) tk.setSoDienThoai((String) data.get("soDienThoai"));

        taiKhoanRepo.save(tk);
        return sanitize(tk);
    }

    public void changePassword(Long idTaiKhoan, String matKhauCu, String matKhauMoi) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(matKhauCu, tk.getMatKhau())) {
            throw AppException.badRequest("Mật khẩu cũ không đúng");
        }
        tk.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoanRepo.save(tk);
    }

    public Map<String, Object> refreshToken(Long idTaiKhoan) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy tài khoản"));
        if (!"hoat_dong".equals(tk.getTrangThai())) {
            throw AppException.unauthorized("Tài khoản đã bị khóa");
        }
        String token = tokenProvider.generateToken(tk.getIdTaiKhoan(), tk.getEmail(), tk.getVaiTro());
        return Map.of("token", token, "user", sanitize(tk));
    }

    private Map<String, Object> sanitize(TaiKhoan tk) {
        return Map.of(
            "id",          tk.getIdTaiKhoan(),
            "email",       tk.getEmail(),
            "hoTen",       tk.getHoTen(),
            "soDienThoai", tk.getSoDienThoai() != null ? tk.getSoDienThoai() : "",
            "vaiTro",      tk.getVaiTro(),
            "trangThai",   tk.getTrangThai()
        );
    }
}
