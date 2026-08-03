package com.cpmentor.method.controller;

import com.cpmentor.method.dto.SolveSessionCompleteRequest;
import com.cpmentor.method.dto.SolveSessionCreateRequest;
import com.cpmentor.method.dto.SolveSessionResponse;
import com.cpmentor.method.dto.SolveSessionUpdateRequest;
import com.cpmentor.method.service.SolveSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/method/sessions")
@RequiredArgsConstructor
@Tag(name = "Solve Sessions", description = "Practice Method solve worksheet — private per-user, requires login")
public class SolveSessionController {

    private final SolveSessionService solveSessionService;

    @PostMapping
    @Operation(summary = "Start a new solve session")
    public ResponseEntity<SolveSessionResponse> create(
            @Valid @RequestBody SolveSessionCreateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(solveSessionService.create(user.getUsername(), request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Autosave a partial update to a solve session's current phase")
    public ResponseEntity<SolveSessionResponse> update(
            @PathVariable Long id,
            @RequestBody SolveSessionUpdateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(solveSessionService.update(user.getUsername(), id, request));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark a solve session complete — sets endedAt and computes durationSeconds")
    public ResponseEntity<SolveSessionResponse> complete(
            @PathVariable Long id,
            @RequestBody(required = false) SolveSessionCompleteRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(solveSessionService.complete(user.getUsername(), id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single solve session")
    public ResponseEntity<SolveSessionResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(solveSessionService.getById(user.getUsername(), id));
    }

    @GetMapping
    @Operation(summary = "List the current user's solve sessions (paginated, filterable by difficulty or solvedUnaided)")
    public ResponseEntity<Page<SolveSessionResponse>> list(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Boolean solvedUnaided,
            @PageableDefault(size = 20, sort = "startedAt") Pageable pageable,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(solveSessionService.list(user.getUsername(), difficulty, solvedUnaided, pageable));
    }
}
