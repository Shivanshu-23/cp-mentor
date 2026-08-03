package com.cpmentor.method.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EdgeCaseRequest {

    @NotNull
    private InputType inputType;

    private boolean sorted;
    private boolean negativesAllowed;
    private boolean duplicatesAllowed;
    private boolean valuesBounded;

    /**
     * Optional — when a pattern has already been identified, its own edgeCaseChecklist
     * is merged into the generated list.
     */
    private String patternSlug;

    public enum InputType {
        ARRAY, STRING, TREE, GRAPH, MATRIX, NUMBER
    }
}
