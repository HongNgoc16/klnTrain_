package com.klntrain.repository;

import com.klntrain.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {

    List<ThongBao> findByIdTaiKhoanOrderByThoiGianTaoDesc(Long idTaiKhoan);

    long countByIdTaiKhoanAndDaDocFalse(Long idTaiKhoan);

    @Modifying
    @Query("UPDATE ThongBao t SET t.daDoc = true WHERE t.idThongBao = :id AND t.idTaiKhoan = :idTK")
    int markAsRead(@Param("id") Long id, @Param("idTK") Long idTaiKhoan);

    @Modifying
    @Query("UPDATE ThongBao t SET t.daDoc = true WHERE t.idTaiKhoan = :idTK")
    int markAllAsRead(@Param("idTK") Long idTaiKhoan);
}
