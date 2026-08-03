package com.cpmentor.method.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolveSessionCreateRequest {

    @NotBlank
    private String leetcodeId;

    @NotBlank
    private String title;

    private String difficulty; // Easy / Medium / Hard
}
