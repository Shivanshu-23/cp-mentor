package com.cpmentor.method.service;

import com.cpmentor.method.dto.PatternDetailDTO;
import com.cpmentor.method.dto.PatternProblemDTO;
import com.cpmentor.method.dto.PatternSummaryDTO;
import com.cpmentor.method.dto.ResourceDTO;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.entity.PatternProblem;
import com.cpmentor.method.entity.Resource;
import com.cpmentor.method.repository.PatternProblemRepository;
import com.cpmentor.method.repository.PatternRepository;
import com.cpmentor.method.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatternService {

    private final PatternRepository patternRepository;
    private final PatternProblemRepository patternProblemRepository;
    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public Page<PatternSummaryDTO> getPatterns(Pattern.Category category, Pageable pageable) {
        Page<Pattern> page = category != null
                ? patternRepository.findByCategory(category, pageable)
                : patternRepository.findAll(pageable);
        return page.map(this::toSummaryDTO);
    }

    @Transactional(readOnly = true)
    public PatternDetailDTO getPatternDetail(String slug) {
        return patternRepository.findBySlug(slug)
                .map(this::toDetailDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pattern not found: " + slug));
    }

    @Transactional(readOnly = true)
    public List<PatternProblemDTO> getPatternProblems(String slug) {
        if (!patternRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pattern not found: " + slug);
        }
        return patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc(slug).stream()
                .map(this::toProblemDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResourceDTO> getResources(String patternSlug) {
        List<Resource> resources = patternSlug != null
                ? resourceRepository.findByPatternSlug(patternSlug)
                : resourceRepository.findByPatternSlugIsNull();
        return resources.stream().map(this::toResourceDTO).toList();
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private PatternSummaryDTO toSummaryDTO(Pattern p) {
        return PatternSummaryDTO.builder()
                .id(p.getId())
                .slug(p.getSlug())
                .name(p.getName())
                .category(p.getCategory())
                .intuition(p.getIntuition())
                .recognitionTriggers(p.getRecognitionTriggers())
                .difficultyToLearn(p.getDifficultyToLearn())
                .frequencyScore(p.getFrequencyScore())
                .build();
    }

    private PatternDetailDTO toDetailDTO(Pattern p) {
        return PatternDetailDTO.builder()
                .id(p.getId())
                .slug(p.getSlug())
                .name(p.getName())
                .category(p.getCategory())
                .intuition(p.getIntuition())
                .recognitionTriggers(p.getRecognitionTriggers())
                .antiTriggers(p.getAntiTriggers())
                .javaTemplate(p.getJavaTemplate())
                .timeComplexity(p.getTimeComplexity())
                .spaceComplexity(p.getSpaceComplexity())
                .whyComplexityIsNotObvious(p.getWhyComplexityIsNotObvious())
                .commonMistakes(p.getCommonMistakes())
                .edgeCaseChecklist(p.getEdgeCaseChecklist())
                .variants(p.getVariants())
                .interviewFollowUps(p.getInterviewFollowUps())
                .relatedPatterns(p.getRelatedPatterns())
                .difficultyToLearn(p.getDifficultyToLearn())
                .frequencyScore(p.getFrequencyScore())
                .build();
    }

    private PatternProblemDTO toProblemDTO(PatternProblem p) {
        return PatternProblemDTO.builder()
                .id(p.getId())
                .patternSlug(p.getPatternSlug())
                .leetcodeId(p.getLeetcodeId())
                .title(p.getTitle())
                .url(p.getUrl())
                .difficulty(p.getDifficulty())
                .striverStep(p.getStriverStep())
                .role(p.getRole())
                .orderIndex(p.getOrderIndex())
                .build();
    }

    private ResourceDTO toResourceDTO(Resource r) {
        return ResourceDTO.builder()
                .id(r.getId())
                .patternSlug(r.getPatternSlug())
                .title(r.getTitle())
                .url(r.getUrl())
                .type(r.getType())
                .provider(r.getProvider())
                .build();
    }
}
