package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patterns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Category category;

    @Column(columnDefinition = "TEXT")
    private String intuition;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pattern_recognition_triggers", joinColumns = @JoinColumn(name = "pattern_id"))
    @Column(name = "trigger_phrase", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> recognitionTriggers = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pattern_anti_triggers", joinColumns = @JoinColumn(name = "pattern_id"))
    @Column(name = "trigger_phrase", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> antiTriggers = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String javaTemplate;

    private String timeComplexity;

    private String spaceComplexity;

    @Column(columnDefinition = "TEXT")
    private String whyComplexityIsNotObvious;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pattern_common_mistakes", joinColumns = @JoinColumn(name = "pattern_id"))
    @Column(name = "mistake", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> commonMistakes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pattern_edge_case_checklist", joinColumns = @JoinColumn(name = "pattern_id"))
    @Column(name = "edge_case", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> edgeCaseChecklist = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String variants;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pattern_interview_follow_ups", joinColumns = @JoinColumn(name = "pattern_id"))
    @Column(name = "question", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> interviewFollowUps = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pattern_related_patterns", joinColumns = @JoinColumn(name = "pattern_id"))
    @Column(name = "related_slug")
    @Builder.Default
    private List<String> relatedPatterns = new ArrayList<>();

    private int difficultyToLearn; // 1-5

    private int frequencyScore; // 1-5

    public enum Category {
        ARRAY, STRING, LINKED_LIST, TREE, GRAPH, DP, GREEDY, MATH, DESIGN
    }
}
