package com.klntrain.service;

import com.klntrain.dto.request.YeuCauDangNhap;
import com.klntrain.dto.request.YeuCauDangKy;
import com.klntrain.entity.TaiKhoan;
import com.klntrain.repository.TaiKhoanRepository;
import com.klntrain.security.NhaCungCapToken;
import com.klntrain.util.NgoaiLeUngDung;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class XacThucService {

    private final TaiKhoanRepository taiKhoanRepo;
    private final PasswordEncoder passwordEncoder;
    private final NhaCungCapToken nhaCungCapToken;

    public Map<String, Object> dangKy(YeuCauDangKy req) {
        if (taiKhoanRepo.existsByEmail(req.getEmail().toLowerCase())) {
            throw NgoaiLeUngDung.loiYeuCau("Email đã được đăng ký");
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
        String token = nhaCungCapToken.taoToken(tk.getIdTaiKhoan(), tk.getEmail(), tk.getVaiTro());
        return Map.of("token", token, "user", lamSachThongTin(tk));
    }

    public Map<String, Object> dangNhap(YeuCauDangNhap req) {
        TaiKhoan tk = taiKhoanRepo.findByEmail(req.getEmail().toLowerCase())
            .orElseThrow(() -> NgoaiLeUngDung.chuaXacThuc("Email hoặc mật khẩu không đúng"));

        if (!"hoat_dong".equals(tk.getTrangThai())) {
            throw NgoaiLeUngDung.chuaXacThuc("Tài khoản đã bị khóa");
        }
        if (!passwordEncoder.matches(req.getMatKhau(), tk.getMatKhau())) {
            throw NgoaiLeUngDung.chuaXacThuc("Email hoặc mật khẩu không đúng");
        }

        String token = nhaCungCapToken.taoToken(tk.getIdTaiKhoan(), tk.getEmail(), tk.getVaiTro());
        return Map.of("token", token, "user", lamSachThongTin(tk));
    }

    public Map<String, Object> layHoSo(Long idTaiKhoan) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy tài khoản"));
        return lamSachThongTin(tk);
    }

    public Map<String, Object> capNhatHoSo(Long idTaiKhoan, Map<String, Object> data) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy tài khoản"));

        if (data.containsKey("hoTen"))       tk.setHoTen((String) data.get("hoTen"));
        if (data.containsKey("soDienThoai")) tk.setSoDienThoai((String) data.get("soDienThoai"));

        taiKhoanRepo.save(tk);
        return lamSachThongTin(tk);
    }

    public void doiMatKhau(Long idTaiKhoan, String matKhauCu, String matKhauMoi) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(matKhauCu, tk.getMatKhau())) {
            throw NgoaiLeUngDung.loiYeuCau("Mật khẩu cũ không đúng");
        }
        tk.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoanRepo.save(tk);
    }

    public Map<String, Object> lamMoiToken(Long idTaiKhoan) {
        TaiKhoan tk = taiKhoanRepo.findById(idTaiKhoan)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy tài khoản"));
        if (!"hoat_dong".equals(tk.getTrangThai())) {
            throw NgoaiLeUngDung.chuaXacThuc("Tài khoản đã bị khóa");
        }
        String token = nhaCungCapToken.taoToken(tk.getIdTaiKhoan(), tk.getEmail(), tk.getVaiTro());
        return Map.of("token", token, "user", lamSachThongTin(tk));
    }

    private Map<String, Object> lamSachThongTin(TaiKhoan tk) {
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
