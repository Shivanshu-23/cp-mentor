package com.cpmentor.method.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConstraintAnalysisResponse {
    private String targetComplexity;
    private List<String> candidateTechniques; // ordered — flags promote/demote entries
    private String overflowWarning; // null when no overflow risk detected
}
