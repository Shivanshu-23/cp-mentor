package com.cpmentor.ingestion.scheduler;

import com.cpmentor.ingestion.entity.DailyChallenge;
import com.cpmentor.ingestion.service.LeetCodeFetchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for fetching the LeetCode Daily Challenge.
 *
 * Runs at:
 *  1. Application startup (ApplicationReadyEvent) — so first run works immediately
 *  2. Every midnight IST (18:30 UTC = LeetCode resets at midnight UTC)
 *
 * Cron: "0 30 18 * * ?" = 18:30 UTC = 00:00 IST (UTC+5:30)
 * Change to "0 0 0 * * ?" if your server runs in UTC.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DailyChallengeScheduler {

    private final LeetCodeFetchService leetCodeFetchService;

    /**
     * Runs once when the app fully starts.
     * Fetches today's challenge if not already in DB.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void fetchOnStartup() {
        log.info("=== Application started — fetching today's LeetCode Daily Challenge ===");
        try {
            DailyChallenge challenge = leetCodeFetchService.fetchAndSaveTodaysChallenge();
            log.info("✓ Startup fetch complete: {} ({})",
                    challenge.getProblem().getTitle(),
                    challenge.getChallengeDate());
        } catch (Exception e) {
            log.error("Startup fetch failed (seeded problems are still available): {}", e.getMessage());
        }
    }

    /**
     * Runs every day at midnight IST (18:30 UTC).
     * LeetCode resets the daily challenge at midnight UTC — we fetch 30 min after.
     */
    @Scheduled(cron = "0 30 18 * * ?", zone = "UTC")
    public void fetchMidnightIST() {
        log.info("=== Midnight scheduler triggered — fetching new Daily Challenge ===");
        try {
            DailyChallenge challenge = leetCodeFetchService.fetchAndSaveTodaysChallenge();
            log.info("✓ Midnight fetch: {} ({})",
                    challenge.getProblem().getTitle(),
                    challenge.getChallengeDate());
        } catch (Exception e) {
            log.error("Midnight fetch failed: {}", e.getMessage());
        }
    }

    /**
     * Also runs at 01:00 IST (19:30 UTC) as a safety retry
     * in case the 00:30 run failed.
     */
    @Scheduled(cron = "0 30 19 * * ?", zone = "UTC")
    public void fetchRetry() {
        log.debug("Safety retry scheduled fetch...");
        try {
            leetCodeFetchService.fetchAndSaveTodaysChallenge();
        } catch (Exception e) {
            log.warn("Retry fetch failed: {}", e.getMessage());
        }
    }
}
