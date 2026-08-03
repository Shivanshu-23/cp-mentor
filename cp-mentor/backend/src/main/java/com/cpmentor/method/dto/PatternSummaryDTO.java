package com.cpmentor.method.dto;

import com.cpmentor.method.entity.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Lighter-weight shape for the pattern grid — still carries recognitionTriggers so the
 * frontend can filter by trigger phrase without a second round trip per card.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternSummaryDTO {
    private Long id;
    private String slug;
    private String name;
    private Pattern.Category category;
    private String intuition;
    private List<String> recognitionTriggers;
    private int difficultyToLearn;
    private int frequencyScore;
}
