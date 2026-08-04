package com.cpmentor.mockinterview.controller;

import com.cpmentor.mockinterview.dto.RandomProblemResponse;
import com.cpmentor.mockinterview.service.MockInterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

// Not in any permitAll list — falls through to the default
// .anyRequest().authenticated() rule, same reasoning as the practice queue:
// excluding already-completed problems needs to know who's asking.
@RestController
@RequestMapping("/api/v1/mock-interview")
@RequiredArgsConstructor
@Tag(name = "Mock Interview", description = "Random problem picker for timed mock-interview practice — requires login")
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;

    @GetMapping("/random-problem")
    @Operation(summary = "Pick a random problem, optionally at a given difficulty, preferring ones not already completed")
    public ResponseEntity<RandomProblemResponse> randomProblem(
            @RequestParam(required = false) String difficulty,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mockInterviewService.randomProblem(user.getUsername(), difficulty));
    }
}
