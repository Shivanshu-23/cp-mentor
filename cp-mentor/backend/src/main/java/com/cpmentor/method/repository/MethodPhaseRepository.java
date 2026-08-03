package com.cpmentor.method.repository;

import com.cpmentor.method.entity.MethodPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MethodPhaseRepository extends JpaRepository<MethodPhase, Long> {
    List<MethodPhase> findAllByOrderByOrderIndexAsc();
}
