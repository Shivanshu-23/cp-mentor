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
public class PatternIdentificationResponse {
    private List<PatternCandidateDTO> candidates; // top 3
    private String suggestedBruteForce; // one sentence, no code
    private String bottleneckQuestion;  // one sentence
}
