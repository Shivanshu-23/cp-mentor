package com.cpmentor.ai.controller;

import com.cpmentor.ai.dto.AIAnalysisDTO;
import com.cpmentor.ai.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Analysis", description = "AI-powered problem analysis — works with mock or real OpenAI/Claude/Gemini")
public class AIController {

    private final AIService aiService;

    @GetMapping("/analyze/{problemId}")
    @Operation(summary = "Analyze a problem with AI (returns mock if no API key is set)")
    public ResponseEntity<AIAnalysisDTO> analyze(@PathVariable Long problemId) {
        return ResponseEntity.ok(aiService.analyze(problemId));
    }
}
