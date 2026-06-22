package com.klntrain.repository;

import com.klntrain.entity.GaTau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GaTauRepository extends JpaRepository<GaTau, Long> {
    List<GaTau> findByTrangThaiOrderByThuTuTuyenAsc(String trangThai);
}
