package com.cpmentor.mockinterview.service;

import com.cpmentor.company.repository.CompanyProblemRepository;
import com.cpmentor.company.repository.CompanyProblemRepository.RandomProblemProjection;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.repository.SolveSessionRepository;
import com.cpmentor.mockinterview.dto.RandomProblemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

// A new package rather than folding into company/ or method/ — it genuinely
// reads from both (CompanyProblemRepository for the problem pool,
// SolveSessionRepository to exclude already-completed problems) and isn't a
// natural fit for either existing feature. Both dependencies are read-only;
// nothing in company/ or method/ depends back on this package, so the
// existing "company -> method, one-directional" rule documented in
// CLAUDE.md isn't violated — this is a new, separate arrow, not a cycle.
@Service
@RequiredArgsConstructor
public class MockInterviewService {

    private final CompanyProblemRepository companyProblemRepository;
    private final SolveSessionRepository solveSessionRepository;
    private final SecureRandom random = new SecureRandom();

    @Transactional(readOnly = true)
    public RandomProblemResponse randomProblem(String userEmail, String difficulty) {
        List<RandomProblemProjection> pool = companyProblemRepository.findDistinctForRandomPick(
                (difficulty == null || difficulty.isBlank()) ? null : difficulty);

        if (pool.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No problems available" + (difficulty != null ? " for difficulty " + difficulty : ""));
        }

        Set<String> completedLeetcodeIds = solveSessionRepository.findAllByUserEmail(userEmail).stream()
                .filter(s -> s.getEndedAt() != null)
                .map(SolveSession::getLeetcodeId)
                .collect(Collectors.toSet());

        List<RandomProblemProjection> unsolved = pool.stream()
                .filter(p -> !completedLeetcodeIds.contains(p.getLeetcodeId()))
                .toList();

        // Fall back to the full pool once everything at this difficulty has
        // been solved before, rather than dead-ending the mock interview mode.
        List<RandomProblemProjection> candidates = unsolved.isEmpty() ? pool : unsolved;
        RandomProblemProjection pick = candidates.get(random.nextInt(candidates.size()));

        return new RandomProblemResponse(pick.getLeetcodeId(), pick.getTitle(), pick.getUrl(), pick.getDifficulty());
    }
}
