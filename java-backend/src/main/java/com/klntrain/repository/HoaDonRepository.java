package com.klntrain.repository;

import com.klntrain.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    Optional<HoaDon> findBySoHoaDon(String soHoaDon);
    Optional<HoaDon> findByIdDonDatVe(Long idDonDatVe);
}
