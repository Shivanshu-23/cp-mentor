package com.cpmentor.method.repository;

import com.cpmentor.method.entity.SolveSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolveSessionRepository extends JpaRepository<SolveSession, Long> {

    Page<SolveSession> findByUserEmail(String userEmail, Pageable pageable);

    List<SolveSession> findAllByUserEmail(String userEmail); // unpaged — used by StatsService

    Page<SolveSession> findByUserEmailAndDifficulty(String userEmail, String difficulty, Pageable pageable);

    Page<SolveSession> findByUserEmailAndSolvedUnaided(String userEmail, boolean solvedUnaided, Pageable pageable);

    Optional<SolveSession> findByIdAndUserEmail(Long id, String userEmail);
}
