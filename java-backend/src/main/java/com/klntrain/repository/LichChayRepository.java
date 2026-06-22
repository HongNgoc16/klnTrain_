package com.klntrain.repository;

import com.klntrain.entity.LichChay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichChayRepository extends JpaRepository<LichChay, Long> {

    @Query("SELECT lc FROM LichChay lc JOIN FETCH lc.tau JOIN FETCH lc.gaDi JOIN FETCH lc.gaDen ORDER BY lc.gioKhoiHanh ASC")
    List<LichChay> findAllWithDetails();

    @Query("SELECT lc FROM LichChay lc JOIN FETCH lc.tau JOIN FETCH lc.gaDi JOIN FETCH lc.gaDen WHERE lc.tau.idTau = :idTau ORDER BY lc.gioKhoiHanh ASC")
    List<LichChay> findByTauIdWithDetails(@Param("idTau") Long idTau);
}
