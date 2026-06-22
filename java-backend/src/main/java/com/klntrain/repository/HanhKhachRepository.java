package com.klntrain.repository;

import com.klntrain.entity.HanhKhach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface HanhKhachRepository extends JpaRepository<HanhKhach, Long> {
    Optional<HanhKhach> findByHoTenAndNgaySinh(String hoTen, LocalDate ngaySinh);
}
