package com.klntrain.repository;

import com.klntrain.entity.TamGiuGhe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TamGiuGheRepository extends JpaRepository<TamGiuGhe, Long> {

    @Query("SELECT t FROM TamGiuGhe t WHERE t.idChuyen = :idChuyen AND t.soToaThuTu = :soToa AND t.soGheTrongToa IN :soGheList AND t.trangThai = 'dang_giu' AND t.thoiGianHetHan > :now AND (:sessionId IS NULL OR t.sessionId <> :sessionId)")
    List<TamGiuGhe> findConflictingHolds(@Param("idChuyen") Long idChuyen, @Param("soToa") Integer soToa, @Param("soGheList") List<Integer> soGheList, @Param("now") LocalDateTime now, @Param("sessionId") String sessionId);

    @Modifying
    @Query("UPDATE TamGiuGhe t SET t.trangThai = 'da_giai_phong' WHERE t.sessionId = :sessionId AND t.trangThai = 'dang_giu'")
    int releaseBySessionId(@Param("sessionId") String sessionId);

    @Modifying
    @Query("UPDATE TamGiuGhe t SET t.trangThai = 'da_giai_phong' WHERE t.thoiGianHetHan < :now AND t.trangThai = 'dang_giu'")
    int releaseExpired(@Param("now") LocalDateTime now);
}
