package com.cpmentor.method.service;

import com.cpmentor.method.dto.StatsResponse;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.entity.TriggerEntry;
import com.cpmentor.method.repository.SolveSessionRepository;
import com.cpmentor.method.repository.TriggerEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final SolveSessionRepository solveSessionRepository;
    private final TriggerEntryRepository triggerEntryRepository;

    private static final int WEAK_PATTERN_WINDOW_DAYS = 14;
    private static final int RECENT_WINDOW = 5;
    private static final int MASTERED_THRESHOLD = 3;

    @Transactional(readOnly = true)
    public StatsResponse getStats(String userEmail) {
        List<SolveSession> completed = solveSessionRepository.findAllByUserEmail(userEmail).stream()
                .filter(s -> s.getEndedAt() != null)
                .toList();
        List<TriggerEntry> triggers = triggerEntryRepository.findByUserEmail(userEmail);

        return StatsResponse.builder()
                .problemsSolvedByDifficulty(problemsSolvedByDifficulty(completed, triggers))
                .averageSolveTimeSecondsOverall(round1(avgDuration(completed)))
                .averageSolveTimeSecondsRecent(round1(avgDuration(recentSessions(completed))))
                .solveTimeTrend(solveTimeTrend(completed))
                .averageSubmissionsPerProblem(round2(completed.stream().mapToInt(SolveSession::getSubmissionCount).average().orElse(0)))
                .unaidedSolveRatePercent(round1(unaidedRate(completed)))
                .patternsMastered(patternsMastered(triggers))
                .weakPatterns(weakPatterns(triggers))
                .triggersDueToday(triggerEntryRepository.countByUserEmailAndReviewStageLessThanAndNextReviewAtLessThanEqual(
                        userEmail, 3, LocalDateTime.now()))
                .retentionRatePercent(round1(retentionRate(triggers)))
                .build();
    }

    // A problem only counts toward the user's total once its trigger entry has survived at
    // least one review cycle (reviewStage >= 1) — per the feature spec's explicit rule.
    private Map<String, Long> problemsSolvedByDifficulty(List<SolveSession> completed, List<TriggerEntry> triggers) {
        Set<String> countedLeetcodeIds = triggers.stream()
                .filter(t -> t.getReviewStage() >= 1)
                .map(TriggerEntry::getLeetcodeId)
                .collect(Collectors.toSet());

        return completed.stream()
                .filter(s -> countedLeetcodeIds.contains(s.getLeetcodeId()))
                .collect(Collectors.groupingBy(
                        s -> s.getDifficulty() == null ? "Unknown" : s.getDifficulty(),
                        Collectors.collectingAndThen(
                                Collectors.mapping(SolveSession::getLeetcodeId, Collectors.toSet()),
                                set -> (long) set.size())));
    }

    private double avgDuration(List<SolveSession> sessions) {
        return sessions.stream()
                .filter(s -> s.getDurationSeconds() != null)
                .mapToInt(SolveSession::getDurationSeconds)
                .average().orElse(0);
    }

    private List<SolveSession> recentSessions(List<SolveSession> completed) {
        return completed.stream()
                .sorted(Comparator.comparing(SolveSession::getStartedAt).reversed())
                .limit(RECENT_WINDOW)
                .toList();
    }

    private String solveTimeTrend(List<SolveSession> completed) {
        if (completed.size() < RECENT_WINDOW * 2) return "NOT_ENOUGH_DATA";
        double overall = avgDuration(completed);
        double recent = avgDuration(recentSessions(completed));
        if (recent < overall * 0.95) return "IMPROVING"; // recent sessions faster
        if (recent > overall * 1.05) return "WORSENING";
        return "STABLE";
    }

    private double unaidedRate(List<SolveSession> completed) {
        if (completed.isEmpty()) return 0;
        return 100.0 * completed.stream().filter(SolveSession::isSolvedUnaided).count() / completed.size();
    }

    private int patternsMastered(List<TriggerEntry> triggers) {
        Map<String, Long> passCountByPattern = triggers.stream()
                .filter(t -> t.getLastReviewResult() == TriggerEntry.ReviewResult.PASS && t.getPatternSlug() != null)
                .collect(Collectors.groupingBy(TriggerEntry::getPatternSlug, Collectors.counting()));
        return (int) passCountByPattern.values().stream().filter(count -> count >= MASTERED_THRESHOLD).count();
    }

    private List<String> weakPatterns(List<TriggerEntry> triggers) {
        return weakPatternSlugs(triggers);
    }

    // Public entry point for PracticeQueueService — same "FAIL in the last 14
    // days" computation the progress dashboard's weakPatterns stat already
    // uses, exposed so the practice queue doesn't duplicate the rule.
    @Transactional(readOnly = true)
    public List<String> weakPatternSlugs(String userEmail) {
        return weakPatternSlugs(triggerEntryRepository.findByUserEmail(userEmail));
    }

    private List<String> weakPatternSlugs(List<TriggerEntry> triggers) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(WEAK_PATTERN_WINDOW_DAYS);
        return triggers.stream()
                .filter(t -> t.getLastReviewResult() == TriggerEntry.ReviewResult.FAIL
                        && t.getPatternSlug() != null
                        && t.getLastReviewedAt() != null
                        && t.getLastReviewedAt().isAfter(cutoff))
                .map(TriggerEntry::getPatternSlug)
                .distinct()
                .toList();
    }

    private double retentionRate(List<TriggerEntry> triggers) {
        long pass = triggers.stream().filter(t -> t.getLastReviewResult() == TriggerEntry.ReviewResult.PASS).count();
        long fail = triggers.stream().filter(t -> t.getLastReviewResult() == TriggerEntry.ReviewResult.FAIL).count();
        return (pass + fail) == 0 ? 0 : 100.0 * pass / (pass + fail);
    }

    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}
