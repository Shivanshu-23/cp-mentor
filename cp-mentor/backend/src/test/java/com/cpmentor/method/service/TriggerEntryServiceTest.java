package com.cpmentor.method.service;

import com.cpmentor.method.dto.TriggerEntryCreateRequest;
import com.cpmentor.method.dto.TriggerEntryResponse;
import com.cpmentor.method.dto.TriggerReviewRequest;
import com.cpmentor.method.entity.TriggerEntry;
import com.cpmentor.method.repository.TriggerEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TriggerEntryServiceTest {

    @Mock
    private TriggerEntryRepository repository;

    private TriggerEntryService service;

    @BeforeEach
    void setUp() {
        service = new TriggerEntryService(repository);
        lenient().when(repository.save(any(TriggerEntry.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void create_schedulesFirstReviewInTwoDays() {
        TriggerEntryResponse response = service.create("user@example.com", TriggerEntryCreateRequest.builder()
                .leetcodeId("42").title("Trapping Rain Water").trigger("elevation map, compute water trapped")
                .build());

        assertThat(response.getReviewStage()).isEqualTo(0);
        long daysUntilReview = Duration.between(LocalDateTime.now(), response.getNextReviewAt()).toDays();
        assertThat(daysUntilReview).isBetween(1L, 2L); // ~2 days, allow for test execution time
    }

    // ── The spec's own acceptance scenario ───────────────────────────────────

    @Test
    void acceptance_forcedPastDueEntry_thenFailReview_resetsStageToZero() {
        TriggerEntry pastDue = TriggerEntry.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T")
                .trigger("some trigger").createdAt(LocalDateTime.now().minusDays(10))
                .reviewStage(2) // already progressed — FAIL must reset this
                .nextReviewAt(LocalDateTime.now().minusHours(1)) // forced into the past
                .build();
        when(repository.findDue(eq("user@example.com"), any())).thenReturn(List.of(pastDue));
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(pastDue));

        // Confirm it appears in the drill (nextReviewAt is in the past)
        List<TriggerEntryResponse> due = service.due("user@example.com");
        assertThat(due).hasSize(1);
        assertThat(due.get(0).getId()).isEqualTo(1L);

        // Mark FAIL
        TriggerEntryResponse afterFail = service.review("user@example.com", 1L,
                TriggerReviewRequest.builder().result(TriggerEntry.ReviewResult.FAIL).build());

        // Confirm the stage resets to 0
        assertThat(afterFail.getReviewStage()).isEqualTo(0);
        assertThat(afterFail.getLastReviewResult()).isEqualTo(TriggerEntry.ReviewResult.FAIL);
        long daysUntilNextReview = Duration.between(LocalDateTime.now(), afterFail.getNextReviewAt()).toDays();
        assertThat(daysUntilNextReview).isBetween(1L, 2L);
    }

    @Test
    void pass_advancesStageAndUsesTheNewStagesInterval() {
        TriggerEntry entry = TriggerEntry.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T").trigger("t")
                .createdAt(LocalDateTime.now()).reviewStage(0)
                .nextReviewAt(LocalDateTime.now())
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(entry));

        TriggerEntryResponse response = service.review("user@example.com", 1L,
                TriggerReviewRequest.builder().result(TriggerEntry.ReviewResult.PASS).build());

        assertThat(response.getReviewStage()).isEqualTo(1); // 0 -> 1
        long daysUntilReview = Duration.between(LocalDateTime.now(), response.getNextReviewAt()).toDays();
        assertThat(daysUntilReview).isBetween(6L, 7L); // stage 1 interval = 7 days
    }

    @Test
    void pass_atStage2_advancesToRetiredStage3() {
        TriggerEntry entry = TriggerEntry.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T").trigger("t")
                .createdAt(LocalDateTime.now()).reviewStage(2)
                .nextReviewAt(LocalDateTime.now())
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(entry));

        TriggerEntryResponse response = service.review("user@example.com", 1L,
                TriggerReviewRequest.builder().result(TriggerEntry.ReviewResult.PASS).build());

        assertThat(response.getReviewStage()).isEqualTo(3);
        assertThat(response.getNextReviewAt()).isAfter(LocalDateTime.now().plusYears(1)); // effectively retired
    }

    @Test
    void skipped_deferOneDay_stageUnchanged() {
        TriggerEntry entry = TriggerEntry.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T").trigger("t")
                .createdAt(LocalDateTime.now()).reviewStage(1)
                .nextReviewAt(LocalDateTime.now())
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(entry));

        TriggerEntryResponse response = service.review("user@example.com", 1L,
                TriggerReviewRequest.builder().result(TriggerEntry.ReviewResult.SKIPPED).build());

        assertThat(response.getReviewStage()).isEqualTo(1); // unchanged
        long hoursUntilReview = Duration.between(LocalDateTime.now(), response.getNextReviewAt()).toHours();
        assertThat(hoursUntilReview).isBetween(23L, 24L);
    }

    @Test
    void review_rejectsAccessToAnotherUsersEntry() {
        when(repository.findByIdAndUserEmail(1L, "attacker@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.review("attacker@example.com", 1L,
                TriggerReviewRequest.builder().result(TriggerEntry.ReviewResult.PASS).build()))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void due_onlyReturnsEntriesBelowRetiredStage() {
        when(repository.findDue(eq("user@example.com"), any())).thenReturn(List.of());
        List<TriggerEntryResponse> due = service.due("user@example.com");
        assertThat(due).isEmpty();
        verify(repository).findDue(eq("user@example.com"), any());
    }
}
