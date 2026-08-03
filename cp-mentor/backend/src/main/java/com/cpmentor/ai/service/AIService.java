package com.cpmentor.ai.service;

import com.cpmentor.ai.dto.AIAnalysisDTO;
import com.cpmentor.ai.dto.AIAnalysisDTO.SolutionApproach;
import com.cpmentor.problem.entity.Problem;
import com.cpmentor.problem.repository.ProblemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ProblemRepository problemRepository;
    private final ObjectMapper objectMapper;
    private final Environment environment;

    @Value("${gemini.api-key:}")  private String geminiKey;
    @Value("${openai.api-key:}")  private String openAiKey;
    @Value("${claude.api-key:}")  private String claudeKey;
    @Value("${openai.model:gpt-4o-mini}") private String openAiModel;

    private static final List<String> GEMINI_MODELS = List.of(
        "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash"
    );

    public AIAnalysisDTO analyze(Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found: " + problemId));

        if (isSet(geminiKey)) {
            log.info("Using Gemini for: {}", problem.getTitle());
            for (String model : GEMINI_MODELS) {
                try {
                    AIAnalysisDTO result = analyzeWithGemini(problem, model);
                    log.info("✓ Gemini ({}) responded successfully", model);
                    return result;
                } catch (Exception e) {
                    log.warn("Gemini {} failed: {}", model, e.getMessage());
                    if (isAccountLevelError(e.getMessage())) {
                        log.warn("Gemini failure looks account-level (quota/auth) — skipping remaining models instead of retrying each one");
                        break;
                    }
                }
            }
        }

        if (isSet(openAiKey)) {
            log.info("Using OpenAI for: {}", problem.getTitle());
            try { return analyzeWithOpenAI(problem); }
            catch (Exception e) { log.warn("OpenAI failed: {}", e.getMessage()); }
        }

        if (isSet(claudeKey)) {
            log.info("Using Claude for: {}", problem.getTitle());
            try { return analyzeWithClaude(problem); }
            catch (Exception e) { log.warn("Claude failed: {}", e.getMessage()); }
        }

        // v2 Phase G: the rich concept fallback is test-profile-only now — it was reachable
        // in prod/dev whenever every real provider failed (BUG 3's quota exhaustion made this
        // a live path, not a hypothetical), and while it IS clearly labeled
        // (modelUsed: "static-concept-fallback"), a partially-filled analysis with empty
        // Solutions/tiered-explanation tabs still reads as "the app tried and half-worked"
        // rather than the honest "AI is down" it actually is. Prod/dev now get a distinct,
        // minimal degraded state instead.
        if (environment.acceptsProfiles(Profiles.of("test"))) {
            log.info("No working AI — returning test-profile concept fallback for: {}", problem.getTitle());
            return buildConceptFallback(problem);
        }

        log.warn("No working AI provider for: {} — returning degraded state", problem.getTitle());
        return buildDegradedState(problem);
    }

    private AIAnalysisDTO buildDegradedState(Problem problem) {
        return AIAnalysisDTO.builder()
            .problemId(problem.getId()).problemTitle(problem.getTitle())
            .problemSummary("AI analysis is unavailable right now — every configured provider (Gemini/OpenAI/Claude) "
                    + "failed to respond. This is not a partial result; nothing below is AI-generated.")
            .recognizedPattern("Unavailable")
            .modelUsed("unavailable")
            .fromCache(false)
            .degraded(true)
            .build();
    }

    // ── Fast-fail detection ────────────────────────────────────────────────────
    // Quota/auth errors are account-level, not model-level — retrying the other
    // two Gemini models wastes time since they'll fail the exact same way.
    private boolean isAccountLevelError(String message) {
        if (message == null) return false;
        String m = message.toUpperCase();
        return m.contains("429") || m.contains("RESOURCE_EXHAUSTED")
                || m.contains("403") || m.contains("PERMISSION_DENIED")
                || m.contains("401") || m.contains("UNAUTHENTICATED")
                || m.contains("API_KEY_INVALID") || m.contains("API KEY NOT VALID");
    }

    // ── Gemini via HttpURLConnection + X-goog-api-key header ─────────────────

    private AIAnalysisDTO analyzeWithGemini(Problem problem, String model) throws Exception {
        String urlStr = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent";

        String prompt = buildPrompt(problem);
        String requestBody = "{\"contents\":[{\"parts\":[{\"text\":"
                + objectMapper.writeValueAsString(prompt)
                + "}]}],\"generationConfig\":{\"temperature\":0.3,\"maxOutputTokens\":4000}}";

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("X-goog-api-key", geminiKey);
        conn.setDoOutput(true);
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(25000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        int code = conn.getResponseCode();
        var is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (code != 200) {
            throw new RuntimeException(code + " " + raw.substring(0, Math.min(200, raw.length())));
        }

        JsonNode root = objectMapper.readTree(raw);
        if (root.has("error")) {
            throw new RuntimeException(root.path("error").path("code").asText()
                    + " " + root.path("error").path("message").asText());
        }

        String content = root.path("candidates").get(0)
                .path("content").path("parts").get(0).path("text").asText();

        return parseJsonResponse(content, problem, model);
    }

    // ── OpenAI ────────────────────────────────────────────────────────────────

    private AIAnalysisDTO analyzeWithOpenAI(Problem problem) throws Exception {
        String requestBody = "{\"model\":\"" + openAiModel + "\","
                + "\"messages\":[{\"role\":\"system\",\"content\":\"You are a senior CP mentor. Return ONLY raw JSON.\"},"
                + "{\"role\":\"user\",\"content\":" + objectMapper.writeValueAsString(buildPrompt(problem)) + "}],"
                + "\"max_tokens\":4000,\"temperature\":0.3}";

        URL url = new URL("https://api.openai.com/v1/chat/completions");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + openAiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(60000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        String raw = new String(conn.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String content = objectMapper.readTree(raw)
                .path("choices").get(0).path("message").path("content").asText();
        return parseJsonResponse(content, problem, openAiModel);
    }

    // ── Claude ────────────────────────────────────────────────────────────────

    private AIAnalysisDTO analyzeWithClaude(Problem problem) throws Exception {
        String requestBody = "{\"model\":\"claude-haiku-4-5-20251001\",\"max_tokens\":4000,"
                + "\"messages\":[{\"role\":\"user\",\"content\":"
                + objectMapper.writeValueAsString(buildPrompt(problem)) + "}]}";

        URL url = new URL("https://api.anthropic.com/v1/messages");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("x-api-key", claudeKey);
        conn.setRequestProperty("anthropic-version", "2023-06-01");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(60000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        String raw = new String(conn.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String content = objectMapper.readTree(raw)
                .path("content").get(0).path("text").asText();
        return parseJsonResponse(content, problem, "claude-haiku-4-5");
    }

    // ── Prompt ────────────────────────────────────────────────────────────────

    private String buildPrompt(Problem problem) {
        return "You are a senior competitive programming mentor.\n"
                + "Analyze this problem and return ONLY a raw JSON object — no markdown, no ```json, just JSON.\n\n"
                + "Problem: " + problem.getTitle() + "\n"
                + "Difficulty: " + problem.getDifficulty() + "\n"
                + "Topics: " + String.join(", ", problem.getTopics()) + "\n"
                + "Description: " + problem.getDescription() + "\n\n"
                + "Return JSON with these exact keys:\n"
                + "problemSummary, recognizedPattern,\n"
                + "requiredDataStructures (array), requiredAlgorithms (array),\n"
                + "easyExplanation, mediumExplanation, advancedExplanation,\n"
                + "bruteForce { name, idea, timeComplexity, spaceComplexity, pseudoCode, javaCode },\n"
                + "betterApproach { same fields }, optimalApproach { same fields },\n"
                + "commonMistakes (array), interviewTips, edgeCases (array),\n"
                + "dryRun, visualization, realWorldApplications (array),\n"
                + "companiesAsking (array), whenToUseThisAlgorithm, whenNotToUseThisAlgorithm,\n"
                + "revisionNotes, relatedProblems (array), practiceOrder (array), flashCards (array)";
    }

    // ── Parser ────────────────────────────────────────────────────────────────

    private AIAnalysisDTO parseJsonResponse(String content, Problem problem, String model) throws Exception {
        String cleaned = content
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();
        JsonNode j = objectMapper.readTree(cleaned);

        return AIAnalysisDTO.builder()
                .problemId(problem.getId()).problemTitle(problem.getTitle())
                .problemSummary(t(j,"problemSummary"))
                .recognizedPattern(t(j,"recognizedPattern"))
                .requiredDataStructures(arr(j,"requiredDataStructures"))
                .requiredAlgorithms(arr(j,"requiredAlgorithms"))
                .easyExplanation(t(j,"easyExplanation"))
                .mediumExplanation(t(j,"mediumExplanation"))
                .advancedExplanation(t(j,"advancedExplanation"))
                .bruteForce(approach(j.path("bruteForce")))
                .betterApproach(approach(j.path("betterApproach")))
                .optimalApproach(approach(j.path("optimalApproach")))
                .commonMistakes(arr(j,"commonMistakes"))
                .interviewTips(t(j,"interviewTips"))
                .edgeCases(arr(j,"edgeCases"))
                .dryRun(t(j,"dryRun"))
                .visualization(t(j,"visualization"))
                .realWorldApplications(arr(j,"realWorldApplications"))
                .companiesAsking(arr(j,"companiesAsking"))
                .whenToUseThisAlgorithm(t(j,"whenToUseThisAlgorithm"))
                .whenNotToUseThisAlgorithm(t(j,"whenNotToUseThisAlgorithm"))
                .revisionNotes(t(j,"revisionNotes"))
                .relatedProblems(arr(j,"relatedProblems"))
                .practiceOrder(arr(j,"practiceOrder"))
                .flashCards(arr(j,"flashCards"))
                .modelUsed(model).fromCache(false).build();
    }

    private SolutionApproach approach(JsonNode n) {
        if (n == null || n.isMissingNode()) return null;
        return SolutionApproach.builder()
                .name(t(n,"name")).idea(t(n,"idea"))
                .timeComplexity(t(n,"timeComplexity")).spaceComplexity(t(n,"spaceComplexity"))
                .pseudoCode(t(n,"pseudoCode")).javaCode(t(n,"javaCode")).build();
    }

    private boolean isSet(String k) { return k != null && !k.isBlank(); }
    private String t(JsonNode n, String f) { return n.path(f).asText(""); }
    private List<String> arr(JsonNode n, String f) {
        JsonNode a = n.path(f);
        if (!a.isArray()) return List.of();
        List<String> r = new ArrayList<>();
        a.forEach(x -> r.add(x.asText()));
        return r;
    }

    // ── Static concept fallback (no AI provider available/working) ────────────
    // Not a generic placeholder — pulls curated notes for whichever of the
    // problem's topic tags we recognize, so the fallback is still useful.

    private record TopicConcept(String idea, String dataStructure, String algorithm, String tip) {}

    private static final Map<String, TopicConcept> TOPIC_CONCEPTS = new LinkedHashMap<>();
    static {
        TOPIC_CONCEPTS.put("Array", new TopicConcept(
            "Arrays give O(1) index access. Look for a one-pass solution using a hash map for lookups, or two pointers to avoid nested loops.",
            "Array", "Two Pointers / Prefix Sum",
            "Ask if the array is sorted — that often unlocks binary search or a two-pointer sweep."));
        TOPIC_CONCEPTS.put("Hash Table", new TopicConcept(
            "Hash maps trade O(n) space for ~O(1) average lookup/insert — the classic tool for \"have I seen this before?\" or counting problems.",
            "Hash Map / Hash Set", "Hashing",
            "Mention that worst-case lookup is O(n) under collisions, even though average case is O(1)."));
        TOPIC_CONCEPTS.put("Two Pointers", new TopicConcept(
            "Two pointers moving toward each other (or one fast/one slow) turn an O(n²) nested loop into O(n) by exploiting sorted order or a monotonic condition.",
            "Array", "Two Pointers",
            "Works best when the array is sorted, or you can define a condition that only moves in one direction."));
        TOPIC_CONCEPTS.put("Sliding Window", new TopicConcept(
            "Maintain a window [left, right] over the array/string and expand/shrink it incrementally instead of recomputing from scratch each time.",
            "Array / HashMap (window state)", "Sliding Window",
            "Ask yourself: when the window becomes invalid, do I shrink from the left once, or in a loop?"));
        TOPIC_CONCEPTS.put("Binary Search", new TopicConcept(
            "Any monotonic search space (sorted array, or an answer where \"can I do X with capacity Y\" is monotonic) can be binary searched in O(log n).",
            "Array", "Binary Search",
            "If the problem asks for a minimum/maximum satisfying some condition, consider binary searching on the answer itself."));
        TOPIC_CONCEPTS.put("Dynamic Programming", new TopicConcept(
            "Break the problem into overlapping subproblems with optimal substructure; cache results (memoization) or build a table bottom-up to avoid recomputation.",
            "Array / HashMap (memo table)", "Dynamic Programming",
            "State your recurrence relation out loud first — the code follows naturally once the recurrence is right."));
        TOPIC_CONCEPTS.put("Greedy", new TopicConcept(
            "At each step, take the locally optimal choice and argue (often via exchange argument) that it never hurts the global optimum.",
            "Array (often sorted first)", "Greedy",
            "Be ready to justify WHY greedy works here — interviewers often ask for a counter-example proof."));
        TOPIC_CONCEPTS.put("Backtracking", new TopicConcept(
            "Explore a decision tree of choices, undoing (\"backtracking\") a choice once it's fully explored, pruning branches that can't lead to a valid answer.",
            "Recursion stack / Array (path)", "Backtracking",
            "Add pruning as early as possible — checking validity before recursing, not after, is what keeps this fast enough."));
        TOPIC_CONCEPTS.put("Tree", new TopicConcept(
            "Most tree problems reduce to a DFS (pre/in/post-order) or BFS (level order) traversal, often carrying extra state down through recursion.",
            "Binary Tree / Queue (for BFS)", "DFS / BFS",
            "Clarify: is it a binary tree, BST, or n-ary tree? BST adds an ordering invariant you can exploit."));
        TOPIC_CONCEPTS.put("Binary Tree", TOPIC_CONCEPTS.get("Tree"));
        TOPIC_CONCEPTS.put("Graph", new TopicConcept(
            "Model the problem as nodes + edges, then reach for DFS/BFS for reachability/shortest-unweighted-path, or Dijkstra/Union-Find for weighted/connectivity problems.",
            "Adjacency List/Map", "DFS / BFS / Union-Find",
            "Check for cycles and whether the graph is directed — both change which algorithm is safe to use."));
        TOPIC_CONCEPTS.put("Depth-First Search", new TopicConcept(
            "DFS explores as far as possible down one path before backtracking — natural fit for connectivity, path existence, and tree/graph traversal problems.",
            "Recursion stack / explicit Stack", "DFS",
            "Watch for infinite loops on cyclic graphs — track visited nodes."));
        TOPIC_CONCEPTS.put("Breadth-First Search", new TopicConcept(
            "BFS explores level-by-level using a queue — the go-to for shortest path in an unweighted graph, since it guarantees the first time you reach a node is via the shortest path.",
            "Queue", "BFS",
            "If asked for shortest path and edges are unweighted, BFS beats Dijkstra in both simplicity and speed."));
        TOPIC_CONCEPTS.put("Stack", new TopicConcept(
            "A stack is the natural fit whenever you need to match/undo the most recent unresolved thing first — parentheses matching, monotonic stacks, undo history.",
            "Stack", "Monotonic Stack (when applicable)",
            "If you're scanning for \"next greater/smaller element,\" a monotonic stack gets you O(n) instead of O(n²)."));
        TOPIC_CONCEPTS.put("Linked List", new TopicConcept(
            "Linked list problems usually hinge on careful pointer manipulation — dummy head nodes and fast/slow pointers solve most of them cleanly.",
            "Linked List", "Two Pointers (fast/slow)",
            "Draw the pointers on paper before coding — off-by-one pointer bugs are the #1 source of errors here."));
        TOPIC_CONCEPTS.put("Heap (Priority Queue)", new TopicConcept(
            "A heap keeps the min/max accessible in O(1) with O(log n) insert/remove — ideal for \"top K\", merging sorted streams, or scheduling problems.",
            "Heap / Priority Queue", "Heap-based selection",
            "For \"top K\" problems, a heap of size K is often faster than sorting the whole input."));
        TOPIC_CONCEPTS.put("Sorting", new TopicConcept(
            "Sorting first (O(n log n)) frequently simplifies an otherwise-hard problem into a linear scan, especially for interval or two-pointer problems.",
            "Array", "Sorting (+ custom comparator if needed)",
            "Ask whether a stable sort or specific tie-breaking rule matters for correctness."));
        TOPIC_CONCEPTS.put("String", new TopicConcept(
            "String problems often combine hashing (for pattern matching/counting), two pointers, or dynamic programming (for edit distance/subsequence problems).",
            "String / Hash Map", "Depends on sub-pattern (hashing, DP, two pointers)",
            "Clarify character set (ASCII vs Unicode) and case sensitivity before assuming a fixed-size frequency array works."));
        TOPIC_CONCEPTS.put("Bit Manipulation", new TopicConcept(
            "XOR, AND, OR and shifts let you do set operations, parity checks, or state compression in O(1) per operation instead of using extra data structures.",
            "Bitmask (int/long)", "Bit Manipulation",
            "XOR-ing all elements cancels out pairs — a classic trick for \"find the single/missing number\" problems."));
        TOPIC_CONCEPTS.put("Math", new TopicConcept(
            "Look for a closed-form formula, modular arithmetic property, or number-theoretic shortcut (GCD, sieve, combinatorics) before reaching for brute force.",
            "Rarely needs one — mostly arithmetic", "Number Theory / Combinatorics",
            "Watch for integer overflow — check if the constraints require long arithmetic or modulo reduction."));
        TOPIC_CONCEPTS.put("Union Find", new TopicConcept(
            "Union-Find (Disjoint Set) tracks connectivity between elements in near-O(1) per operation with path compression + union by rank — ideal for \"are these connected?\" and Kruskal's MST.",
            "Disjoint Set Union array", "Union-Find (path compression + union by rank)",
            "Mention path compression explicitly — it's what takes this from O(log n) to near O(1) amortized."));
        TOPIC_CONCEPTS.put("Recursion", new TopicConcept(
            "Define the base case and the recursive step that reduces the problem toward it — most recursion bugs come from a missing or wrong base case.",
            "Call stack", "Recursion (± memoization)",
            "If the recursion tree has overlapping subproblems, add memoization before it becomes exponential."));
        TOPIC_CONCEPTS.put("Counting", new TopicConcept(
            "Counting problems usually reduce to a frequency map or prefix-sum-of-counts, turning an O(n²) comparison into an O(n) pass.",
            "Hash Map / frequency array", "Counting / Prefix Sums",
            "Consider whether counts fit in a fixed-size array (e.g. 26 for lowercase letters) instead of a hash map."));
        TOPIC_CONCEPTS.put("Trie", new TopicConcept(
            "A trie stores strings by shared prefixes, giving O(L) prefix search/insert (L = word length) — ideal for autocomplete, word search, and prefix-matching problems.",
            "Trie (prefix tree)", "Trie traversal",
            "If memory is tight, compare a trie against a plain hash set of prefixes — sometimes the simpler structure suffices."));
        TOPIC_CONCEPTS.put("Matrix", new TopicConcept(
            "Treat the matrix as a graph of cells for BFS/DFS traversal problems, or exploit row/column monotonicity for search-based ones.",
            "2D Array", "DFS / BFS / Binary Search (if sorted rows/cols)",
            "Clarify whether diagonal moves count as adjacent — it changes both the algorithm and complexity."));
        TOPIC_CONCEPTS.put("Divide and Conquer", new TopicConcept(
            "Split the problem into independent halves, solve each recursively, then combine the results — classic for merge sort, quickselect, and closest-pair problems.",
            "Recursion / Array", "Divide and Conquer",
            "State the recurrence T(n) = a·T(n/b) + f(n) and its Master Theorem complexity if asked."));
    }

    private AIAnalysisDTO buildConceptFallback(Problem problem) {
        List<String> topics = problem.getTopics() == null ? List.of() : problem.getTopics();
        List<TopicConcept> matched = topics.stream()
                .map(TOPIC_CONCEPTS::get)
                .filter(c -> c != null)
                .distinct()
                .collect(Collectors.toList());

        List<String> dataStructures = matched.stream().map(TopicConcept::dataStructure).distinct().collect(Collectors.toList());
        List<String> algorithms = matched.stream().map(TopicConcept::algorithm).distinct().collect(Collectors.toList());

        String ideas = matched.isEmpty()
                ? "No curated notes for this problem's specific topics yet. Start from first principles: work out the brute-force approach, "
                    + "then look for redundant repeated work you can cut with a better data structure (hash map, sorted structure, or extra pass)."
                : matched.stream().map(TopicConcept::idea).collect(Collectors.joining("\n\n"));

        String tips = matched.isEmpty()
                ? "State your brute-force approach out loud first, then optimize — interviewers weigh your reasoning process as much as the final answer."
                : matched.stream().map(TopicConcept::tip).collect(Collectors.joining("\n"));

        return AIAnalysisDTO.builder()
            .problemId(problem.getId()).problemTitle(problem.getTitle())
            .problemSummary("AI analysis is temporarily unavailable, so here are curated concept notes for this problem's topics"
                    + (topics.isEmpty() ? "." : ": " + String.join(", ", topics) + "."))
            .recognizedPattern(topics.isEmpty() ? "General Problem Solving" : String.join(" + ", topics))
            .requiredDataStructures(dataStructures.isEmpty() ? List.of("Depends on the constraints — re-read them closely") : dataStructures)
            .requiredAlgorithms(algorithms.isEmpty() ? List.of("Brute force first, then optimize") : algorithms)
            .easyExplanation(ideas)
            .interviewTips(tips)
            .revisionNotes("This is a static concept fallback, not a full AI walkthrough with code — re-run analysis once an AI provider "
                    + "(Gemini/OpenAI/Claude) is reachable for a complete per-problem breakdown.")
            .modelUsed("static-concept-fallback")
            .fromCache(false).build();
    }
}
