package com.cpmentor.method.dto;

import com.cpmentor.method.entity.SolveSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Partial update — every field is optional (autosave sends only what changed on the
 * current stepper phase). Null means "leave unchanged", never "clear this field".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolveSessionUpdateRequest {

    private String patternSlug;

    private Integer submissionCount;
    private Boolean solvedUnaided;
    private Integer highestHintLevel;
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
