package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stuck_rungs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StuckRung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private int rung; // 1-6

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int timeBudgetMinutes;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String costOfSkipping;
}
