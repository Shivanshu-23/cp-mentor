package com.cpmentor.method.service;

import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.entity.PatternProblem;
import com.cpmentor.method.entity.Resource;
import com.cpmentor.method.repository.PatternProblemRepository;
import com.cpmentor.method.repository.PatternRepository;
import com.cpmentor.method.repository.ResourceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

/**
 * Seeds the pattern library from {@code data/patterns.json} on startup, and seeds the
 * global (pattern-agnostic) resource list. Idempotent — upserts patterns by slug and skips
 * problems/resources that already exist, so restarting never duplicates rows.
 *
 * Follows the same @Async-on-ApplicationReadyEvent shape as CompanyDataLoaderService so
 * seeding never blocks app startup.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatternSeederService {

    private final PatternRepository patternRepository;
    private final PatternProblemRepository patternProblemRepository;
    private final ResourceRepository resourceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PATTERNS_JSON = "data/patterns.json";

    // Global resources — not tied to any specific pattern.
    private static final List<Resource> GLOBAL_RESOURCES = List.of(
        Resource.builder().title("Striver A2Z DSA Sheet")
            .url("https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2")
            .type(Resource.Type.SHEET).provider("takeUforward").build(),
        Resource.builder().title("Striver SDE Sheet")
            .url("https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems")
            .type(Resource.Type.SHEET).provider("takeUforward").build(),
        Resource.builder().title("NeetCode 150")
            .url("https://neetcode.io/practice")
            .type(Resource.Type.SHEET).provider("NeetCode").build(),
        Resource.builder().title("LeetCode")
            .url("https://leetcode.com/problemset/")
            .type(Resource.Type.PRACTICE).provider("LeetCode").build(),
        Resource.builder().title("CP-Algorithms")
            .url("https://cp-algorithms.com/")
            .type(Resource.Type.ARTICLE).provider("CP-Algorithms").build(),
        Resource.builder().title("VisuAlgo")
            .url("https://visualgo.net/en")
            .type(Resource.Type.VISUALIZER).provider("VisuAlgo").build(),
        Resource.builder().title("Big-O Cheat Sheet")
            .url("https://www.bigocheatsheet.com/")
            .type(Resource.Type.ARTICLE).provider("Big-O Cheat Sheet").build(),
        Resource.builder().title("USACO Guide")
            .url("https://usaco.guide/")
            .type(Resource.Type.SHEET).provider("USACO Guide").build()
    );

    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void seedOnStartup() {
        log.info("=== Seeding pattern library (async) ===");
        try {
            int patternCount = seedPatterns();
            int resourceCount = seedGlobalResources();
            log.info("✓ Pattern library seed complete — {} patterns upserted, {} global resources ensured",
                    patternCount, resourceCount);
        } catch (Exception e) {
            log.error("Pattern library seeding failed: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public int seedPatterns() throws Exception {
        List<PatternSeed> seeds;
        try (InputStream is = new ClassPathResource(PATTERNS_JSON).getInputStream()) {
            seeds = objectMapper.readValue(is, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, PatternSeed.class));
        }

        int upserted = 0;
        for (PatternSeed seed : seeds) {
            Pattern pattern = patternRepository.findBySlug(seed.slug)
                    .orElseGet(() -> Pattern.builder().slug(seed.slug).build());

            pattern.setName(seed.name);
            pattern.setCategory(Pattern.Category.valueOf(seed.category));
            pattern.setIntuition(seed.intuition);
            pattern.setRecognitionTriggers(seed.recognitionTriggers);
            pattern.setAntiTriggers(seed.antiTriggers);
            pattern.setJavaTemplate(seed.javaTemplate);
            pattern.setTimeComplexity(seed.timeComplexity);
            pattern.setSpaceComplexity(seed.spaceComplexity);
            pattern.setWhyComplexityIsNotObvious(seed.whyComplexityIsNotObvious);
            pattern.setCommonMistakes(seed.commonMistakes);
            pattern.setEdgeCaseChecklist(seed.edgeCaseChecklist);
            pattern.setVariants(seed.variants);
            pattern.setInterviewFollowUps(seed.interviewFollowUps);
            pattern.setRelatedPatterns(seed.relatedPatterns);
            pattern.setDifficultyToLearn(seed.difficultyToLearn);
            pattern.setFrequencyScore(seed.frequencyScore);
            patternRepository.save(pattern);
            upserted++;

            if (seed.problems != null) {
                for (ProblemSeed p : seed.problems) {
                    if (patternProblemRepository.existsByPatternSlugAndLeetcodeId(seed.slug, p.leetcodeId)) {
                        continue;
                    }
                    patternProblemRepository.save(PatternProblem.builder()
                            .patternSlug(seed.slug)
                            .leetcodeId(p.leetcodeId)
                            .title(p.title)
                            .url(p.url)
                            .difficulty(p.difficulty)
                            .striverStep(p.striverStep)
                            .role(PatternProblem.Role.valueOf(p.role))
                            .orderIndex(p.orderIndex)
                            .build());
                }
            }
        }
        return upserted;
    }

    @Transactional
    public int seedGlobalResources() {
        int ensured = 0;
        for (Resource r : GLOBAL_RESOURCES) {
            if (resourceRepository.existsByTitleAndUrl(r.getTitle(), r.getUrl())) continue;
            resourceRepository.save(Resource.builder()
                    .title(r.getTitle())
                    .url(r.getUrl())
                    .type(r.getType())
                    .provider(r.getProvider())
                    .build());
            ensured++;
        }
        return ensured;
    }

    // ── JSON seed shapes (data/patterns.json) ────────────────────────────────

    private static class PatternSeed {
        public String slug;
        public String name;
        public String category;
        public String intuition;
        public List<String> recognitionTriggers;
        public List<String> antiTriggers;
        public String javaTemplate;
        public String timeComplexity;
        public String spaceComplexity;
        public String whyComplexityIsNotObvious;
        public List<String> commonMistakes;
        public List<String> edgeCaseChecklist;
        public String variants;
        public List<String> interviewFollowUps;
        public List<String> relatedPatterns;
        public int difficultyToLearn;
        public int frequencyScore;
        public List<ProblemSeed> problems;
    }

    private static class ProblemSeed {
        public String leetcodeId;
        public String title;
        public String url;
        public String difficulty;
        public String striverStep;
        public String role;
        public int orderIndex;
    }
}
