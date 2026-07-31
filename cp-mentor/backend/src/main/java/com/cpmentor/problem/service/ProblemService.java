package com.cpmentor.problem.service;

import com.cpmentor.ingestion.repository.DailyChallengeRepository;
import com.cpmentor.problem.dto.ProblemDTO;
import com.cpmentor.problem.entity.Problem;
import com.cpmentor.problem.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final DailyChallengeRepository dailyChallengeRepository;

    /**
     * Returns today's daily challenge (from daily_challenges table).
     * Falls back to the most recent challenge if today's isn't fetched yet.
     * Falls back to the latest seeded problem if no challenges exist at all.
     */
    @Transactional(readOnly = true)
    public ProblemDTO getDailyProblem() {
        // Try today's challenge first
        return dailyChallengeRepository.findByChallengeDate(LocalDate.now())
                .map(dc -> toDTO(dc.getProblem()))
                // Fall back to most recent challenge
                .orElseGet(() -> dailyChallengeRepository.findFirstByOrderByChallengeDateDesc()
                        .map(dc -> {
                            log.warn("No challenge for today, using most recent: {}", dc.getChallengeDate());
                            return toDTO(dc.getProblem());
                        })
                        // Fall back to latest seeded problem
                        .orElseGet(() -> problemRepository.findLatest()
                                .map(this::toDTO)
                                .orElseThrow(() -> new RuntimeException("No problems found in database"))
                        )
                );
    }

    @Transactional(readOnly = true)
    public ProblemDTO getProblemById(Long id) {
        return problemRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Problem not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<ProblemDTO> getAllProblems(Pageable pageable) {
        return problemRepository.findAll(pageable).map(this::toDTO);
    }

    private ProblemDTO toDTO(Problem p) {
        return ProblemDTO.builder()
                .id(p.getId())
                .leetcodeId(p.getLeetcodeId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .difficulty(p.getDifficulty())
                .description(p.getDescription())
                .constraints(p.getConstraints())
                .topics(p.getTopics())
                .exampleInput(p.getExampleInput())
                .exampleOutput(p.getExampleOutput())
                .leetcodeUrl(p.getSlug() != null && !p.getSlug().isBlank()
                        ? "https://leetcode.com/problems/" + p.getSlug() + "/" : "")
                .fetchedAt(p.getFetchedAt())
                .build();
    }
}
