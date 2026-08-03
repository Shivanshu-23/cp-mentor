package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recovery_steps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
}
