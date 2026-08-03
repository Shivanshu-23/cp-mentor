package com.cpmentor.method.repository;

import com.cpmentor.method.entity.RecoveryStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecoveryStepRepository extends JpaRepository<RecoveryStep, Long> {
    List<RecoveryStep> findAllByOrderByOrderIndexAsc();
}
