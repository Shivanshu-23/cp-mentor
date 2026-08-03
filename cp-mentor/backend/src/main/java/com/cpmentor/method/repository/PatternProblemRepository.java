package com.cpmentor.method.repository;

import com.cpmentor.method.entity.PatternProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatternProblemRepository extends JpaRepository<PatternProblem, Long> {

    List<PatternProblem> findByPatternSlugOrderByOrderIndexAsc(String patternSlug);

    boolean existsByPatternSlugAndLeetcodeId(String patternSlug, String leetcodeId);
}
