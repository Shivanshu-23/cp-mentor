package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

// Static phrase -> pattern dictionary (reference data). Distinct from
// com.cpmentor.method.entity.TriggerEntry, which is the user's personal
// spaced-repetition log (user-generated data) — same domain word, different
// concept. Do not merge them.
@Entity
@Table(name = "trigger_phrases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriggerPhrase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String phrase;

    @Column(nullable = false)
    private String patternSlug;

    @Column(nullable = false)
    private double confidence; // 0.0 - 1.0

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "trigger_phrase_anti_triggers", joinColumns = @JoinColumn(name = "trigger_phrase_id"))
    @Builder.Default
    private List<AntiTrigger> antiTriggers = new ArrayList<>();

    @Embeddable
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AntiTrigger {
        @Column(name = "anti_trigger_phrase", nullable = false)
        private String antiTriggerPhrase;

        @Column(name = "misleads_to_pattern_slug", nullable = false)
        private String misleadsToPatternSlug;
    }
}
