package com.cpmentor.method.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    /** Distinct problems solved per difficulty — only counts once its trigger's reviewStage >= 1. */
    private Map<String, Long> problemsSolvedByDifficulty;

    private Double averageSolveTimeSecondsOverall;
    private Double averageSolveTimeSecondsRecent; // last 5 completed sessions
    private String solveTimeTrend; // IMPROVING | WORSENING | STABLE | NOT_ENOUGH_DATA

    private Double averageSubmissionsPerProblem; // target 1
    private Double unaidedSolveRatePercent;

    private int patternsMastered; // patterns with 3+ PASS trigger entries
    private List<String> weakPatterns; // patterns with any FAIL reviewed in the last 14 days

    private long triggersDueToday;
    private Double retentionRatePercent; // PASS / (PASS + FAIL) across all reviewed entries
}
