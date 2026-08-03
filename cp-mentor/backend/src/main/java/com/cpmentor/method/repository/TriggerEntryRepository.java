package com.cpmentor.method.repository;

import com.cpmentor.method.entity.TriggerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TriggerEntryRepository extends JpaRepository<TriggerEntry, Long> {

    Optional<TriggerEntry> findByIdAndUserEmail(Long id, String userEmail);

    List<TriggerEntry> findByUserEmail(String userEmail);

    @Query("SELECT t FROM TriggerEntry t WHERE t.userEmail = :userEmail "
            + "AND t.nextReviewAt <= :now AND t.reviewStage < 3 ORDER BY t.nextReviewAt ASC")
    List<TriggerEntry> findDue(@Param("userEmail") String userEmail, @Param("now") LocalDateTime now);

    long countByUserEmailAndReviewStageLessThanAndNextReviewAtLessThanEqual(
            String userEmail, int reviewStage, LocalDateTime now);
}
