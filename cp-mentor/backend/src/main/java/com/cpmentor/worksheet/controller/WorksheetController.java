package com.cpmentor.worksheet.controller;

import com.cpmentor.worksheet.dto.WorksheetResponse;
import com.cpmentor.worksheet.dto.WorksheetSaveRequest;
import com.cpmentor.worksheet.dto.WorksheetSaveResponse;
import com.cpmentor.worksheet.service.WorksheetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Not in any permitAll list — falls through to the default
// .anyRequest().authenticated() rule in SecurityConfig, same as Phase 3's
// identify-pattern/hint. Worksheets are per-user data, same reasoning as
// Solve Sessions.
@RestController
@RequestMapping("/api/v1/worksheet")
@RequiredArgsConstructor
@Tag(name = "Worksheet", description = "Renders, commits to GitHub, and persists the Yodh per-problem worksheet — requires login")
public class WorksheetController {

    private final WorksheetService worksheetService;

    @PostMapping("/save")
    @Operation(summary = "Commit a rendered worksheet to GitHub and persist it — the SQL row is written even if the GitHub commit fails")
    public ResponseEntity<WorksheetSaveResponse> save(
            @Valid @RequestBody WorksheetSaveRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(worksheetService.save(user.getUsername(), request));
    }

    @GetMapping
    @Operation(summary = "List the current user's saved worksheets, newest first")
    public ResponseEntity<List<WorksheetResponse>> listMine(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(worksheetService.listMine(user.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch one worksheet by id — owner-only")
    public ResponseEntity<WorksheetResponse> getOne(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(worksheetService.getOne(user.getUsername(), id));
    }
}
