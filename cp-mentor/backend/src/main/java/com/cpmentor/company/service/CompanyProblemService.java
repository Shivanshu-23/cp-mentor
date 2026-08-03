package com.cpmentor.company.service;

import com.cpmentor.company.dto.CompanyProblemDTO;
import com.cpmentor.company.entity.CompanyProblem;
import com.cpmentor.company.entity.UserProblemProgress;
import com.cpmentor.company.repository.CompanyProblemRepository;
import com.cpmentor.company.repository.UserProblemProgressRepository;
import com.cpmentor.method.entity.PatternProblem;
import com.cpmentor.method.repository.PatternProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyProblemService {

    private final CompanyProblemRepository problemRepository;
    private final UserProblemProgressRepository progressRepository;
    private final PatternProblemRepository patternProblemRepository; // Phase 6 company/pattern cross-link

    // ── Get problems with user progress ──────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CompanyProblemDTO> getProblems(
            String company, String timeframe, String difficulty,
            String userEmail, Pageable pageable) {
        return getProblems(company, timeframe, difficulty, null, userEmail, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CompanyProblemDTO> getProblems(
            String company, String timeframe, String difficulty, String patternSlug,
            String userEmail, Pageable pageable) {

        boolean hasDifficulty = difficulty != null && !difficulty.isBlank() && !difficulty.equalsIgnoreCase("all");
        boolean hasPattern = patternSlug != null && !patternSlug.isBlank();

        Page<CompanyProblem> page;
        if (hasPattern) {
            List<String> leetcodeIds = patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc(patternSlug)
                    .stream().map(PatternProblem::getLeetcodeId).toList();
            if (leetcodeIds.isEmpty()) {
                page = Page.empty(pageable);
            } else if (hasDifficulty) {
                page = problemRepository.findByCompanyAndTimeframeAndDifficultyAndLeetcodeIdIn(
                        company, timeframe, difficulty, leetcodeIds, pageable);
            } else {
                page = problemRepository.findByCompanyAndTimeframeAndLeetcodeIdIn(
                        company, timeframe, leetcodeIds, pageable);
            }
        } else if (hasDifficulty) {
            page = problemRepository.findByCompanyAndTimeframeAndDifficulty(
                    company, timeframe, difficulty, pageable);
        } else {
            page = problemRepository.findByCompanyAndTimeframe(company, timeframe, pageable);
        }

        // Load user progress for this page of problems
        List<String> leetcodeIds = page.getContent().stream()
                .map(CompanyProblem::getLeetcodeId)
                .collect(Collectors.toList());

        Map<String, Integer> progressMap = Map.of(); // default: no progress
        if (userEmail != null && !leetcodeIds.isEmpty()) {
            progressMap = progressRepository
                    .findByUserEmailAndLeetcodeIdIn(userEmail, leetcodeIds)
                    .stream()
                    .collect(Collectors.toMap(
                            UserProblemProgress::getLeetcodeId,
                            UserProblemProgress::getTickCount));
        }

        final Map<String, Integer> finalProgressMap = progressMap;
        return page.map(p -> toDTO(p, finalProgressMap.getOrDefault(p.getLeetcodeId(), 0)));
    }

    // ── Tick — cycle 0→1→2→3→0 ───────────────────────────────────────────────

    @Transactional
    public int tick(String leetcodeId, String userEmail) {
        UserProblemProgress progress = progressRepository
                .findByUserEmailAndLeetcodeId(userEmail, leetcodeId)
                .orElseGet(() -> UserProblemProgress.builder()
                        .userEmail(userEmail)
                        .leetcodeId(leetcodeId)
                        .tickCount(0)
                        .build());

        // Cycle: 0 → 1 → 2 → 3 → 0
        int newTick = (progress.getTickCount() + 1) % 4;
        progress.setTickCount(newTick);
        progress.setLastUpdated(LocalDateTime.now());
        progressRepository.save(progress);

        log.debug("Tick: {} → {} for user {}", leetcodeId, newTick, userEmail);
        return newTick;
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats(String userEmail) {
        long solved    = progressRepository.countByUserEmailAndTickCount(userEmail, 3);
        long attempted = progressRepository.countByUserEmailAndTickCount(userEmail, 2);
        long seen      = progressRepository.countByUserEmailAndTickCount(userEmail, 1);
        return Map.of("solved", solved, "attempted", attempted, "seen", seen,
                      "total", solved + attempted + seen);
    }

    // ── Companies list ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<String> getAvailableCompanies() {
        return problemRepository.findAllDistinctCompanies();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private CompanyProblemDTO toDTO(CompanyProblem p, int tickCount) {
        return CompanyProblemDTO.builder()
                .id(p.getId())
                .leetcodeId(p.getLeetcodeId())
                .url(p.getUrl())
                .title(p.getTitle())
                .difficulty(p.getDifficulty())
                .company(p.getCompany())
                .timeframe(p.getTimeframe())
                .acceptanceRate(p.getAcceptanceRate())
                .frequency(p.getFrequency())
                .tickCount(tickCount)
                .build();
    }
}
