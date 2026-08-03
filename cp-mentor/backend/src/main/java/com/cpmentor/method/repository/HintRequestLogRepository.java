package com.cpmentor.method.repository;

import com.cpmentor.method.entity.HintRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HintRequestLogRepository extends JpaRepository<HintRequestLog, Long> {

    List<HintRequestLog> findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc(
            String userEmail, String problemIdentifier);
}
