package com.cpmentor.method.dto;

import com.cpmentor.method.entity.PatternProblem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternProblemDTO {
    private Long id;
    private String patternSlug;
    private String leetcodeId;
    private String title;
    private String url;
    private String difficulty;
    private String striverStep;
    private PatternProblem.Role role;
    private int orderIndex;
}
