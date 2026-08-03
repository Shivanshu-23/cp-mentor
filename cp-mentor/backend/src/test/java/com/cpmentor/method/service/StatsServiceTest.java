package com.cpmentor.method.service;

import com.cpmentor.method.dto.StatsResponse;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.entity.TriggerEntry;
import com.cpmentor.method.repository.SolveSessionRepository;
import com.cpmentor.method.repository.TriggerEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock private SolveSessionRepository solveSessionRepository;
    @Mock private TriggerEntryRepository triggerEntryRepository;

    private StatsService service;

    @BeforeEach
    void setUp() {
        service = new StatsService(solveSessionRepository, triggerEntryRepository);
        lenient().when(triggerEntryRepository.countByUserEmailAndReviewStageLessThanAndNextReviewAtLessThanEqual(
                anyString(), anyInt(), any())).thenReturn(0L);
    }

    @Test
    void problemCountOnlyIncludesTriggersThatSurvivedAtLeastOneReview() {
        SolveSession solvedButNotReviewed = session("1", "Easy", true);
        SolveSession solvedAndReviewed = session("2", "Medium", true);
        when(solveSessionRepository.findAllByUserEmail("u")).thenReturn(List.of(solvedButNotReviewed, solvedAndReviewed));
        when(triggerEntryRepository.findByUserEmail("u")).thenReturn(List.of(
                trigger("1", 0, null, null),  // reviewStage 0 — doesn't count yet
                trigger("2", 1, null, null))); // reviewStage 1 — counts

        StatsResponse stats = service.getStats("u");

        assertThat(stats.getProblemsSolvedByDifficulty()).containsEntry("Medium", 1L);
        assertThat(stats.getProblemsSolvedByDifficulty()).doesNotContainKey("Easy");
    }

    @Test
    void patternsMastered_requiresThreeOrMorePassEntries() {
        when(solveSessionRepository.findAllByUserEmail("u")).thenReturn(List.of());
        when(triggerEntryRepository.findByUserEmail("u")).thenReturn(List.of(
                trigger("1", 0, "monotonic-stack", TriggerEntry.ReviewResult.PASS),
                trigger("2", 0, "monotonic-stack", TriggerEntry.ReviewResult.PASS),
                trigger("3", 0, "monotonic-stack", TriggerEntry.ReviewResult.PASS),
                trigger("4", 0, "two-pointer", TriggerEntry.ReviewResult.PASS),
                trigger("5", 0, "two-pointer", TriggerEntry.ReviewResult.PASS)));

        StatsResponse stats = service.getStats("u");

        assertThat(stats.getPatternsMastered()).isEqualTo(1); // only monotonic-stack has 3+
    }

    @Test
    void weakPatterns_onlyIncludesFailuresWithinTheLast14Days() {
        when(solveSessionRepository.findAllByUserEmail("u")).thenReturn(List.of());
        TriggerEntry recentFail = trigger("1", 0, "two-pointer", TriggerEntry.ReviewResult.FAIL);
        recentFail.setLastReviewedAt(LocalDateTime.now().minusDays(3));
        TriggerEntry oldFail = trigger("2", 0, "sliding-window-variable", TriggerEntry.ReviewResult.FAIL);
        oldFail.setLastReviewedAt(LocalDateTime.now().minusDays(30));
        when(triggerEntryRepository.findByUserEmail("u")).thenReturn(List.of(recentFail, oldFail));

        StatsResponse stats = service.getStats("u");

        assertThat(stats.getWeakPatterns()).containsExactly("two-pointer");
    }

    @Test
    void retentionRate_isPassOverPassPlusFail() {
        when(solveSessionRepository.findAllByUserEmail("u")).thenReturn(List.of());
        when(triggerEntryRepository.findByUserEmail("u")).thenReturn(List.of(
                trigger("1", 0, "a", TriggerEntry.ReviewResult.PASS),
                trigger("2", 0, "a", TriggerEntry.ReviewResult.PASS),
                trigger("3", 0, "a", TriggerEntry.ReviewResult.PASS),
                trigger("4", 0, "a", TriggerEntry.ReviewResult.FAIL)));

        StatsResponse stats = service.getStats("u");

        assertThat(stats.getRetentionRatePercent()).isEqualTo(75.0);
    }

    @Test
    void noData_returnsZeroesNotErrors() {
        when(solveSessionRepository.findAllByUserEmail("u")).thenReturn(List.of());
        when(triggerEntryRepository.findByUserEmail("u")).thenReturn(List.of());

        StatsResponse stats = service.getStats("u");

        assertThat(stats.getRetentionRatePercent()).isEqualTo(0.0);
        assertThat(stats.getUnaidedSolveRatePercent()).isEqualTo(0.0);
        assertThat(stats.getSolveTimeTrend()).isEqualTo("NOT_ENOUGH_DATA");
        assertThat(stats.getPatternsMastered()).isZero();
        assertThat(stats.getWeakPatterns()).isEmpty();
    }

    private SolveSession session(String leetcodeId, String difficulty, boolean unaided) {
        return SolveSession.builder()
                .id(1L).userEmail("u").leetcodeId(leetcodeId).title("T").difficulty(difficulty)
                .startedAt(LocalDateTime.now().minusMinutes(20))
                .endedAt(LocalDateTime.now())
                .durationSeconds(600)
                .submissionCount(1)
                .solvedUnaided(unaided)
                .build();
    }

    private TriggerEntry trigger(String leetcodeId, int reviewStage, String patternSlug, TriggerEntry.ReviewResult result) {
        return TriggerEntry.builder()
                .id(1L).userEmail("u").leetcodeId(leetcodeId).title("T").trigger("t")
                .createdAt(LocalDateTime.now()).reviewStage(reviewStage)
                .nextReviewAt(LocalDateTime.now())
                .patternSlug(patternSlug)
                .lastReviewResult(result)
                .build();
    }
}
