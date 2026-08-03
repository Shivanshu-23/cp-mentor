package com.cpmentor.method.controller;

import com.cpmentor.method.dto.StatsResponse;
import com.cpmentor.method.dto.TriggerEntryCreateRequest;
import com.cpmentor.method.dto.TriggerEntryResponse;
import com.cpmentor.method.dto.TriggerReviewRequest;
import com.cpmentor.method.service.StatsService;
import com.cpmentor.method.service.TriggerEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/method")
@RequiredArgsConstructor
@Tag(name = "Trigger Log & Stats", description = "Spaced-repetition trigger log and progress dashboard — private per-user, requires login")
public class TriggerEntryController {

    private final TriggerEntryService triggerEntryService;
    private final StatsService statsService;

    @PostMapping("/triggers")
    @Operation(summary = "Log a trigger entry after a solve session")
    public ResponseEntity<TriggerEntryResponse> create(
            @Valid @RequestBody TriggerEntryCreateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(triggerEntryService.create(user.getUsername(), request));
    }

    @GetMapping("/triggers")
    @Operation(summary = "List all of the current user's trigger entries")
    public ResponseEntity<List<TriggerEntryResponse>> listAll(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(triggerEntryService.listAll(user.getUsername()));
    }

    @GetMapping("/triggers/due")
    @Operation(summary = "List trigger entries due for review today (the recall drill)")
    public ResponseEntity<List<TriggerEntryResponse>> due(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(triggerEntryService.due(user.getUsername()));
    }

    @PostMapping("/triggers/{id}/review")
    @Operation(summary = "Self-grade a reviewed trigger entry — PASS advances the stage, FAIL resets it to 0")
    public ResponseEntity<TriggerEntryResponse> review(
            @PathVariable Long id,
            @Valid @RequestBody TriggerReviewRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(triggerEntryService.review(user.getUsername(), id, request));
    }

    @GetMapping("/stats")
    @Operation(summary = "Progress dashboard metrics")
    public ResponseEntity<StatsResponse> stats(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(statsService.getStats(user.getUsername()));
    }
}
