package com.cpmentor.method.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolveSessionCompleteRequest {
    private Boolean solvedUnaided; // final value, optional override
    private Integer stuckRung;     // 1-6, optional final self-rating
}
