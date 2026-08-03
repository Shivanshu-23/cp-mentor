package com.cpmentor.method.service;

import com.cpmentor.method.dto.HintRequest;
import com.cpmentor.method.dto.HintResponse;
import com.cpmentor.method.dto.PatternIdentificationRequest;
import com.cpmentor.method.dto.PatternIdentificationResponse;
import com.cpmentor.method.entity.HintRequestLog;
import com.cpmentor.method.entity.Pattern;
import com.cpmentor.method.repository.HintRequestLogRepository;
import com.cpmentor.method.repository.PatternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/**
 * Progressive hints, built entirely from data already stored on {@link Pattern} —
 * no AI provider is ever called. The one non-negotiable rule: never volunteer a full
 * solution before level 4, and never name a pattern before level 2.
 *
 * Level 1 — a single observation, no pattern named.
 * Level 2 — the pattern named and why it fits.
 * Level 3 — pseudo-code, no language syntax (a de-Java-ified rendering of the template).
 * Level 4 — the canonical Java template (requires an explicit confirmLevel4 flag).
 */
@Service
@RequiredArgsConstructor
public class HintService {

    private final HintRequestLogRepository hintRequestLogRepository;
    private final PatternRepository patternRepository;
    private final PatternIdentificationService patternIdentificationService;

    private static final Duration COOLDOWN = Duration.ofSeconds(3);

    @Transactional
    public HintResponse getHint(String userEmail, HintRequest request) {
        String problemIdentifier = resolveProblemIdentifier(request);
        List<HintRequestLog> history = hintRequestLogRepository
                .findByUserEmailAndProblemIdentifierOrderByRequestedAtDesc(userEmail, problemIdentifier);

        enforceRateLimit(request, history);

        Pattern pattern = resolvePattern(request);

        String hint = switch (request.getLevel()) {
            case 1 -> level1Hint(request.getProblemStatement());
            case 2 -> level2Hint(pattern);
            case 3 -> level3Hint(pattern);
            case 4 -> level4Hint(pattern);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "level must be 1-4");
        };

        hintRequestLogRepository.save(HintRequestLog.builder()
                .userEmail(userEmail)
                .problemIdentifier(problemIdentifier)
                .level(request.getLevel())
                .requestedAt(LocalDateTime.now())
                .build());

