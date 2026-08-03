package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A spaced-repetition entry: the surface feature that should have fired a pattern, logged
 * after a solve session so the user gets tested on recognizing it again later.
 *
 * `lastReviewedAt` is not in the original feature spec's field list — documented extension,
 * needed to compute the "weak patterns: any FAIL in last 14 days" stat, since `createdAt` alone
 * can't tell you when the most recent review happened.
 */
@Entity
@Table(name = "trigger_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriggerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "leetcode_id", nullable = false)
    private String leetcodeId;

    @Column(nullable = false)
    private String title;

    // Column is `trigger_text`, not `trigger` — TRIGGER is a reserved word in MySQL.
    @Column(name = "trigger_text", nullable = false, columnDefinition = "TEXT")
    private String trigger;

    @Column(name = "missed_observation", columnDefinition = "TEXT")
    private String missedObservation;

    @Column(name = "pattern_slug")
    private String patternSlug;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "trigger_entry_reuse_in", joinColumns = @JoinColumn(name = "entry_id"))
    @Column(name = "context", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> reuseIn = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "review_stage", nullable = false)
    @Builder.Default
    private int reviewStage = 0; // 0-3, 3 = retired

    @Column(name = "next_review_at", nullable = false)
    private LocalDateTime nextReviewAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "last_review_result")
    private ReviewResult lastReviewResult; // null until first review

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    public enum ReviewResult {
        PASS, FAIL, SKIPPED
    }
}
