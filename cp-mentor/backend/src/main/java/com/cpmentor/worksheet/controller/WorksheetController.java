package com.cpmentor.worksheet.controller;

import com.cpmentor.worksheet.dto.WorksheetSaveRequest;
import com.cpmentor.worksheet.dto.WorksheetSaveResponse;
import com.cpmentor.worksheet.service.GitHubWorksheetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

// Not in any permitAll list — falls through to the default
// .anyRequest().authenticated() rule in SecurityConfig, same as Phase 3's
// identify-pattern/hint. Committing to GitHub on someone's behalf shouldn't
// be reachable by an anonymous caller.
@RestController
@RequestMapping("/api/v1/worksheet")
@RequiredArgsConstructor
@Tag(name = "Worksheet", description = "Renders and commits the Yodh per-problem worksheet to GitHub — requires login")
public class WorksheetController {

    private final GitHubWorksheetService gitHubWorksheetService;

    @PostMapping("/save")
    @Operation(summary = "Commit a rendered worksheet markdown file to the configured GitHub repo")
    public ResponseEntity<WorksheetSaveResponse> save(
            @Valid @RequestBody WorksheetSaveRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(gitHubWorksheetService.save(request.getFileName(), request.getMarkdown()));
    }
}