        return HintResponse.builder()
                .level(request.getLevel())
                .hint(hint)
                .containsCode(request.getLevel() == 4)
                .matchedPatternSlug(pattern != null ? pattern.getSlug() : null)
                .build();
    }

    // ── Rate limiting ─────────────────────────────────────────────────────────

    private void enforceRateLimit(HintRequest request, List<HintRequestLog> history) {
        int maxLevelGranted = history.stream().mapToInt(HintRequestLog::getLevel).max().orElse(0);
        if (request.getLevel() > maxLevelGranted + 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Hints are progressive — request level " + (maxLevelGranted + 1)
                            + " before level " + request.getLevel() + ".");
        }

        if (!history.isEmpty()) {
            Duration sinceLastRequest = Duration.between(history.get(0).getRequestedAt(), LocalDateTime.now());
            if (sinceLastRequest.compareTo(COOLDOWN) < 0) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Slow down — wait a few seconds between hint requests.");
            }
        }

        if (request.getLevel() == 4 && !request.isConfirmLevel4()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Level 4 reveals a full solution — resubmit with confirmLevel4=true to confirm.");
        }
    }

    private String resolveProblemIdentifier(HintRequest request) {
        if (request.getProblemIdentifier() != null && !request.getProblemIdentifier().isBlank()) {
            return request.getProblemIdentifier();
        }
        return "stmt-" + Integer.toHexString(request.getProblemStatement().hashCode());
    }

    // ── Pattern resolution ───────────────────────────────────────────────────

    private Pattern resolvePattern(HintRequest request) {
        if (request.getLevel() == 1) return null; // level 1 must never name a pattern

        String slug = request.getPatternSlug();
        if (slug == null || slug.isBlank()) {
            slug = guessPatternSlug(request.getProblemStatement());
        }
        return slug == null ? null : patternRepository.findBySlug(slug).orElse(null);
    }

    private String guessPatternSlug(String problemStatement) {
        PatternIdentificationResponse response = patternIdentificationService.identify(
                PatternIdentificationRequest.builder().problemStatement(problemStatement).build());
        return response.getCandidates().isEmpty() ? null : response.getCandidates().get(0).getPatternSlug();
    }

    // ── Level generators ─────────────────────────────────────────────────────

    private String level1Hint(String problemStatement) {
        String s = problemStatement.toLowerCase(Locale.ROOT);
        if (s.contains("sorted")) {
            return "The input is explicitly sorted — what does that guarantee about how a value's position "
                    + "relates to its neighbors, and how could you exploit that to avoid scanning everything?";
        }
        if (s.contains("tree") || s.contains("node")) {
            return "This involves a tree structure — think about what a node needs from its children before "
                    + "it can compute its own answer, versus what it needs to pass down to them.";
        }
        if (s.contains("graph") || s.contains("edge")) {
            return "This is graph-shaped — before picking a way to explore it, decide whether you actually need "
                    + "the shortest path, mere reachability, or something else entirely.";
        }
        if (s.contains("string") || s.contains("substring")) {
            return "You're working with a string — consider whether the answer depends on a contiguous run of "
                    + "characters, or whether any subset would do just as well.";
        }
        if (s.contains("matrix") || s.contains("grid")) {
            return "This is grid-shaped — decide whether each cell only depends on its immediate neighbors, or "
                    + "whether information needs to propagate arbitrarily far across the grid.";
        }
        return "Before reaching for any specific technique, restate the problem in your own words and identify "
                + "exactly what varies between the input's smallest and largest valid case.";
    }

    private String level2Hint(Pattern pattern) {
        if (pattern == null) {
            return "No pattern identified yet — try /identify-pattern first, or include a few more descriptive "
                    + "keywords from the problem statement.";
        }
        return "This looks like a " + pattern.getName() + " problem. " + firstSentence(pattern.getIntuition());
    }

    private String level3Hint(Pattern pattern) {
        if (pattern == null) {
            return "No pattern identified yet — request level 2 first.";
        }
        return "Algorithmic outline for " + pattern.getName() + " (pseudocode, not exact code):\n\n"
                + toPseudocode(pattern.getJavaTemplate());
    }

    private String level4Hint(Pattern pattern) {
        if (pattern == null) {
            return "No pattern identified yet — request level 3 first.";
        }
        return "Canonical " + pattern.getName() + " template — adapt variable names and the exact condition "
                + "to your specific problem:\n\n" + pattern.getJavaTemplate();
    }

    private String firstSentence(String text) {
        if (text == null || text.isBlank()) return "";
        int idx = text.indexOf(". ");
        return idx > 0 ? text.substring(0, idx + 1) : text;
    }

    /**
     * Best-effort de-Java-ification: strips type declarations, braces, semicolons, and
     * comments so the result reads as algorithmic steps rather than compilable code.
     * Not a real transpiler — good enough for a level-3 hint, not meant to be exact.
     */
    private String toPseudocode(String javaCode) {
        if (javaCode == null || javaCode.isBlank()) return "";
        StringBuilder result = new StringBuilder();
        for (String line : javaCode.split("\n")) {
            String cleaned = line
                    .replaceAll("//.*$", "")
                    .replace("{", "").replace("}", "")
                    .replaceAll(";\\s*$", "")
                    .replaceAll("\\b(int|long|double|float|boolean|char|byte|short|void|var|final|static|new)\\b\\s*", "")
                    .replaceAll("\\b(String|Integer|Long|Boolean|Character|Double)\\b(<[^>]*>)?\\s*", "")
                    .replaceAll("\\b(List|Map|Set|Deque|Queue|ArrayDeque|ArrayList|HashMap|LinkedHashMap|"
                            + "LinkedList|PriorityQueue|TreeMap|TreeSet|Comparator)(<[^>]*>)?\\s*", "")
                    .trim();
            if (!cleaned.isBlank()) result.append(cleaned).append("\n");
        }
        return result.toString().trim();
    }
}
