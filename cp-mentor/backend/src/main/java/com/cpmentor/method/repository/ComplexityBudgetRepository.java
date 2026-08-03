package com.cpmentor.method.repository;

import com.cpmentor.method.entity.ComplexityBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplexityBudgetRepository extends JpaRepository<ComplexityBudget, Long> {
    List<ComplexityBudget> findAllByOrderByOrderIndexAsc();
}
