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
public class PatternIdentificationRequest {

    @NotBlank
    private String problemStatement;

    private String constraints; // optional
}
