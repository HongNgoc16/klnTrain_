package com.klntrain.repository;

import com.klntrain.entity.HoanTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HoanTienRepository extends JpaRepository<HoanTien, Long> {
}
