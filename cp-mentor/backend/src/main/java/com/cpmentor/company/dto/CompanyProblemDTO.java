package com.cpmentor.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProblemDTO {
    private Long id;
    private String leetcodeId;
    private String url;
    private String title;
    private String difficulty;
    private String company;
    private String timeframe;
    private String acceptanceRate;
    private String frequency;
    private int tickCount;  // 0-3 — user's progress on this problem
}
