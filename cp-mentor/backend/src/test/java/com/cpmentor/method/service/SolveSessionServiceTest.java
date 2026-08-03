package com.cpmentor.method.service;

import com.cpmentor.method.dto.SolveSessionCompleteRequest;
import com.cpmentor.method.dto.SolveSessionCreateRequest;
import com.cpmentor.method.dto.SolveSessionResponse;
import com.cpmentor.method.dto.SolveSessionUpdateRequest;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.repository.SolveSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SolveSessionServiceTest {

    @Mock
    private SolveSessionRepository repository;

    private SolveSessionService service;

    @BeforeEach
    void setUp() {
        service = new SolveSessionService(repository);
        lenient().when(repository.save(any(SolveSession.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void create_startsSessionWithNowTimestamp() {
        SolveSessionResponse response = service.create("user@example.com", SolveSessionCreateRequest.builder()
                .leetcodeId("42").title("Trapping Rain Water").difficulty("Hard").build());

        assertThat(response.getLeetcodeId()).isEqualTo("42");
        assertThat(response.getStartedAt()).isNotNull();
        assertThat(response.getEndedAt()).isNull();
        assertThat(response.getDurationSeconds()).isNull();
    }

    @Test
    void update_onlyOverwritesFieldsThatWereProvided() {
        SolveSession existing = SolveSession.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T")
                .startedAt(LocalDateTime.now())
                .constraintNotes("original constraint notes")
                .restatement("original restatement")
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(existing));

        service.update("user@example.com", 1L, SolveSessionUpdateRequest.builder()
                .restatement("updated restatement")
                .build());

        ArgumentCaptor<SolveSession> captor = ArgumentCaptor.forClass(SolveSession.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getRestatement()).isEqualTo("updated restatement");
        assertThat(captor.getValue().getConstraintNotes()).isEqualTo("original constraint notes"); // untouched
    }

    @Test
    void update_rejectsAccessToAnotherUsersSession() {
        when(repository.findByIdAndUserEmail(1L, "attacker@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update("attacker@example.com", 1L,
                SolveSessionUpdateRequest.builder().restatement("hijacked").build()))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void complete_computesDurationFromStartToNow() {
        LocalDateTime start = LocalDateTime.now().minusMinutes(12);
        SolveSession existing = SolveSession.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T")
                .startedAt(start).submissionCount(2)
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(existing));

        SolveSessionResponse response = service.complete("user@example.com", 1L,
                SolveSessionCompleteRequest.builder().solvedUnaided(true).build());

        assertThat(response.getEndedAt()).isNotNull();
        assertThat(response.getDurationSeconds()).isGreaterThanOrEqualTo(700); // ~12 min, allow test jitter
        assertThat(response.isSolvedUnaided()).isTrue();
        assertThat(response.getSubmissionCount()).isEqualTo(2); // preserved from before completion
    }

    @Test
    void complete_withNullBody_stillCompletesSuccessfully() {
        SolveSession existing = SolveSession.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T")
                .startedAt(LocalDateTime.now().minusMinutes(5))
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(existing));

        SolveSessionResponse response = service.complete("user@example.com", 1L, null);

        assertThat(response.getEndedAt()).isNotNull();
        assertThat(response.getDurationSeconds()).isNotNull();
    }

    @Test
    void movesFiredDefaultsToEmptyNotNull() {
        SolveSessionResponse response = service.create("user@example.com", SolveSessionCreateRequest.builder()
                .leetcodeId("42").title("T").build());

        assertThat(response.getMovesFired()).isNotNull().isEmpty();
        assertThat(response.getEdgeCasesChecked()).isNotNull().isEmpty();
    }

    @Test
    void update_replacesMovesFiredList() {
        SolveSession existing = SolveSession.builder()
                .id(1L).userEmail("user@example.com").leetcodeId("42").title("T")
                .startedAt(LocalDateTime.now())
                .build();
        when(repository.findByIdAndUserEmail(1L, "user@example.com")).thenReturn(Optional.of(existing));

        service.update("user@example.com", 1L, SolveSessionUpdateRequest.builder()
                .movesFired(List.of(SolveSession.Move.MONOTONIC_POINTER, SolveSession.Move.SORT_FIRST))
                .build());

        ArgumentCaptor<SolveSession> captor = ArgumentCaptor.forClass(SolveSession.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getMovesFired())
                .containsExactly(SolveSession.Move.MONOTONIC_POINTER, SolveSession.Move.SORT_FIRST);
    }
}
