package com.cpmentor.company.repository;

import com.cpmentor.company.entity.CompanyProblem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyProblemRepository extends JpaRepository<CompanyProblem, Long> {

    Page<CompanyProblem> findByCompanyAndTimeframe(String company, String timeframe, Pageable pageable);

    Page<CompanyProblem> findByCompanyAndTimeframeAndDifficulty(
            String company, String timeframe, String difficulty, Pageable pageable);

    // Phase 6 company/pattern cross-link — leetcodeIds resolved from PatternProblem by the service.
    Page<CompanyProblem> findByCompanyAndTimeframeAndLeetcodeIdIn(
            String company, String timeframe, List<String> leetcodeIds, Pageable pageable);

    Page<CompanyProblem> findByCompanyAndTimeframeAndDifficultyAndLeetcodeIdIn(
            String company, String timeframe, String difficulty, List<String> leetcodeIds, Pageable pageable);

    boolean existsByLeetcodeIdAndCompanyAndTimeframe(String leetcodeId, String company, String timeframe);

    long countByCompanyAndTimeframe(String company, String timeframe);

    @Query("SELECT DISTINCT c.company FROM CompanyProblem c ORDER BY c.company")
    List<String> findAllDistinctCompanies();

    // Phase E company-frequency join (v2): "asked by Amazon N times" for a pattern's problem
    // set. Restricted to timeframe='all' by the caller to avoid double-counting the same
    // problem across multiple timeframe buckets (thirty-days/six-months/etc. all overlap).
    @Query("SELECT c.company AS company, COUNT(c) AS cnt FROM CompanyProblem c " +
           "WHERE c.timeframe = :timeframe AND c.leetcodeId IN :leetcodeIds " +
           "GROUP BY c.company ORDER BY cnt DESC")
    List<CompanyFrequencyProjection> countByLeetcodeIdsGroupByCompany(
            @org.springframework.data.repository.query.Param("leetcodeIds") List<String> leetcodeIds,
            @org.springframework.data.repository.query.Param("timeframe") String timeframe);

    interface CompanyFrequencyProjection {
        String getCompany();
        long getCnt();
    }
}
