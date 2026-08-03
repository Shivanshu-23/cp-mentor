package com.cpmentor.method.service;

import com.cpmentor.method.dto.EdgeCaseRequest;
import com.cpmentor.method.dto.EdgeCaseResponse;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.repository.PatternRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EdgeCaseGeneratorServiceTest {

    @Mock
    private PatternRepository patternRepository;

    private EdgeCaseGeneratorService service;

    @BeforeEach
    void setUp() {
        service = new EdgeCaseGeneratorService(patternRepository);
    }

    @Test
    void universalItemsAlwaysPresent() {
        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.ARRAY).build());

        assertThat(response.getChecklist()).contains(
                "Minimum valid input size",
                "All elements identical",
                "Answer at the first index",
                "Answer at the last index",
                "No valid answer exists");
    }

    @Test
    void duplicatesItemOnlyIncludedWhenDuplicatesAllowed() {
        EdgeCaseResponse withDuplicates = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.ARRAY).duplicatesAllowed(true).build());
        EdgeCaseResponse withoutDuplicates = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.ARRAY).duplicatesAllowed(false).build());

        assertThat(withDuplicates.getChecklist()).contains("Duplicates present in the input");
        assertThat(withoutDuplicates.getChecklist()).doesNotContain("Duplicates present in the input");
    }

    @Test
    void stringTypeAddsStringSpecificItems() {
        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.STRING).build());

        assertThat(response.getChecklist()).contains("Empty string", "Single character string");
    }

    @Test
    void treeTypeAddsTreeSpecificItems() {
        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.TREE).build());

        assertThat(response.getChecklist()).contains(
                "Single node tree",
                "Skewed tree (essentially a linked list)",
                "All nodes have the same value");
    }

    @Test
    void graphTypeAddsGraphSpecificItems() {
        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.GRAPH).build());

        assertThat(response.getChecklist()).contains("Disconnected components", "Self-loops", "Cycles present");
    }

    @Test
    void numberTypeAddsOverflowItem() {
        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.NUMBER).build());

        assertThat(response.getChecklist()).contains("Overflow at the boundary of the numeric type");
    }

    @Test
    void mergesInPatternsOwnEdgeCaseChecklistWhenSlugKnown() {
        Pattern pattern = Pattern.builder()
                .slug("monotonic-stack")
                .edgeCaseChecklist(List.of("Strictly increasing input (stack never pops)"))
                .build();
        when(patternRepository.findBySlug("monotonic-stack")).thenReturn(Optional.of(pattern));

        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder()
                        .inputType(EdgeCaseRequest.InputType.ARRAY)
                        .patternSlug("monotonic-stack")
                        .build());

        assertThat(response.getChecklist()).contains("Strictly increasing input (stack never pops)");
    }

    @Test
    void unknownPatternSlug_doesNotFailAndSkipsMerge() {
        when(patternRepository.findBySlug("unknown-slug")).thenReturn(Optional.empty());

        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder()
                        .inputType(EdgeCaseRequest.InputType.ARRAY)
                        .patternSlug("unknown-slug")
                        .build());

        assertThat(response.getChecklist()).contains("Minimum valid input size");
    }

    @Test
    void checklistHasNoDuplicateEntries() {
        EdgeCaseResponse response = service.generate(
                EdgeCaseRequest.builder().inputType(EdgeCaseRequest.InputType.STRING).build());

        assertThat(response.getChecklist()).doesNotHaveDuplicates();
    }
}
