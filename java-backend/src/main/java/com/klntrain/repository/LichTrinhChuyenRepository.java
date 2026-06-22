package com.klntrain.repository;

import com.klntrain.entity.LichTrinhChuyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LichTrinhChuyenRepository extends JpaRepository<LichTrinhChuyen, Long> {

    @Query("SELECT ltc FROM LichTrinhChuyen ltc JOIN FETCH ltc.gaTau WHERE ltc.idLichChay = :idLichChay ORDER BY ltc.thuTuDung ASC")
    List<LichTrinhChuyen> findByIdLichChayWithGa(@Param("idLichChay") Long idLichChay);

    Optional<LichTrinhChuyen> findByIdLichChayAndIdGa(Long idLichChay, Long idGa);

    @Query("SELECT ltc FROM LichTrinhChuyen ltc WHERE ltc.idLichChay = :idLichChay AND ltc.thuTuDung > :thuTuDung ORDER BY ltc.thuTuDung ASC")
    List<LichTrinhChuyen> findSubsequent(@Param("idLichChay") Long idLichChay, @Param("thuTuDung") Integer thuTuDung);

    void deleteByIdLichChay(Long idLichChay);
}
