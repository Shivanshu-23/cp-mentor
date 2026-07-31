package com.cpmentor.problem.controller;

import com.cpmentor.problem.dto.ProblemDTO;
import com.cpmentor.problem.service.ProblemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/problems")
@RequiredArgsConstructor
@Tag(name = "Problems", description = "Coding problems endpoints")
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping("/daily")
    @Operation(summary = "Get today's daily challenge problem")
    public ResponseEntity<ProblemDTO> getDailyProblem() {
        return ResponseEntity.ok(problemService.getDailyProblem());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a problem by ID")
    public ResponseEntity<ProblemDTO> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @GetMapping
    @Operation(summary = "List all problems (paginated)")
    public ResponseEntity<Page<ProblemDTO>> getAllProblems(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(problemService.getAllProblems(pageable));
    }
}
