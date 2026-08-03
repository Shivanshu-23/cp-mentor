package com.cpmentor.method.dto;

import com.cpmentor.method.entity.TriggerEntry;
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
public class TriggerEntryResponse {
    private Long id;
    private String leetcodeId;
    private String title;
    private String trigger;
    private String missedObservation;
    private String patternSlug;
    private List<String> reuseIn;
    private LocalDateTime createdAt;
    private int reviewStage;
    private LocalDateTime nextReviewAt;
    private TriggerEntry.ReviewResult lastReviewResult;
    private LocalDateTime lastReviewedAt;
}
