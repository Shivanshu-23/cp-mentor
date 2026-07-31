package com.cpmentor.company.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_problem_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_email", "leetcode_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProblemProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "leetcode_id", nullable = false)
    private String leetcodeId;

    /**
     * Tick count: 0 = not started, 1 = seen, 2 = attempted, 3 = solved
     * User clicks the tick icon to cycle: 0 → 1 → 2 → 3 → 0
     */
    @Builder.Default
    private int tickCount = 0;

    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
