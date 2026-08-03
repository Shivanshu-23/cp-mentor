package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * The solve worksheet — walks a user through five phases in order (see HintService-style
 * "one non-negotiable rule": the problem statement itself is revealed by the frontend only
 * after phase 0 / constraintNotes is filled in, enforced client-side since this entity just
 * stores whatever the client sends).
 *
 * `patternSlug` is not in the original feature spec's field list for this entity, but Phase 6
 * (surfacing a pattern's interviewFollowUps on the completion screen) needs to know which
 * pattern the session resolved to — documented extension, see CLAUDE.md gotchas.
 */
@Entity
@Table(name = "solve_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "leetcode_id", nullable = false)
    private String leetcodeId;

    @Column(nullable = false)
    private String title;

    private String difficulty; // Easy / Medium / Hard — free string, matches CompanyProblem's convention

    @Column(name = "pattern_slug")
    private String patternSlug;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt; // null until /complete is called

    @Column(name = "duration_seconds")
    private Integer durationSeconds; // computed server-side on complete, from startedAt/endedAt

    @Column(name = "submission_count")
    @Builder.Default
    private int submissionCount = 0;

    @Column(name = "solved_unaided")
    private boolean solvedUnaided;

    @Column(name = "highest_hint_level")
    @Builder.Default
    private int highestHintLevel = 0; // 0-4

    @Column(name = "stuck_rung")
    private Integer stuckRung; // 1-6, self-reported "how stuck did you get", nullable until set

    @Column(name = "constraint_notes", columnDefinition = "TEXT")
    private String constraintNotes; // Phase 0

    @Column(name = "target_complexity")
    private String targetComplexity; // Phase 0

    @Column(columnDefinition = "TEXT")
    private String restatement; // Phase 1

    @Column(name = "brute_force_idea", columnDefinition = "TEXT")
    private String bruteForceIdea; // Phase 1

    @Column(name = "brute_force_complexity")
    private String bruteForceComplexity; // Phase 1

    @Column(name = "hand_solve_notes", columnDefinition = "TEXT")
    private String handSolveNotes; // Phase 2

    @Column(name = "bottleneck_statement", columnDefinition = "TEXT")
    private String bottleneckStatement; // Phase 2

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "solve_session_moves_fired", joinColumns = @JoinColumn(name = "session_id"))
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "move", nullable = false)
    @Builder.Default
    private List<Move> movesFired = new ArrayList<>(); // Phase 3

    @Column(name = "final_approach", columnDefinition = "TEXT")
    private String finalApproach; // Phase 3

    @Column(name = "final_complexity")
    private String finalComplexity; // Phase 3

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "solve_session_edge_cases_checked", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "edge_case", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> edgeCasesChecked = new ArrayList<>(); // Phase 4

    @Column(name = "code_snapshot", columnDefinition = "TEXT")
    private String codeSnapshot; // Phase 4

    public enum Move {
        STORE_INSTEAD_OF_RECOMPUTE, MONOTONIC_POINTER, SORT_FIRST, ONLY_EXTREME_MATTERS,
        BINARY_SEARCH_ANSWER, NONE_FIRED
    }
}
