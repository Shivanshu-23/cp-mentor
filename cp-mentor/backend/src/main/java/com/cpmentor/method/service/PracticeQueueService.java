package com.cpmentor.method.service;

import com.cpmentor.method.dto.PracticeQueueItemResponse;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.entity.PatternProblem;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.repository.PatternProblemRepository;
import com.cpmentor.method.repository.PatternRepository;
import com.cpmentor.method.repository.SolveSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

// Turns the Progress Dashboard's "weak patterns" stat (FAIL in the last 14
// days — StatsService.weakPatternSlugs) into something actionable: for each
// weak pattern, the next problem in that pattern's learning order the user
// hasn't completed a Solve Session for yet. "Completed" here means a Solve
// Session with an endedAt, same signal StatsService already uses elsewhere —
// not TriggerEntry existence, since logging a trigger doesn't require having
// solved the problem in this app's data model.
@Service
@RequiredArgsConstructor
public class PracticeQueueService {

    private final StatsService statsService;
    private final PatternRepository patternRepository;
    private final PatternProblemRepository patternProblemRepository;
    private final SolveSessionRepository solveSessionRepository;

    @Transactional(readOnly = true)
    public List<PracticeQueueItemResponse> getQueue(String userEmail) {
        List<String> weakSlugs = statsService.weakPatternSlugs(userEmail);
        if (weakSlugs.isEmpty()) return List.of();

        Set<String> completedLeetcodeIds = solveSessionRepository.findAllByUserEmail(userEmail).stream()
                .filter(s -> s.getEndedAt() != null)
                .map(SolveSession::getLeetcodeId)
                .collect(Collectors.toSet());

        List<PracticeQueueItemResponse> queue = new ArrayList<>();
        for (String slug : weakSlugs) {
            Pattern pattern = patternRepository.findBySlug(slug).orElse(null);
            if (pattern == null) continue; // pattern data may have changed since the trigger was logged

            List<PatternProblem> problems = patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc(slug);
            problems.stream()
                    .filter(p -> !completedLeetcodeIds.contains(p.getLeetcodeId()))
                    .findFirst()
                    .ifPresent(next -> queue.add(new PracticeQueueItemResponse(
                            slug, pattern.getName(), next.getLeetcodeId(), next.getTitle(), next.getUrl(), next.getDifficulty()
                    )));
        }
        return queue;
    }
}
