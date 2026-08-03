package com.cpmentor.method.repository;

import com.cpmentor.method.entity.OptimizationMove;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OptimizationMoveRepository extends JpaRepository<OptimizationMove, Long> {
    List<OptimizationMove> findAllByOrderByIdAsc();
    Optional<OptimizationMove> findByCode(String code);
    boolean existsByCode(String code);
}
