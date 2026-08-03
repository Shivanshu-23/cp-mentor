package com.cpmentor.method.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HintRequest {

    @NotBlank
    private String problemStatement;

    /**
     * Caller-supplied stable identifier for this problem (e.g. a leetcodeId, or any
     * client-generated key) — used to track per-user, per-problem hint progression
     * for rate limiting. Falls back to a hash of problemStatement if not provided.
     */
    private String problemIdentifier;

    @Min(1)
    @Max(4)
    private int level;

    @Builder.Default
    private List<String> previousHints = List.of();

    /** Optional — if already known, used to generate a more specific hint. */
    private String patternSlug;

    /** Required true when level == 4 — the explicit "second confirmation click". */
    private boolean confirmLevel4;
}
