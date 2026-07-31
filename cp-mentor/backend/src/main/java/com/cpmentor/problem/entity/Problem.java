package com.cpmentor.problem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String leetcodeId;

    @Column(nullable = false)
    private String title;

    private String slug;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_topics", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "topic")
    @Builder.Default
    private List<String> topics = new ArrayList<>();

    private String exampleInput;
    private String exampleOutput;

    @Builder.Default
    private LocalDateTime fetchedAt = LocalDateTime.now();

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}
