package com.klntrain.repository;

import com.klntrain.entity.ChinhSachHuy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChinhSachHuyRepository extends JpaRepository<ChinhSachHuy, Long> {

    @Query("SELECT c FROM ChinhSachHuy c WHERE c.gioTruocKhiChayTu <= :gioConLai AND (c.gioTruocKhiChayDen IS NULL OR c.gioTruocKhiChayDen >= :gioConLai) ORDER BY c.gioTruocKhiChayTu DESC")
    Optional<ChinhSachHuy> findApplicablePolicy(@Param("gioConLai") int gioConLai);
}
