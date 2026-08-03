package com.cpmentor.method.repository;

import com.cpmentor.method.entity.StuckRung;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StuckRungRepository extends JpaRepository<StuckRung, Long> {
    List<StuckRung> findAllByOrderByRungAsc();
    boolean existsByRung(int rung);
}
