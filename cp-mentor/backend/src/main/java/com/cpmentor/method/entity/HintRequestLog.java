package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * One row per hint request, used purely for rate limiting: enforcing sequential
 * level access (can't skip to level 4) and a cooldown between requests per user
 * per problem. Not exposed via any API — internal bookkeeping only.
 */
@Entity
@Table(name = "hint_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "problem_identifier", nullable = false)
    private String problemIdentifier;

    @Column(nullable = false)
    private int level;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;
}
