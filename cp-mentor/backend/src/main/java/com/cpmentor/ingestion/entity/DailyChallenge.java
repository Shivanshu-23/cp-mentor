package com.cpmentor.ingestion.entity;

import com.cpmentor.problem.entity.Problem;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_challenges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(unique = true, nullable = false)
    private LocalDate challengeDate;

    private String leetcodeLink; // e.g. /problems/two-sum/

    @Builder.Default
    private LocalDateTime fetchedAt = LocalDateTime.now();
}
