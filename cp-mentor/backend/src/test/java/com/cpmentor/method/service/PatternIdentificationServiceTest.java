package com.cpmentor.method.service;

import com.cpmentor.method.dto.PatternCandidateDTO;
import com.cpmentor.method.dto.PatternIdentificationRequest;
import com.cpmentor.method.dto.PatternIdentificationResponse;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.repository.PatternRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatternIdentificationServiceTest {

    @Mock
    private PatternRepository patternRepository;

    private PatternIdentificationService service;

    @BeforeEach
    void setUp() {
        service = new PatternIdentificationService(patternRepository);
    }

    @Test
    void matchesPatternsByLiteralTriggerPhrase() {
        Pattern monotonicStack = Pattern.builder()
                .slug("monotonic-stack").name("Monotonic Stack").frequencyScore(4)
                .recognitionTriggers(List.of("next greater element", "daily temperatures"))
                .antiTriggers(List.of())
                .build();
        Pattern twoPointer = Pattern.builder()
                .slug("two-pointer").name("Two Pointer").frequencyScore(5)
                .recognitionTriggers(List.of("sorted array", "two ends"))
                .antiTriggers(List.of())
                .build();
        when(patternRepository.findAll()).thenReturn(List.of(monotonicStack, twoPointer));

        PatternIdentificationResponse response = service.identify(
                PatternIdentificationRequest.builder()
                        .problemStatement("Find the next greater element for every position in the array.")
                        .build());

        assertThat(response.getCandidates()).hasSize(1);
        PatternCandidateDTO candidate = response.getCandidates().get(0);
        assertThat(candidate.getPatternSlug()).isEqualTo("monotonic-stack");
        assertThat(candidate.getMatchedTriggers()).contains("next greater element");
        assertThat(candidate.getConfidence()).isGreaterThan(0.0);
    }

    @Test
    void neverReturnsCodeAndTop3Only() {
        List<Pattern> patterns = List.of(
                pattern("a", "A", 5, "keyword one"),
                pattern("b", "B", 4, "keyword two"),
                pattern("c", "C", 3, "keyword three"),
                pattern("d", "D", 2, "keyword four"));
        when(patternRepository.findAll()).thenReturn(patterns);

        PatternIdentificationResponse response = service.identify(
                PatternIdentificationRequest.builder()
                        .problemStatement("keyword one keyword two keyword three keyword four")
                        .build());

        assertThat(response.getCandidates()).hasSizeLessThanOrEqualTo(3);
        assertThat(response.getSuggestedBruteForce()).doesNotContain("```", "{", "}", ";");
        assertThat(response.getBottleneckQuestion()).doesNotContain("```", "{", "}", ";");
    }

    @Test
    void moreMatchedTriggersMeansHigherConfidence() {
        Pattern strongMatch = pattern("strong", "Strong", 3, "alpha", "beta", "gamma");
        Pattern weakMatch = pattern("weak", "Weak", 3, "alpha");
        when(patternRepository.findAll()).thenReturn(List.of(strongMatch, weakMatch));

        PatternIdentificationResponse response = service.identify(
                PatternIdentificationRequest.builder()
                        .problemStatement("This problem involves alpha, beta, and gamma all at once.")
                        .build());

        var bySlug = response.getCandidates().stream()
                .collect(java.util.stream.Collectors.toMap(PatternCandidateDTO::getPatternSlug, c -> c));
        assertThat(bySlug.get("strong").getConfidence()).isGreaterThan(bySlug.get("weak").getConfidence());
    }

    @Test
    void antiTriggerMatchLowersConfidence() {
        Pattern withAntiTrigger = Pattern.builder()
                .slug("p1").name("P1").frequencyScore(3)
                .recognitionTriggers(List.of("some trigger"))
                .antiTriggers(List.of("but not this"))
                .build();
        when(patternRepository.findAll()).thenReturn(List.of(withAntiTrigger));

        PatternIdentificationResponse withoutAntiMatch = service.identify(
                PatternIdentificationRequest.builder().problemStatement("some trigger appears here").build());
        PatternIdentificationResponse withAntiMatch = service.identify(
                PatternIdentificationRequest.builder().problemStatement("some trigger appears here, but not this way").build());

        assertThat(withAntiMatch.getCandidates().get(0).getConfidence())
                .isLessThan(withoutAntiMatch.getCandidates().get(0).getConfidence());
    }

    @Test
    void noKeywordMatchAnywhere_fallsBackToTopPatternsByFrequency() {
        Pattern high = pattern("high", "High", 5, "unrelated-trigger-x");
        Pattern low = pattern("low", "Low", 1, "unrelated-trigger-y");
        when(patternRepository.findAll()).thenReturn(List.of(low, high));

        PatternIdentificationResponse response = service.identify(
                PatternIdentificationRequest.builder()
                        .problemStatement("Completely unrelated problem statement with no matches at all.")
                        .build());

        assertThat(response.getCandidates()).isNotEmpty();
        assertThat(response.getCandidates().get(0).getPatternSlug()).isEqualTo("high");
        assertThat(response.getCandidates()).allSatisfy(c -> assertThat(c.getMatchedTriggers()).isEmpty());
    }

    private Pattern pattern(String slug, String name, int frequencyScore, String... triggers) {
        return Pattern.builder()
                .slug(slug).name(name).frequencyScore(frequencyScore)
                .recognitionTriggers(List.of(triggers))
                .antiTriggers(List.of())
                .build();
    }
}
