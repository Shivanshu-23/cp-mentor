package com.cpmentor.company.controller;

import com.cpmentor.company.dto.CompanyProblemDTO;
import com.cpmentor.company.service.CompanyDataLoaderService;
import com.cpmentor.company.service.CompanyProblemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/company-problems")
@RequiredArgsConstructor
@Tag(name = "Company Problems", description = "Company-wise LeetCode problems with progress tracking")
public class CompanyProblemController {

    private final CompanyProblemService service;
    private final CompanyDataLoaderService loaderService;

    @GetMapping
    @Operation(summary = "Get company-wise problems with user progress (tick marks)")
    public ResponseEntity<Page<CompanyProblemDTO>> getProblems(
            @RequestParam(defaultValue = "amazon")  String company,
            @RequestParam(defaultValue = "all")     String timeframe,
            @RequestParam(required = false)         String difficulty,
            @RequestParam(defaultValue = "0")       int page,
            @RequestParam(defaultValue = "50")      int size,
            @AuthenticationPrincipal UserDetails user) {

        String email = user != null ? user.getUsername() : null;
        PageRequest pageable = PageRequest.of(page, size, Sort.by("leetcodeId").ascending());
        return ResponseEntity.ok(service.getProblems(company, timeframe, difficulty, email, pageable));
    }

    @PostMapping("/{leetcodeId}/tick")
    @Operation(summary = "Cycle tick mark for a problem: 0→1→2→3→0")
    public ResponseEntity<Map<String, Object>> tick(
            @PathVariable String leetcodeId,
            @AuthenticationPrincipal UserDetails user) {

        if (user == null) return ResponseEntity.status(401).build();
        int newTick = service.tick(leetcodeId, user.getUsername());
        return ResponseEntity.ok(Map.of(
            "leetcodeId", leetcodeId,
            "tickCount", newTick,
            "status", tickLabel(newTick)
        ));
    }

    @GetMapping("/companies")
    @Operation(summary = "List all available companies")
    public ResponseEntity<List<String>> getCompanies() {
        return ResponseEntity.ok(service.getAvailableCompanies());
    }

    @GetMapping("/stats")
    @Operation(summary = "Get user's overall progress stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getUserStats(user.getUsername()));
    }

    @PostMapping("/reload/{company}")
    @Operation(summary = "Reload problems for a specific company from GitHub")
    public ResponseEntity<Map<String, Object>> reload(@PathVariable String company) {
        int loaded = loaderService.reloadCompany(company);
        return ResponseEntity.ok(Map.of("company", company, "loaded", loaded));
    }

    private String tickLabel(int tick) {
        return switch (tick) {
            case 0 -> "not_started";
            case 1 -> "seen";
            case 2 -> "attempted";
            case 3 -> "solved";
            default -> "unknown";
        };
    }
}
