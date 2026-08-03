package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "optimization_moves")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationMove {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // STORE_INSTEAD_OF_RECOMPUTE, MONOTONIC_POINTER, SORT_FIRST, ONLY_EXTREME_MATTERS, BINARY_SEARCH_ANSWER

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String triggerQuestion;

    @Column(nullable = false)
    private String triggerPhrase;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "optimization_move_techniques", joinColumns = @JoinColumn(name = "optimization_move_id"))
    @Column(name = "technique")
    @Builder.Default
    private List<String> techniques = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "optimization_move_examples", joinColumns = @JoinColumn(name = "optimization_move_id"))
    @Column(name = "example_problem")
    @Builder.Default
    private List<String> exampleProblems = new ArrayList<>();
}
