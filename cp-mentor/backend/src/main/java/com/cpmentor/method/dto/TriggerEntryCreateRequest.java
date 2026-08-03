package com.cpmentor.method.dto;

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
public class TriggerEntryCreateRequest {

    @NotBlank
    private String leetcodeId;

    @NotBlank
    private String title;

    @NotBlank
    private String trigger;

    private String missedObservation;
    private String patternSlug;

    @Builder.Default
    private List<String> reuseIn = List.of();
}
