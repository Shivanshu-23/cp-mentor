package com.cpmentor.method.dto;

import com.cpmentor.method.entity.TriggerEntry;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriggerReviewRequest {
    @NotNull
    private TriggerEntry.ReviewResult result; // PASS, FAIL, or SKIPPED
}
