package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Rate-limit bookkeeping for POST /api/v1/stats/share-card (10/day per
// user). Same shape and purpose as HintRequestLog — internal only, not
// exposed via any API.
@Entity
@Table(name = "share_card_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareCardRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;
}
