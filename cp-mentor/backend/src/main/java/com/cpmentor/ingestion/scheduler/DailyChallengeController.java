package com.cpmentor.ingestion.scheduler;

import com.cpmentor.ingestion.entity.DailyChallenge;
import com.cpmentor.ingestion.repository.DailyChallengeRepository;
import com.cpmentor.ingestion.service.LeetCodeFetchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/daily-challenge")
@RequiredArgsConstructor
@Tag(name = "Daily Challenge", description = "LeetCode daily challenge management")
public class DailyChallengeController {

    private final LeetCodeFetchService fetchService;
    private final DailyChallengeRepository repository;

    @GetMapping("/status")
    @Operation(summary = "Check today's daily challenge fetch status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        var todayOpt = repository.findByChallengeDate(LocalDate.now());
        if (todayOpt.isPresent()) {
            DailyChallenge dc = todayOpt.get();
            return ResponseEntity.ok(Map.of(
                "fetched", true,
                "date", dc.getChallengeDate().toString(),
                "problem", dc.getProblem().getTitle(),
                "difficulty", dc.getProblem().getDifficulty(),
                "leetcodeLink", dc.getLeetcodeLink() != null ? dc.getLeetcodeLink() : "",
                "fetchedAt", dc.getFetchedAt().toString()
            ));
        }
        return ResponseEntity.ok(Map.of(
            "fetched", false,
            "date", LocalDate.now().toString(),
            "message", "Not fetched yet. POST /api/v1/daily-challenge/fetch to trigger manually."
        ));
    }

    @PostMapping("/fetch")
    @Operation(summary = "Manually trigger a fresh LeetCode daily challenge fetch")
    public ResponseEntity<Map<String, Object>> triggerFetch() {
        try {
            DailyChallenge dc = fetchService.fetchAndSaveTodaysChallenge();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "problem", dc.getProblem().getTitle(),
                "difficulty", dc.getProblem().getDifficulty().toString(),
                "topics", dc.getProblem().getTopics(),
                "date", dc.getChallengeDate().toString(),
                "source", dc.getLeetcodeLink() != null ? dc.getLeetcodeLink() : "seeded"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "hint", "LeetCode API may be rate-limiting. Seeded problems are still available via GET /api/v1/problems/daily"
            ));
        }
    }
}
