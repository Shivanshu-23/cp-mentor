package com.cpmentor.method.dto;

import java.util.List;

// Phase F retention-weighted gamification response shapes.
public class MasteryDTOs {

    public enum MasteryTier { LEARNING, FAMILIAR, SOLID, MASTERED }

    public record PatternMasteryDTO(String patternSlug, MasteryTier tier, int passCount, boolean anyRetired) {}

    public record SubmissionsTrendPointDTO(String weekLabel, double avgSubmissions) {}

    public record SubmissionsPerAcceptedDTO(double current, double target, List<SubmissionsTrendPointDTO> trend) {}

    public record MasteryResponse(
        int recallStreak,
        List<PatternMasteryDTO> patternMastery,
        SubmissionsPerAcceptedDTO submissionsPerAccepted
    ) {}
}
