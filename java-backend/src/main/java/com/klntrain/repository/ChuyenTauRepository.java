package com.klntrain.repository;

import com.klntrain.entity.ChuyenTau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ChuyenTauRepository extends JpaRepository<ChuyenTau, Long> {

    List<ChuyenTau> findByNgayChayOrderByLichChayGioKhoiHanhAsc(LocalDate ngayChay);

    @Query("SELECT ct FROM ChuyenTau ct JOIN FETCH ct.lichChay lc JOIN FETCH lc.tau JOIN FETCH lc.gaDi JOIN FETCH lc.gaDen WHERE ct.ngayChay = :ngay ORDER BY lc.gioKhoiHanh ASC")
    List<ChuyenTau> findByNgayChayWithDetails(@Param("ngay") LocalDate ngay);

    @Query("SELECT COUNT(ct) FROM ChuyenTau ct WHERE ct.lichChay.idLichChay = :idLichChay")
    long countByIdLichChay(@Param("idLichChay") Long idLichChay);

    @Query("SELECT ct FROM ChuyenTau ct WHERE ct.lichChay.idLichChay = :idLichChay AND ct.ngayChay BETWEEN :tuNgay AND :denNgay")
    List<ChuyenTau> findByLichChayAndDateRange(@Param("idLichChay") Long idLichChay, @Param("tuNgay") LocalDate tuNgay, @Param("denNgay") LocalDate denNgay);
}
