package com.cpmentor.ingestion.repository;

import com.cpmentor.ingestion.entity.DailyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {

    Optional<DailyChallenge> findByChallengeDate(LocalDate date);

    /** Fallback — most recent challenge if today's isn't fetched yet */
    Optional<DailyChallenge> findFirstByOrderByChallengeDateDesc();

    boolean existsByChallengeDate(LocalDate date);
}
