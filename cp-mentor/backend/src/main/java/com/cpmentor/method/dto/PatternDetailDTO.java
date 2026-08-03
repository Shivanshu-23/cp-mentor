package com.cpmentor.method.dto;

import com.cpmentor.method.entity.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternDetailDTO {
    private Long id;
    private String slug;
    private String name;
    private Pattern.Category category;
    private String intuition;
    private List<String> recognitionTriggers;
    private List<String> antiTriggers;
    private String javaTemplate;
    private String timeComplexity;
    private String spaceComplexity;
    private String whyComplexityIsNotObvious;
    private List<String> commonMistakes;
    private List<String> edgeCaseChecklist;
    private String variants;
    private List<String> interviewFollowUps;
    private List<String> relatedPatterns;
    private int difficultyToLearn;
    private int frequencyScore;
}
