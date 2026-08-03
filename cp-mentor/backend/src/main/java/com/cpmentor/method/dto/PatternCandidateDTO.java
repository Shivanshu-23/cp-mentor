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
public class PatternCandidateDTO {
    private String patternSlug;
    private double confidence; // 0.0-1.0
    private List<String> matchedTriggers;
    private String whyItFits;
    private String whyItMightNotFit;
}
