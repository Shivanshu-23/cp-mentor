package com.cpmentor.method.repository;

import com.cpmentor.method.entity.InterviewScriptStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewScriptStepRepository extends JpaRepository<InterviewScriptStep, Long> {
    List<InterviewScriptStep> findAllByOrderByOrderIndexAsc();
}
