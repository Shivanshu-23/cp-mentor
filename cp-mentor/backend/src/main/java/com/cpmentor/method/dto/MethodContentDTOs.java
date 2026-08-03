package com.cpmentor.method.dto;

import java.util.List;

// All Phase E "Method content" reference DTOs in one file for brevity —
// matches the convention already established in auth/dto/AuthDTOs.java.
// Records, not Lombok classes: these are pure read-only reference-data
// shapes with no builder/mutation needs.
public class MethodContentDTOs {

    public record MethodPhaseDTO(
        int orderIndex, String name, String purpose, int timeBudgetMinutes,
        String whatToWriteDown, String failureModePrevented
    ) {}

    public record ComplexityBudgetDTO(
        int orderIndex, String maxNLabel, String targetComplexity, List<String> techniques
    ) {}

    public record OptimizationMoveDTO(
        String code, String name, String triggerQuestion, String triggerPhrase,
        List<String> techniques, List<String> exampleProblems
    ) {}

    public record StuckRungDTO(
        int rung, String name, String description, int timeBudgetMinutes, String costOfSkipping
    ) {}

    public record RecoveryStepDTO(int orderIndex, String name, String description) {}

    public record AntiTriggerDTO(String antiTriggerPhrase, String misleadsToPatternSlug) {}

    public record TriggerPhraseDTO(
        String phrase, String patternSlug, double confidence, List<AntiTriggerDTO> antiTriggers
    ) {}

    public record TopicPriorityDTO(
        int rank, String name, double estimatedHours, int interviewFrequency, List<String> prerequisiteTopics
    ) {}

    public record InterviewScriptStepDTO(int orderIndex, String name, String description) {}

    public record CompanyFrequencyDTO(String company, long count) {}
}
