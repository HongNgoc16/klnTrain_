package com.klntrain.repository;

import com.klntrain.entity.DonDatVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonDatVeRepository extends JpaRepository<DonDatVe, Long> {

    Optional<DonDatVe> findByMaDatCho(String maDatCho);
    Optional<DonDatVe> findByMaDon(String maDon);
    boolean existsByMaDatCho(String maDatCho);

    @Query("SELECT d FROM DonDatVe d WHERE d.idTaiKhoan = :idTK ORDER BY d.thoiGianDat DESC")
    List<DonDatVe> findByIdTaiKhoanOrderByThoiGianDatDesc(@Param("idTK") Long idTaiKhoan);
}
