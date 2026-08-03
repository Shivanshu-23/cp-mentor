package com.cpmentor.method.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintResponse {
    private int level;
    private String hint;
    private boolean containsCode; // true only ever for level 4
    private String matchedPatternSlug; // null until a pattern has been resolved (level >= 2)
}
