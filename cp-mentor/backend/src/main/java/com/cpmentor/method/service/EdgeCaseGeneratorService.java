package com.cpmentor.method.service;

import com.cpmentor.method.dto.EdgeCaseRequest;
import com.cpmentor.method.dto.EdgeCaseResponse;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.repository.PatternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Pure logic, no AI — universal edge cases apply to every input, type-specific ones layer
 * on top, and a known pattern's own edgeCaseChecklist is merged in last when provided.
 */
@Service
@RequiredArgsConstructor
public class EdgeCaseGeneratorService {

    private final PatternRepository patternRepository;

    private static final List<String> UNIVERSAL = List.of(
            "Minimum valid input size",
            "All elements identical",
            "Answer at the first index",
            "Answer at the last index",
            "No valid answer exists"
    );

    @Transactional(readOnly = true)
    public EdgeCaseResponse generate(EdgeCaseRequest req) {
        Set<String> checklist = new LinkedHashSet<>(UNIVERSAL);

        if (req.isDuplicatesAllowed()) {
            checklist.add("Duplicates present in the input");
        }
        if (req.isNegativesAllowed()) {
            checklist.add("Negative values mixed with positive values");
        }
        if (req.isValuesBounded()) {
            checklist.add("Values at the boundary of the allowed range");
        }

        checklist.addAll(typeSpecific(req.getInputType()));

        if (req.getPatternSlug() != null && !req.getPatternSlug().isBlank()) {
            patternRepository.findBySlug(req.getPatternSlug())
                    .map(Pattern::getEdgeCaseChecklist)
                    .ifPresent(checklist::addAll);
        }

        return EdgeCaseResponse.builder().checklist(List.copyOf(checklist)).build();
    }

    private List<String> typeSpecific(EdgeCaseRequest.InputType type) {
        return switch (type) {
            case STRING -> List.of("Empty string", "Single character string");
            case TREE -> List.of(
                    "Single node tree",
                    "Skewed tree (essentially a linked list)",
                    "All nodes have the same value");
            case GRAPH -> List.of("Disconnected components", "Self-loops", "Cycles present");
            case NUMBER -> List.of("Overflow at the boundary of the numeric type");
            case ARRAY, MATRIX -> List.of();
        };
    }
}
