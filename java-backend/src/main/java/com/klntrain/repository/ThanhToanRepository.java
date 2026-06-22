package com.klntrain.repository;

import com.klntrain.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Long> {
    Optional<ThanhToan> findFirstByIdDonDatVeAndTrangThaiOrderByIdThanhToanDesc(Long idDonDatVe, String trangThai);
    Optional<ThanhToan> findByMaGiaoDich(String maGiaoDich);
}
