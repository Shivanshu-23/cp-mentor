package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complexity_budgets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplexityBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int orderIndex;

    // Explicit column name — Hibernate's default naming strategy mangles the
    // adjacent-capitals "maxNLabel" to "maxnlabel" instead of "max_n_label".
    @Column(name = "max_n_label", nullable = false)
    private String maxNLabel; // e.g. "n <= 12"

    @Column(nullable = false)
    private String targetComplexity; // e.g. "O(n!)"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complexity_budget_techniques", joinColumns = @JoinColumn(name = "complexity_budget_id"))
    @Column(name = "technique")
    @Builder.Default
    private List<String> techniques = new ArrayList<>();
}
