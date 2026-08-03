package com.cpmentor.method.dto;

import com.cpmentor.method.entity.SolveSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolveSessionResponse {
    private Long id;
    private String leetcodeId;
    private String title;
    private String difficulty;
    private String patternSlug;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;

    private int submissionCount;
    private boolean solvedUnaided;
    private int highestHintLevel;
    private Integer stuckRung;

    private String constraintNotes;
    private String targetComplexity;

    private String restatement;
    private String bruteForceIdea;
    private String bruteForceComplexity;

    private String handSolveNotes;
    private String bottleneckStatement;

    private List<SolveSession.Move> movesFired;
    private String finalApproach;
    private String finalComplexity;

    private List<String> edgeCasesChecked;
    private String codeSnapshot;
}
