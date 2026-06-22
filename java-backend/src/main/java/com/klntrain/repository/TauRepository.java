package com.klntrain.repository;

import com.klntrain.entity.Tau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TauRepository extends JpaRepository<Tau, Long> {
    List<Tau> findAllByOrderBySoHieuAsc();
    List<Tau> findByTrangThai(String trangThai);
}
