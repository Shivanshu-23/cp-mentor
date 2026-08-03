package com.cpmentor.method.service;

import com.cpmentor.method.dto.PatternCandidateDTO;
import com.cpmentor.method.dto.PatternIdentificationRequest;
import com.cpmentor.method.dto.PatternIdentificationResponse;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.repository.PatternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Identifies candidate patterns purely by matching each pattern's recognitionTriggers
 * (and antiTriggers) as literal substrings against the problem statement + constraints.
 * No AI provider involved anywhere — deterministic, free, and testable.
 */
@Service
@RequiredArgsConstructor
public class PatternIdentificationService {

    private final PatternRepository patternRepository;

    private static final int TOP_N = 3;

    @Transactional(readOnly = true)
    public PatternIdentificationResponse identify(PatternIdentificationRequest request) {
        String haystack = normalize(request.getProblemStatement() + " "
                + (request.getConstraints() == null ? "" : request.getConstraints()));

        List<Pattern> allPatterns = patternRepository.findAll();

        List<PatternCandidateDTO> ranked = allPatterns.stream()
                .map(p -> toCandidate(p, haystack))
                .filter(c -> !c.getMatchedTriggers().isEmpty())
                .sorted(Comparator.comparingDouble(PatternCandidateDTO::getConfidence).reversed())
                .limit(TOP_N)
                .toList();

        List<PatternCandidateDTO> candidates = ranked.isEmpty()
                ? fallbackByFrequency(allPatterns)
                : ranked;

        return PatternIdentificationResponse.builder()
                .candidates(candidates)
                .suggestedBruteForce(
                        "Try every valid combination or position directly, then look for repeated work you can cache or skip.")
                .bottleneckQuestion("What exactly is being recomputed that you could instead store and reuse?")
                .build();
    }

    private PatternCandidateDTO toCandidate(Pattern pattern, String haystack) {
        List<String> matchedTriggers = matches(pattern.getRecognitionTriggers(), haystack);
        List<String> matchedAntiTriggers = matches(pattern.getAntiTriggers(), haystack);

        double confidence = matchedTriggers.isEmpty()
                ? 0.0
                : Math.min(0.9, 0.3 + 0.2 * matchedTriggers.size()) - 0.15 * matchedAntiTriggers.size();
        confidence = Math.max(0.05, confidence);

        String whyItFits = matchedTriggers.isEmpty()
                ? "No literal trigger-phrase match."
                : "Matches trigger phrase(s): " + String.join("; ", matchedTriggers);

        String whyItMightNotFit = matchedAntiTriggers.isEmpty()
                ? "Keyword-matched only — this hasn't been verified against your exact constraints, double check it actually fits."
                : "Also matches an anti-trigger phrase for this pattern: " + String.join("; ", matchedAntiTriggers)
                    + " — that usually signals a different pattern instead.";

        return PatternCandidateDTO.builder()
                .patternSlug(pattern.getSlug())
                .confidence(round2(confidence))
                .matchedTriggers(matchedTriggers)
                .whyItFits(whyItFits)
                .whyItMightNotFit(whyItMightNotFit)
                .build();
    }

    private List<PatternCandidateDTO> fallbackByFrequency(List<Pattern> allPatterns) {
        return allPatterns.stream()
                .sorted(Comparator.comparingInt(Pattern::getFrequencyScore).reversed())
                .limit(TOP_N)
                .map(p -> PatternCandidateDTO.builder()
                        .patternSlug(p.getSlug())
                        .confidence(0.1)
                        .matchedTriggers(List.of())
                        .whyItFits("No literal keyword match found in the problem statement — this is one of the "
                                + "most frequently-appearing patterns in interviews, worth checking manually.")
                        .whyItMightNotFit("This is a generic fallback suggestion, not based on anything specific to your problem.")
                        .build())
                .toList();
    }

    private List<String> matches(List<String> phrases, String haystack) {
        List<String> found = new ArrayList<>();
        for (String phrase : phrases) {
            if (phrase != null && !phrase.isBlank() && haystack.contains(normalize(phrase))) {
                found.add(phrase);
            }
        }
        return found;
    }

    private String normalize(String s) {
        return s == null ? "" : s.toLowerCase(Locale.ROOT);
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
