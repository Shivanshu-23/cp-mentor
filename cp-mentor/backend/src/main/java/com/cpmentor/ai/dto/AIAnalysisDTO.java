package com.cpmentor.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysisDTO {

    private Long problemId;
    private String problemTitle;
    private String problemSummary;
    private String recognizedPattern;
    private List<String> requiredDataStructures;
    private List<String> requiredAlgorithms;

    // Tiered explanations
    private String easyExplanation;
    private String mediumExplanation;
    private String advancedExplanation;

    // Three solution levels
    private SolutionApproach bruteForce;
    private SolutionApproach betterApproach;
    private SolutionApproach optimalApproach;

    // Learning aids
    private List<String> commonMistakes;
    private String interviewTips;
    private List<String> edgeCases;
    private String dryRun;
    private String visualization;

    // Career / broader context
    private List<String> realWorldApplications;
    private List<String> companiesAsking;
    private String whenToUseThisAlgorithm;
    private String whenNotToUseThisAlgorithm;

    // Study plan
    private String revisionNotes;
    private List<String> relatedProblems;
    private List<String> practiceOrder;
    private List<String> flashCards;

    // Meta
    private String modelUsed;
    private boolean fromCache;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolutionApproach {
        private String name;
        private String idea;
        private String timeComplexity;
        private String spaceComplexity;
        private String pseudoCode;
        private String javaCode;
    }
}
