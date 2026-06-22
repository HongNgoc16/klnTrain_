package com.klntrain.repository;

import com.klntrain.entity.Ve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {

    List<Ve> findByDonDatVeIdDonDatVe(Long idDonDatVe);

    @Query("SELECT v FROM Ve v WHERE v.chuyenTau.idChuyen = :idChuyen AND v.trangThai NOT IN ('da_huy','da_doi')")
    List<Ve> findActiveByIdChuyen(@Param("idChuyen") Long idChuyen);

    @Query("SELECT COUNT(v) FROM Ve v WHERE v.chuyenTau.idChuyen = :idChuyen AND v.soToaThuTu = :soToa AND v.soGheTrongToa = :soGhe AND v.trangThai NOT IN ('da_huy','da_doi')")
    long countActiveByChuyenAndGhe(@Param("idChuyen") Long idChuyen, @Param("soToa") Integer soToa, @Param("soGhe") Integer soGhe);

    @Query("SELECT COUNT(v) FROM Ve v WHERE v.chuyenTau.idChuyen = :idChuyen AND v.soToaThuTu = :soToa AND v.trangThai NOT IN ('da_huy','da_doi')")
    long countActiveByChuyenAndToa(@Param("idChuyen") Long idChuyen, @Param("soToa") Integer soToa);
}
