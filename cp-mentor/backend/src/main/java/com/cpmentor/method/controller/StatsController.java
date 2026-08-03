package com.cpmentor.method.controller;

import com.cpmentor.auth.repository.UserRepository;
import com.cpmentor.method.dto.MasteryDTOs.MasteryResponse;
import com.cpmentor.method.entity.ShareCardRequestLog;
import com.cpmentor.method.repository.ShareCardRequestLogRepository;
import com.cpmentor.method.service.MasteryService;
import com.cpmentor.method.service.ShareCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

// Phase F — retention-weighted gamification. Distinct top-level path
// (/api/v1/stats) from the existing /api/v1/method/stats (Phase 5's
// problems/streak/retention dashboard) — additive, doesn't touch that
// endpoint's shape.
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "Gamification", description = "Retention-weighted mastery stats and shareable stat card — private per-user, requires login")
public class StatsController {

    private static final int SHARE_CARD_DAILY_LIMIT = 10;

    private final MasteryService masteryService;
    private final ShareCardService shareCardService;
    private final ShareCardRequestLogRepository shareCardRequestLogRepository;
    private final UserRepository userRepository;

    @GetMapping("/mastery")
    @Operation(summary = "Recall streak, pattern mastery tiers, and submissions-per-accepted trend")
    public ResponseEntity<MasteryResponse> getMastery(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(masteryService.getMastery(user.getUsername()));
    }

    @PostMapping("/share-card")
    @Operation(summary = "Generate a shareable PNG stat card — rate-limited to 10/day")
    public ResponseEntity<byte[]> shareCard(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();

        String userEmail = user.getUsername();
        LocalDateTime since = LocalDateTime.now().minusDays(1);
        long recentCount = shareCardRequestLogRepository.countByUserEmailAndRequestedAtAfter(userEmail, since);
        if (recentCount >= SHARE_CARD_DAILY_LIMIT) {
            return ResponseEntity.status(429).build();
        }

        try {
            String displayName = userRepository.findByEmail(userEmail)
                    .map(u -> u.getDisplayUsername())
                    .orElse(userEmail);
            MasteryResponse mastery = masteryService.getMastery(userEmail);
            byte[] png = shareCardService.renderCard(displayName, mastery);

            shareCardRequestLogRepository.save(ShareCardRequestLog.builder()
                    .userEmail(userEmail).requestedAt(LocalDateTime.now()).build());

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"novacode-stats.png\"")
                    .body(png);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
