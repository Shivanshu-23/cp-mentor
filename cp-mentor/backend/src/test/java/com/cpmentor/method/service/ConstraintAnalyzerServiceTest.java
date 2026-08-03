package com.cpmentor.method.service;

import com.cpmentor.method.dto.ConstraintAnalysisRequest;
import com.cpmentor.method.dto.ConstraintAnalysisResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class ConstraintAnalyzerServiceTest {

    private final ConstraintAnalyzerService service = new ConstraintAnalyzerService();

    @ParameterizedTest(name = "n={0} -> {1}")
    @CsvSource({
            "1,                          O(n!)",
            "12,                         O(n!)",
            "13,                         O(2^n)",
            "25,                         O(2^n)",
            "26,                         O(n^3)",
            "500,                        O(n^3)",
            "501,                        O(n^2)",
            "5000,                       O(n^2)",
            "5001,                       'O(n log n) / O(n)'",
            "1000000,                    'O(n log n) / O(n)'",
            "1000001,                    'O(log n) / O(1)'",
            "1000000000,                 'O(log n) / O(1)'",
            "1000000001,                 O(log n)",
            "1000000000000000000,        O(log n)"
    })
    void mapsInputSizeToTargetComplexity(long n, String expectedComplexity) {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(n).build());

        assertThat(response.getTargetComplexity()).isEqualTo(expectedComplexity);
    }

    @Test
    void nLargerThanEveryBracket_stillFallsToTheLastBracket() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(Long.MAX_VALUE).build());

        assertThat(response.getTargetComplexity()).isEqualTo("O(log n)");
    }

    @Test
    void acceptance_sortedLargeInput_promotesTwoPointerAndBinarySearchAheadOfHashing() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(100_000L).sorted(true).build());

        assertThat(response.getTargetComplexity()).isEqualTo("O(n log n) / O(n)");
        var techniques = response.getCandidateTechniques();
        assertThat(techniques).contains("Two pointer", "Binary search", "Hashing");
        assertThat(techniques.indexOf("Two pointer")).isLessThan(techniques.indexOf("Hashing"));
        assertThat(techniques.indexOf("Binary search")).isLessThan(techniques.indexOf("Hashing"));
    }

    @Test
    void valuesBounded_promotesCountingSortAndFrequencyArrayToTheFront() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(100_000L).valuesBounded(true).build());

        var techniques = response.getCandidateTechniques();
        assertThat(techniques.get(0)).isEqualTo("Counting sort");
        assertThat(techniques.get(1)).isEqualTo("Frequency array");
    }

    @Test
    void negativesAllowed_demotesSlidingWindowBelowOtherBaseTechniques() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(100_000L).negativesAllowed(true).build());

        var techniques = response.getCandidateTechniques();
        assertThat(techniques).contains("Sliding window", "Hashing");
        assertThat(techniques.indexOf("Sliding window")).isGreaterThan(techniques.indexOf("Hashing"));
    }

    @Test
    void negativesAllowed_withNoGreedyCandidateInBracket_doesNotInsertGreedy() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(100_000L).negativesAllowed(true).build());

        assertThat(response.getCandidateTechniques()).doesNotContain("Greedy");
    }

    @Test
    void overflowWarning_presentWhenProductExceedsIntMax() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(1000L).maxValue(3_000_000L).build());

        assertThat(response.getOverflowWarning()).isNotNull().contains("long");
    }

    @Test
    void overflowWarning_absentWhenProductFitsInInt() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(10L).maxValue(100L).build());

        assertThat(response.getOverflowWarning()).isNull();
    }

    @Test
    void overflowWarning_absentWhenMaxValueNotProvided() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder().n(1_000_000_000_000L).build());

        assertThat(response.getOverflowWarning()).isNull();
    }

    @Test
    void overflowWarning_handlesHugeValuesWithoutThrowing() {
        ConstraintAnalysisResponse response = service.analyze(
                ConstraintAnalysisRequest.builder()
                        .n(1_000_000_000_000_000_000L)
                        .maxValue(1_000_000_000_000_000_000L)
                        .build());

        assertThat(response.getOverflowWarning()).isNotNull();
    }
}
