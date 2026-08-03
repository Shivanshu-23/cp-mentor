package com.cpmentor.method.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EdgeCaseResponse {
    private List<String> checklist; // deduplicated, ordered: universal, then type-specific, then pattern-specific
}
