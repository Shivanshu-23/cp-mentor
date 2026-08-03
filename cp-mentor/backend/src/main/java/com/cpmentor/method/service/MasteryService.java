package com.cpmentor.method.service;

import com.cpmentor.method.dto.MasteryDTOs.*;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.entity.TriggerEntry;
import com.cpmentor.method.repository.SolveSessionRepository;
import com.cpmentor.method.repository.TriggerEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Phase F — retention-weighted gamification. Deliberately does NOT compute
// XP, volume badges, or leaderboard rank; see the brief's "reward retention,
// not volume" principle and CLAUDE.md.
@Service
@RequiredArgsConstructor
public class MasteryService {

    private static final int TREND_WEEKS = 8;
    private static final DateTimeFormatter WEEK_LABEL_FORMAT = DateTimeFormatter.ofPattern("MMM d");

    private final TriggerEntryRepository triggerEntryRepository;
    private final SolveSessionRepository solveSessionRepository;

    @Transactional(readOnly = true)
    public MasteryResponse getMastery(String userEmail) {
        List<TriggerEntry> triggers = triggerEntryRepository.findByUserEmail(userEmail);
        List<SolveSession> completed = solveSessionRepository.findAllByUserEmail(userEmail).stream()
                .filter(s -> s.getEndedAt() != null)
                .toList();

        return new MasteryResponse(
            recallStreak(triggers),
            patternMastery(triggers),
            submissionsPerAccepted(completed)
        );
    }

    // Consecutive days with at least one recall-drill review, walking back from today.
    // Today gets a grace period: if today has no review yet, the streak still counts
    // through yesterday rather than showing 0 the moment the user wakes up.
    private int recallStreak(List<TriggerEntry> triggers) {
        var reviewDates = triggers.stream()
                .filter(t -> t.getLastReviewedAt() != null)
                .map(t -> t.getLastReviewedAt().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate today = LocalDate.now();
        int streak = 0;
        LocalDate cursor = today;

        if (reviewDates.contains(today)) {
            streak = 1;
            cursor = today.minusDays(1);
        } else {
            cursor = today.minusDays(1);
        }

        while (reviewDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    private List<PatternMasteryDTO> patternMastery(List<TriggerEntry> triggers) {
        Map<String, List<TriggerEntry>> byPattern = triggers.stream()
                .filter(t -> t.getPatternSlug() != null)
                .collect(Collectors.groupingBy(TriggerEntry::getPatternSlug));

        return byPattern.entrySet().stream()
                .map(e -> {
                    String slug = e.getKey();
                    List<TriggerEntry> entries = e.getValue();
                    long passCount = entries.stream().filter(t -> t.getLastReviewResult() == TriggerEntry.ReviewResult.PASS).count();
                    boolean anyRetired = entries.stream().anyMatch(t -> t.getReviewStage() >= 3);

                    MasteryTier tier;
                    if (anyRetired) tier = MasteryTier.MASTERED;
                    else if (passCount >= 3) tier = MasteryTier.SOLID;
                    else if (passCount >= 1) tier = MasteryTier.FAMILIAR;
                    else tier = MasteryTier.LEARNING;

                    return new PatternMasteryDTO(slug, tier, (int) passCount, anyRetired);
                })
                .sorted(Comparator.comparing(PatternMasteryDTO::patternSlug))
                .collect(Collectors.toList());
    }

    private SubmissionsPerAcceptedDTO submissionsPerAccepted(List<SolveSession> completed) {
        double current = round2(completed.stream().mapToInt(SolveSession::getSubmissionCount).average().orElse(0));

        Map<LocalDate, List<SolveSession>> byWeekStart = completed.stream()
                .filter(s -> s.getStartedAt() != null)
                .collect(Collectors.groupingBy(s ->
                        s.getStartedAt().toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))));

        LocalDate earliestWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusWeeks(TREND_WEEKS - 1L);

        List<SubmissionsTrendPointDTO> trend = new ArrayList<>();
        for (int i = 0; i < TREND_WEEKS; i++) {
            LocalDate weekStart = earliestWeek.plusWeeks(i);
            List<SolveSession> weekSessions = byWeekStart.getOrDefault(weekStart, List.of());
            double avg = weekSessions.isEmpty() ? 0
                    : round2(weekSessions.stream().mapToInt(SolveSession::getSubmissionCount).average().orElse(0));
            trend.add(new SubmissionsTrendPointDTO(weekStart.format(WEEK_LABEL_FORMAT), avg));
        }

        return new SubmissionsPerAcceptedDTO(current, 1.0, trend);
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}
