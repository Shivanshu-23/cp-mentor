package com.cpmentor.method.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConstraintAnalysisRequest {

    @NotNull
    @Min(1)
    private Long n; // max input size, e.g. array length or number of elements

    private boolean sorted;
    private boolean negativesAllowed;
    private boolean duplicatesAllowed;
    private boolean valuesBounded;

    /**
     * Optional — largest magnitude a single value can take. When set, the response
     * warns if n * maxValue overflows a 32-bit accumulator.
     */
    private Long maxValue;
}
