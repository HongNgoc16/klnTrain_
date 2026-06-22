package com.klntrain.repository;

import com.klntrain.entity.DieuPhoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DieuPhoiRepository extends JpaRepository<DieuPhoi, Long> {
    List<DieuPhoi> findByIdChuyenOrderByThoiGianTaoDesc(Long idChuyen);
}
