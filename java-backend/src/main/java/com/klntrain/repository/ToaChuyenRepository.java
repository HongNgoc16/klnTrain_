package com.klntrain.repository;

import com.klntrain.entity.ToaChuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToaChuyenRepository extends JpaRepository<ToaChuyen, Long> {

    @Query("SELECT tc FROM ToaChuyen tc LEFT JOIN FETCH tc.loaiToa WHERE tc.idChuyen = :idChuyen ORDER BY tc.soToaThuTu ASC")
    List<ToaChuyen> findByIdChuyenWithLoaiToa(@Param("idChuyen") Long idChuyen);

    Optional<ToaChuyen> findByIdChuyenAndSoToaThuTu(Long idChuyen, Integer soToaThuTu);
    boolean existsByIdChuyenAndSoToaThuTu(Long idChuyen, Integer soToaThuTu);
}
