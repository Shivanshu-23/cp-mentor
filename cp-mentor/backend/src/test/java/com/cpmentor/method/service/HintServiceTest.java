package com.cpmentor.method.service;

import com.cpmentor.method.dto.HintRequest;
import com.cpmentor.method.dto.HintResponse;
import com.cpmentor.method.dto.PatternCandidateDTO;
import com.cpmentor.method.dto.PatternIdentificationResponse;
import com.cpmentor.method.entity.HintRequestLog;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.repository.HintRequestLogRepository;
import com.cpmentor.method.repository.PatternRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HintServiceTest {

    // The actual seeded pattern library names (data/patterns.json) — a level-1 hint must
    // never contain any of these, since level 1 is not allowed to name a pattern.
    private static final List<String> ALL_PATTERN_NAMES = List.of(
            "Two Pointer", "Sliding Window (Fixed Size)", "Sliding Window (Variable Size)",
            "Prefix Sum", "Binary Search on an Array", "Binary Search on the Answer",
            "Hashing & Frequency Counting", "Sort Then Greedy", "Interval Scheduling & Merging",
            "Monotonic Stack", "Monotonic Deque", "Heap for Top-K",
            "Linked List Fast & Slow Pointers", "Backtracking", "Bit Manipulation",
            "Tree Depth-First Search", "Tree Breadth-First Search", "BST Properties", "Trie (Prefix Tree)",
            "Graph BFS/DFS Traversal", "Topological Sort", "Union-Find (Disjoint Set)",
            "Weighted Shortest Path (Dijkstra)", "1D Dynamic Programming", "2D Dynamic Programming"
    );

    @Mock private HintRequestLogRepository hintRequestLogRepository;
    @Mock private PatternRepository patternRepository;
    @Mock private PatternIdentificationService patternIdentificationService;

    private HintService service;

    @BeforeEach
    void setUp() {
        service = new HintService(hintRequestLogRepository, patternRepository, patternIdentificationService);
        lenient().when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc(any(), any()))
                .thenReturn(List.of());
    }

    // ── The mandatory spec-required assertion ────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
            "Given a sorted array, find the target index.",
            "You are given the root of a binary tree with nodes.",
            "There are n cities connected by edges forming a graph.",
            "Given a string s, find the longest substring without repeating characters.",
            "Given an m x n grid matrix of integers.",
            "Given an array of integers, do something with no special structure mentioned."
    })
    void level1Hint_neverContainsCodeOrAPatternName(String problemStatement) {
        HintRequest request = HintRequest.builder()
                .problemStatement(problemStatement)
                .problemIdentifier("p1")
                .level(1)
                .build();

        HintResponse response = service.getHint("user@example.com", request);

        assertThat(response.getLevel()).isEqualTo(1);
        assertThat(response.isContainsCode()).isFalse();
        assertThat(response.getMatchedPatternSlug()).isNull();

        String hint = response.getHint();
        assertThat(hint).doesNotContain("```", "{", "}", ";");
        for (String patternName : ALL_PATTERN_NAMES) {
            assertThat(hint.toLowerCase()).doesNotContain(patternName.toLowerCase());
        }
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────

    @Test
    void rejectsSkippingAheadToAHigherLevel() {
        HintRequest request = HintRequest.builder()
                .problemStatement("Some problem")
                .problemIdentifier("p1")
                .level(3)
                .build();

        assertThatThrownBy(() -> service.getHint("user@example.com", request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("progressive");
    }

    @Test
    void allowsSequentialLevelAfterPreviousLevelGranted() {
        when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc("user@example.com", "p1"))
                .thenReturn(List.of(HintRequestLog.builder()
                        .userEmail("user@example.com").problemIdentifier("p1")
                        .level(1).requestedAt(LocalDateTime.now().minusMinutes(5))
                        .build()));
        when(patternIdentificationService.identify(any())).thenReturn(
                PatternIdentificationResponse.builder().candidates(List.of()).build());

        HintRequest request = HintRequest.builder()
                .problemStatement("Some problem")
                .problemIdentifier("p1")
                .level(2)
                .build();

        HintResponse response = service.getHint("user@example.com", request);
        assertThat(response.getLevel()).isEqualTo(2);
    }

    @Test
    void rejectsRequestsWithinTheCooldownWindow() {
        when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc("user@example.com", "p1"))
                .thenReturn(List.of(HintRequestLog.builder()
                        .userEmail("user@example.com").problemIdentifier("p1")
                        .level(1).requestedAt(LocalDateTime.now())
                        .build()));

        HintRequest request = HintRequest.builder()
                .problemStatement("Some problem")
                .problemIdentifier("p1")
                .level(1)
                .build();

        assertThatThrownBy(() -> service.getHint("user@example.com", request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Slow down");
    }

    @Test
    void level4RequiresExplicitConfirmation() {
        when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc("user@example.com", "p1"))
                .thenReturn(List.of(
                        logAt(1, 10), logAt(2, 8), logAt(3, 6)));

        HintRequest request = HintRequest.builder()
                .problemStatement("Some problem")
                .problemIdentifier("p1")
                .level(4)
                .confirmLevel4(false)
                .build();

        assertThatThrownBy(() -> service.getHint("user@example.com", request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("confirmLevel4");
    }

    @Test
    void level4WithConfirmationReturnsTheJavaTemplate() {
        when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc("user@example.com", "p1"))
                .thenReturn(List.of(logAt(1, 10), logAt(2, 8), logAt(3, 6)));
        Pattern pattern = Pattern.builder()
                .slug("two-pointer").name("Two Pointer")
                .javaTemplate("int left = 0;\nwhile (left < right) {\n    left++;\n}")
                .build();
        when(patternRepository.findBySlug("two-pointer")).thenReturn(Optional.of(pattern));

        HintRequest request = HintRequest.builder()
                .problemStatement("Some problem")
                .problemIdentifier("p1")
                .level(4)
                .patternSlug("two-pointer")
                .confirmLevel4(true)
                .build();

        HintResponse response = service.getHint("user@example.com", request);
        assertThat(response.isContainsCode()).isTrue();
        assertThat(response.getHint()).contains("left++");
        assertThat(response.getMatchedPatternSlug()).isEqualTo("two-pointer");
    }

    // ── Level 3 pseudocode de-Java-ification ─────────────────────────────────

    @Test
    void level3StripsJavaSyntaxFromTheTemplate() {
        when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc("user@example.com", "p1"))
                .thenReturn(List.of(logAt(1, 10), logAt(2, 8)));
        Pattern pattern = Pattern.builder()
                .slug("two-pointer").name("Two Pointer")
                .javaTemplate("int left = 0, right = arr.length - 1;\nwhile (left < right) {\n    left++;\n}")
                .build();
        when(patternRepository.findBySlug("two-pointer")).thenReturn(Optional.of(pattern));

        HintRequest request = HintRequest.builder()
                .problemStatement("Some problem")
                .problemIdentifier("p1")
                .level(3)
                .patternSlug("two-pointer")
                .build();

        HintResponse response = service.getHint("user@example.com", request);
        assertThat(response.getHint()).doesNotContain("int ", ";", "{", "}");
        assertThat(response.getHint()).contains("left = 0, right = arr.length - 1");
    }

    // ── Pattern auto-resolution via keyword identification ───────────────────

    @Test
    void level2WithoutExplicitSlug_resolvesViaPatternIdentificationService() {
        when(hintRequestLogRepository.findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc("user@example.com", "p1"))
                .thenReturn(List.of(logAt(1, 10)));
        when(patternIdentificationService.identify(any())).thenReturn(
                PatternIdentificationResponse.builder()
                        .candidates(List.of(PatternCandidateDTO.builder().patternSlug("monotonic-stack").confidence(0.8).build()))
                        .build());
        Pattern pattern = Pattern.builder()
                .slug("monotonic-stack").name("Monotonic Stack")
                .intuition("Keep a stack that's always increasing or decreasing.")
                .build();
        when(patternRepository.findBySlug("monotonic-stack")).thenReturn(Optional.of(pattern));

        HintRequest request = HintRequest.builder()
                .problemStatement("Find the next greater element")
                .problemIdentifier("p1")
                .level(2)
                .build();

        HintResponse response = service.getHint("user@example.com", request);
        assertThat(response.getHint()).contains("Monotonic Stack");
        assertThat(response.getMatchedPatternSlug()).isEqualTo("monotonic-stack");
    }

    private HintRequestLog logAt(int level, int minutesAgo) {
        return HintRequestLog.builder()
                .userEmail("user@example.com").problemIdentifier("p1")
                .level(level).requestedAt(LocalDateTime.now().minusMinutes(minutesAgo))
                .build();
    }
}
