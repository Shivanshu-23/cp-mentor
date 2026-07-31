package com.cpmentor.problem.repository;

import com.cpmentor.problem.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findBySlug(String slug);
    Optional<Problem> findByLeetcodeId(String leetcodeId);

    @Query("SELECT p FROM Problem p ORDER BY p.fetchedAt DESC LIMIT 1")
    Optional<Problem> findLatest();
}
