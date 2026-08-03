package com.cpmentor.method.controller;

import com.cpmentor.method.dto.ConstraintAnalysisRequest;
import com.cpmentor.method.dto.ConstraintAnalysisResponse;
import com.cpmentor.method.dto.EdgeCaseRequest;
import com.cpmentor.method.dto.EdgeCaseResponse;
import com.cpmentor.method.dto.HintRequest;
import com.cpmentor.method.dto.HintResponse;
import com.cpmentor.method.dto.PatternDetailDTO;
import com.cpmentor.method.dto.PatternIdentificationRequest;
import com.cpmentor.method.dto.PatternIdentificationResponse;
import com.cpmentor.method.dto.PatternProblemDTO;
import com.cpmentor.method.dto.PatternSummaryDTO;
import com.cpmentor.method.dto.ResourceDTO;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.service.ConstraintAnalyzerService;
import com.cpmentor.method.service.EdgeCaseGeneratorService;
import com.cpmentor.method.service.HintService;
import com.cpmentor.method.service.PatternIdentificationService;
import com.cpmentor.method.service.PatternService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/method")
@RequiredArgsConstructor
@Tag(name = "Pattern Library", description = "Practice Method reference data — DSA patterns, learning-order problems, and external resources")
public class PatternController {

    private final PatternService patternService;
    private final ConstraintAnalyzerService constraintAnalyzerService;
    private final EdgeCaseGeneratorService edgeCaseGeneratorService;
    private final PatternIdentificationService patternIdentificationService;
    private final HintService hintService;

    @GetMapping("/patterns")
    @Operation(summary = "List patterns (paginated, optionally filtered by category)")
    public ResponseEntity<Page<PatternSummaryDTO>> getPatterns(
            @RequestParam(required = false) Pattern.Category category,
            @PageableDefault(size = 25, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(patternService.getPatterns(category, pageable));
    }

    @GetMapping("/patterns/{slug}")
    @Operation(summary = "Get full detail for a single pattern")
    public ResponseEntity<PatternDetailDTO> getPatternDetail(@PathVariable String slug) {
        return ResponseEntity.ok(patternService.getPatternDetail(slug));
    }

    @GetMapping("/patterns/{slug}/problems")
    @Operation(summary = "Get a pattern's problems in learning order")
    public ResponseEntity<List<PatternProblemDTO>> getPatternProblems(@PathVariable String slug) {
        return ResponseEntity.ok(patternService.getPatternProblems(slug));
    }

    @GetMapping("/resources")
    @Operation(summary = "List resources — global by default, or scoped to a pattern via ?patternSlug=")
    public ResponseEntity<List<ResourceDTO>> getResources(
            @RequestParam(required = false) String patternSlug) {
        return ResponseEntity.ok(patternService.getResources(patternSlug));
    }

    @PostMapping("/analyze-constraints")
    @Operation(summary = "Map a max input size (n) + flags to a target complexity and candidate techniques")
    public ResponseEntity<ConstraintAnalysisResponse> analyzeConstraints(
            @Valid @RequestBody ConstraintAnalysisRequest request) {
        return ResponseEntity.ok(constraintAnalyzerService.analyze(request));
    }

    @PostMapping("/edge-cases")
    @Operation(summary = "Generate an edge-case checklist for an input type + flags, optionally merged with a pattern's own checklist")
    public ResponseEntity<EdgeCaseResponse> edgeCases(@Valid @RequestBody EdgeCaseRequest request) {
        return ResponseEntity.ok(edgeCaseGeneratorService.generate(request));
    }

    @PostMapping("/identify-pattern")
    @Operation(summary = "Identify candidate patterns for a problem statement via keyword matching against the pattern library (no AI, requires login)")
    public ResponseEntity<PatternIdentificationResponse> identifyPattern(
            @Valid @RequestBody PatternIdentificationRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(patternIdentificationService.identify(request));
    }

    @PostMapping("/hint")
    @Operation(summary = "Get a progressive hint (level 1-4) for a problem, built from the pattern library — never leaks a solution before level 4")
    public ResponseEntity<HintResponse> hint(
            @Valid @RequestBody HintRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(hintService.getHint(user.getUsername(), request));
    }
}
