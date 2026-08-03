package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "method_phases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MethodPhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Column(nullable = false)
    private int timeBudgetMinutes;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String whatToWriteDown;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String failureModePrevented;
}
