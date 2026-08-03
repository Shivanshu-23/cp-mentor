package com.cpmentor.method.controller;

import com.cpmentor.method.dto.PatternDetailDTO;
import com.cpmentor.method.dto.PatternProblemDTO;
import com.cpmentor.method.dto.PatternSummaryDTO;
import com.cpmentor.method.dto.ResourceDTO;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.service.PatternService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/method")
@RequiredArgsConstructor
@Tag(name = "Pattern Library", description = "Practice Method reference data — DSA patterns, learning-order problems, and external resources")
public class PatternController {

    private final PatternService patternService;

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
}
