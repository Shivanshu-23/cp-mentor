package com.cpmentor.method.controller;

import com.cpmentor.company.repository.CompanyProblemRepository;
import com.cpmentor.method.dto.MethodContentDTOs.*;
import com.cpmentor.method.entity.TriggerPhrase;
import com.cpmentor.method.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

// Phase E — all public, cached reference-data reads. No writes; nothing here
// is user-specific, so everything is safe to permitAll + cache client-side.
@RestController
@RequestMapping("/api/v1/method")
@RequiredArgsConstructor
public class MethodContentController {

    private static final CacheControl HOUR_CACHE = CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic();

    private final MethodPhaseRepository methodPhaseRepository;
    private final ComplexityBudgetRepository complexityBudgetRepository;
    private final OptimizationMoveRepository optimizationMoveRepository;
    private final StuckRungRepository stuckRungRepository;
    private final RecoveryStepRepository recoveryStepRepository;
    private final TriggerPhraseRepository triggerPhraseRepository;
    private final TopicPriorityRepository topicPriorityRepository;
    private final InterviewScriptStepRepository interviewScriptStepRepository;
    private final PatternProblemRepository patternProblemRepository;
    private final CompanyProblemRepository companyProblemRepository;

    @GetMapping("/phases")
    public ResponseEntity<List<MethodPhaseDTO>> getPhases() {
        var body = methodPhaseRepository.findAllByOrderByOrderIndexAsc().stream()
            .map(p -> new MethodPhaseDTO(p.getOrderIndex(), p.getName(), p.getPurpose(), p.getTimeBudgetMinutes(),
                p.getWhatToWriteDown(), p.getFailureModePrevented()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/complexity-budget")
    public ResponseEntity<List<ComplexityBudgetDTO>> getComplexityBudget() {
        var body = complexityBudgetRepository.findAllByOrderByOrderIndexAsc().stream()
            .map(c -> new ComplexityBudgetDTO(c.getOrderIndex(), c.getMaxNLabel(), c.getTargetComplexity(), c.getTechniques()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/moves")
    public ResponseEntity<List<OptimizationMoveDTO>> getMoves() {
        var body = optimizationMoveRepository.findAllByOrderByIdAsc().stream()
            .map(m -> new OptimizationMoveDTO(m.getCode(), m.getName(), m.getTriggerQuestion(), m.getTriggerPhrase(),
                m.getTechniques(), m.getExampleProblems()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/rungs")
    public ResponseEntity<List<StuckRungDTO>> getRungs() {
        var body = stuckRungRepository.findAllByOrderByRungAsc().stream()
            .map(r -> new StuckRungDTO(r.getRung(), r.getName(), r.getDescription(), r.getTimeBudgetMinutes(), r.getCostOfSkipping()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/recovery-steps")
    public ResponseEntity<List<RecoveryStepDTO>> getRecoverySteps() {
        var body = recoveryStepRepository.findAllByOrderByOrderIndexAsc().stream()
            .map(r -> new RecoveryStepDTO(r.getOrderIndex(), r.getName(), r.getDescription()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicPriorityDTO>> getTopics() {
        var body = topicPriorityRepository.findAllByOrderByRankAsc().stream()
            .map(t -> new TopicPriorityDTO(t.getRank(), t.getName(), t.getEstimatedHours(), t.getInterviewFrequency(), t.getPrerequisiteTopics()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/script")
    public ResponseEntity<List<InterviewScriptStepDTO>> getScript() {
        var body = interviewScriptStepRepository.findAllByOrderByOrderIndexAsc().stream()
            .map(s -> new InterviewScriptStepDTO(s.getOrderIndex(), s.getName(), s.getDescription()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    @GetMapping("/triggers/dictionary")
    public ResponseEntity<List<TriggerPhraseDTO>> searchTriggerDictionary(@RequestParam(required = false) String q) {
        List<TriggerPhrase> rows = (q == null || q.isBlank())
            ? triggerPhraseRepository.findAll()
            : triggerPhraseRepository.findByPhraseContainingIgnoreCase(q);

        var body = rows.stream()
            .map(t -> new TriggerPhraseDTO(t.getPhrase(), t.getPatternSlug(), t.getConfidence(),
                t.getAntiTriggers().stream()
                    .map(a -> new AntiTriggerDTO(a.getAntiTriggerPhrase(), a.getMisleadsToPatternSlug()))
                    .collect(Collectors.toList())))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }

    // Phase E9 — company frequency join. "Amazon problems that use monotonic stack" already
    // exists (Phase 6, company-problems?patternSlug=); this is the reverse view: for a given
    // pattern, which companies ask it most. Restricted to timeframe='all' to avoid
    // double-counting the same problem across overlapping timeframe buckets.
    @GetMapping("/patterns/{slug}/company-frequency")
    public ResponseEntity<List<CompanyFrequencyDTO>> getCompanyFrequency(@PathVariable String slug) {
        List<String> leetcodeIds = patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc(slug).stream()
            .map(p -> p.getLeetcodeId())
            .collect(Collectors.toList());

        if (leetcodeIds.isEmpty()) {
            return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(List.of());
        }

        var body = companyProblemRepository.countByLeetcodeIdsGroupByCompany(leetcodeIds, "all").stream()
            .map(row -> new CompanyFrequencyDTO(row.getCompany(), row.getCnt()))
            .collect(Collectors.toList());
        return ResponseEntity.ok().cacheControl(HOUR_CACHE).body(body);
    }
}
