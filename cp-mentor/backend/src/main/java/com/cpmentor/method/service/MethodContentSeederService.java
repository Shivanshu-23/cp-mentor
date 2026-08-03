package com.cpmentor.method.service;

import com.cpmentor.method.entity.*;
import com.cpmentor.method.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Phase E: seeds every "Method content" reference table. Idempotent — each
// block checks for existing rows before inserting, so a restart never
// duplicates data, following the same shape as PatternSeederService.
@Service
@RequiredArgsConstructor
@Slf4j
public class MethodContentSeederService {

    private final MethodPhaseRepository methodPhaseRepository;
    private final ComplexityBudgetRepository complexityBudgetRepository;
    private final OptimizationMoveRepository optimizationMoveRepository;
    private final StuckRungRepository stuckRungRepository;
    private final RecoveryStepRepository recoveryStepRepository;
    private final TriggerPhraseRepository triggerPhraseRepository;
    private final TopicPriorityRepository topicPriorityRepository;
    private final InterviewScriptStepRepository interviewScriptStepRepository;

    @Async
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        seedMethodPhases();
        seedComplexityBudgets();
        seedOptimizationMoves();
        seedStuckRungs();
        seedRecoverySteps();
        seedTriggerPhrases();
        seedTopicPriorities();
        seedInterviewScript();
        log.info("Method content seeding complete.");
    }

    private void seedMethodPhases() {
        if (methodPhaseRepository.count() > 0) return;
        methodPhaseRepository.saveAll(List.of(
            MethodPhase.builder().orderIndex(0).name("Constraints First").timeBudgetMinutes(3)
                .purpose("Lock the target complexity before writing any code — constraints tell you what's actually allowed.")
                .whatToWriteDown("n's range, whether the input is sorted/has duplicates/allows negatives, and the target Big-O.")
                .failureModePrevented("Jumping straight into a brute force that's obviously too slow, or over-engineering a solution for a tiny n.")
                .build(),
            MethodPhase.builder().orderIndex(1).name("Restate & Brute Force").timeBudgetMinutes(5)
                .purpose("Restate the problem in your own words, then state the obvious brute force and its complexity, even if you won't code it.")
                .whatToWriteDown("A one-sentence restatement, plus the brute-force approach and its Big-O.")
                .failureModePrevented("Silently misunderstanding the problem and optimizing the wrong thing.")
                .build(),
            MethodPhase.builder().orderIndex(2).name("Hand-Solve").timeBudgetMinutes(8)
                .purpose("Solve one small example entirely by hand before writing any code, to surface the actual mechanism.")
                .whatToWriteDown("A worked example with intermediate state at each step.")
                .failureModePrevented("Coding an approach you don't actually understand yet.")
                .build(),
            MethodPhase.builder().orderIndex(3).name("Bottleneck & Five Moves").timeBudgetMinutes(5)
                .purpose("Name exactly what the brute force recomputes or wastes, then check it against the five optimization moves.")
                .whatToWriteDown("The bottleneck statement, plus which optimization move(s) apply and why.")
                .failureModePrevented("Reaching for a memorized pattern that doesn't actually fit this problem's bottleneck.")
                .build(),
            MethodPhase.builder().orderIndex(4).name("Dry Run").timeBudgetMinutes(5)
                .purpose("Trace the chosen approach on paper against a tricky edge case before typing any code.")
                .whatToWriteDown("The edge case used and the expected output.")
                .failureModePrevented("Shipping code that compiles but is wrong on the one edge case that was never checked.")
                .build()
        ));
    }

    private void seedComplexityBudgets() {
        if (complexityBudgetRepository.count() > 0) return;
        complexityBudgetRepository.saveAll(List.of(
            ComplexityBudget.builder().orderIndex(0).maxNLabel("n ≤ 12").targetComplexity("O(n!)")
                .techniques(List.of("Permutations", "Full backtracking")).build(),
            ComplexityBudget.builder().orderIndex(1).maxNLabel("n ≤ 25").targetComplexity("O(2ⁿ)")
                .techniques(List.of("Bitmask DP", "Subset enumeration")).build(),
            ComplexityBudget.builder().orderIndex(2).maxNLabel("n ≤ 500").targetComplexity("O(n³)")
                .techniques(List.of("Interval DP", "Floyd-Warshall")).build(),
            ComplexityBudget.builder().orderIndex(3).maxNLabel("n ≤ 5,000").targetComplexity("O(n²)")
                .techniques(List.of("2D DP", "Pairwise comparison")).build(),
            ComplexityBudget.builder().orderIndex(4).maxNLabel("n ≤ 10⁶").targetComplexity("O(n log n) / O(n)")
                .techniques(List.of("Sort", "Heap", "Two pointer", "Sliding window", "Hashing")).build(),
            ComplexityBudget.builder().orderIndex(5).maxNLabel("n ≤ 10⁹").targetComplexity("O(log n) / O(1)")
                .techniques(List.of("Binary search on the answer", "Maths")).build(),
            ComplexityBudget.builder().orderIndex(6).maxNLabel("n ≤ 10¹⁸").targetComplexity("O(log n)")
                .techniques(List.of("Matrix exponentiation", "Digit DP")).build()
        ));
    }

    private void seedOptimizationMoves() {
        if (optimizationMoveRepository.count() > 0) return;
        optimizationMoveRepository.saveAll(List.of(
            OptimizationMove.builder().code("STORE_INSTEAD_OF_RECOMPUTE").name("Store Instead of Recompute")
                .triggerQuestion("Am I recalculating something I already computed on a previous iteration?")
                .triggerPhrase("recompute the same value")
                .techniques(List.of("Memoization", "Prefix sums", "Hash maps for O(1) lookup", "DP tables"))
                .exampleProblems(List.of("Two Sum", "Climbing Stairs", "Fibonacci Number", "Range Sum Query - Immutable", "Longest Common Subsequence"))
                .build(),
            OptimizationMove.builder().code("MONOTONIC_POINTER").name("Monotonic Pointer")
                .triggerQuestion("Does one pointer only ever need to move in one direction as the other advances?")
                .triggerPhrase("never needs to move backward")
                .techniques(List.of("Two pointers", "Sliding window", "Monotonic stack", "Monotonic deque"))
                .exampleProblems(List.of("Two Sum II - Sorted Array", "Container With Most Water", "Longest Substring Without Repeating Characters", "Next Greater Element I", "Trapping Rain Water"))
                .build(),
            OptimizationMove.builder().code("SORT_FIRST").name("Sort First")
                .triggerQuestion("Would knowing the relative order of elements make the rest of the problem trivial?")
                .triggerPhrase("in any order")
                .techniques(List.of("Sort then two-pointer", "Sort then greedy", "Sort then binary search"))
                .exampleProblems(List.of("3Sum", "Merge Intervals", "Non-overlapping Intervals", "Meeting Rooms II", "Kth Largest Element in an Array"))
                .build(),
            OptimizationMove.builder().code("ONLY_EXTREME_MATTERS").name("Only the Extreme Matters")
                .triggerQuestion("Do I only ever care about the current min/max/top-k, never the full sorted set?")
                .triggerPhrase("kth largest")
                .techniques(List.of("Heap / priority queue", "Monotonic deque"))
                .exampleProblems(List.of("Kth Largest Element in a Stream", "Top K Frequent Elements", "Sliding Window Maximum", "Merge k Sorted Lists", "Task Scheduler"))
                .build(),
            OptimizationMove.builder().code("BINARY_SEARCH_ANSWER").name("Binary Search the Answer")
                .triggerQuestion("Is the answer itself monotonic — if X works, does every value beyond X also work (or vice versa)?")
                .triggerPhrase("minimize the maximum")
                .techniques(List.of("Binary search on the answer space", "Parametric search"))
                .exampleProblems(List.of("Koko Eating Bananas", "Capacity To Ship Packages Within D Days", "Split Array Largest Sum", "Minimum Speed to Arrive on Time", "Find Peak Element"))
                .build()
        ));
    }

    private void seedStuckRungs() {
        if (stuckRungRepository.count() > 0) return;
        stuckRungRepository.saveAll(List.of(
            StuckRung.builder().rung(1).name("Re-read constraints").timeBudgetMinutes(2)
                .description("Constraints often encode the intended technique — re-read them assuming you missed a clue.")
                .costOfSkipping("You'll try to brute-force a problem whose n rules that out.").build(),
            StuckRung.builder().rung(2).name("Weird example").timeBudgetMinutes(3)
                .description("Hand-construct an adversarial or unusual example (empty, all-same, single-element, max-size) and see what breaks.")
                .costOfSkipping("You'll burn hint budget on an edge case you could have found yourself.").build(),
            StuckRung.builder().rung(3).name("Name the family").timeBudgetMinutes(3)
                .description("Say out loud what CATEGORY of problem this is (graph traversal, interval scheduling, DP on subsequences...) without naming the exact pattern.")
                .costOfSkipping("You jump straight to guessing techniques instead of narrowing the search space first.").build(),
            StuckRung.builder().rung(4).name("LeetCode tags").timeBudgetMinutes(2)
                .description("If genuinely stuck, check the problem's official topic tags — this is still self-directed, not a hint.")
                .costOfSkipping("None if used honestly; the risk is treating this as a crutch instead of trying rungs 1-3 first.").build(),
            StuckRung.builder().rung(5).name("Progressive hint").timeBudgetMinutes(5)
                .description("Request Level 1, then spend at least a few minutes of real effort before requesting Level 2.")
                .costOfSkipping("Chaining hint levels without trying between them means the muscle never actually builds.").build(),
            StuckRung.builder().rung(6).name("Read solution").timeBudgetMinutes(15)
                .description("Last resort. Read it, close it, then implement from memory — never copy while reading.")
                .costOfSkipping("Copying while the solution is open produces close to zero retention, which defeats the point of the app.").build()
        ));
    }

    private void seedRecoverySteps() {
        if (recoveryStepRepository.count() > 0) return;
        recoveryStepRepository.saveAll(List.of(
            RecoveryStep.builder().orderIndex(0).name("Close everything")
                .description("Close the solution, the editor tab, and any reference material.").build(),
            RecoveryStep.builder().orderIndex(1).name("Wait 10 minutes")
                .description("Do something else — let working memory clear so you're not just echoing text you just read.").build(),
            RecoveryStep.builder().orderIndex(2).name("Reimplement blind")
                .description("Write the full solution from scratch with nothing open.").build(),
            RecoveryStep.builder().orderIndex(3).name("Log the trigger")
                .description("Record what surface feature should have tipped you off, in the Trigger Log.").build(),
            RecoveryStep.builder().orderIndex(4).name("Redo at D+2 and D+7")
                .description("The spaced-repetition schedule that actually moves this into long-term memory.").build()
        ));
    }

    private void seedTriggerPhrases() {
        if (triggerPhraseRepository.count() > 0) return;
        triggerPhraseRepository.saveAll(List.of(
            phrase("longest substring", "sliding-window-variable", 0.85,
                anti("longest subsequence", "dp-1d")),
            phrase("two sum sorted array", "two-pointer", 0.8),
            phrase("next greater element", "monotonic-stack", 0.9,
                anti("kth greatest element", "heap-top-k")),
            phrase("minimum window substring", "sliding-window-variable", 0.85),
            phrase("merge intervals", "intervals", 0.9),
            phrase("meeting rooms", "intervals", 0.8),
            phrase("detect cycle in linked list", "linked-list-fast-slow", 0.9),
            phrase("middle of linked list", "linked-list-fast-slow", 0.75),
            phrase("range sum query", "prefix-sum", 0.85),
            phrase("maximum subarray sum", "dp-1d", 0.75,
                anti("contiguous subarray, negatives allowed -> looks like a sliding window", "sliding-window-variable")),
            phrase("kth largest element", "heap-top-k", 0.85,
                anti("kth smallest in a sorted matrix", "binary-search-answer")),
            phrase("top k frequent", "heap-top-k", 0.8),
            phrase("number of islands", "graph-bfs-dfs", 0.85),
            phrase("course schedule", "topological-sort", 0.9),
            phrase("minimum spanning tree", "union-find", 0.7),
            phrase("network delay time", "shortest-path", 0.85),
            phrase("all subsets", "recursion-backtracking", 0.85),
            phrase("all permutations", "recursion-backtracking", 0.85),
            phrase("single number", "bit-manipulation", 0.8),
            phrase("minimize the maximum", "binary-search-answer", 0.85,
                anti("find peak element in a sorted-ish array", "binary-search-array")),
            phrase("validate binary search tree", "bst-properties", 0.85)
        ));
    }

    private TriggerPhrase phrase(String phrase, String patternSlug, double confidence, TriggerPhrase.AntiTrigger... antiTriggers) {
        return TriggerPhrase.builder().phrase(phrase).patternSlug(patternSlug).confidence(confidence)
            .antiTriggers(antiTriggers.length > 0 ? List.of(antiTriggers) : List.of()).build();
    }

    private TriggerPhrase.AntiTrigger anti(String antiPhrase, String misleadsTo) {
        return TriggerPhrase.AntiTrigger.builder().antiTriggerPhrase(antiPhrase).misleadsToPatternSlug(misleadsTo).build();
    }

    private void seedTopicPriorities() {
        if (topicPriorityRepository.count() > 0) return;
        topicPriorityRepository.saveAll(List.of(
            topic(1, "Arrays & Basic Math", 8, 5),
            topic(2, "Time & Space Complexity Analysis", 4, 5, "Arrays & Basic Math"),
            topic(3, "Hashing (Hash Maps/Sets)", 6, 5, "Arrays & Basic Math"),
            topic(4, "Strings", 6, 5, "Arrays & Basic Math", "Hashing (Hash Maps/Sets)"),
            topic(5, "Two Pointers", 5, 5, "Arrays & Basic Math"),
            topic(6, "Sliding Window", 6, 5, "Two Pointers"),
            topic(7, "Sorting Algorithms", 5, 4, "Arrays & Basic Math"),
            topic(8, "Binary Search", 6, 5, "Sorting Algorithms"),
            topic(9, "Recursion Fundamentals", 5, 4, "Arrays & Basic Math"),
            topic(10, "Backtracking", 7, 4, "Recursion Fundamentals"),
            topic(11, "Linked Lists", 6, 4, "Arrays & Basic Math"),
            topic(12, "Stacks", 4, 4, "Arrays & Basic Math"),
            topic(13, "Queues & Deques", 4, 3, "Stacks"),
            topic(14, "Monotonic Stack", 5, 4, "Stacks"),
            topic(15, "Prefix Sum & Difference Arrays", 3, 3, "Arrays & Basic Math"),
            topic(16, "Intervals", 4, 4, "Sorting Algorithms"),
            topic(17, "Matrix / 2D Array Traversal", 4, 3, "Arrays & Basic Math"),
            topic(18, "Bit Manipulation", 4, 3, "Arrays & Basic Math"),
            topic(19, "Trees — Traversals", 6, 5, "Recursion Fundamentals"),
            topic(20, "Binary Search Trees", 5, 4, "Trees — Traversals"),
            topic(21, "Heaps / Priority Queues", 5, 4, "Trees — Traversals"),
            topic(22, "Tries", 4, 3, "Trees — Traversals", "Hashing (Hash Maps/Sets)"),
            topic(23, "Graphs — Representation & BFS/DFS", 7, 5, "Trees — Traversals", "Queues & Deques"),
            topic(24, "Topological Sort", 4, 3, "Graphs — Representation & BFS/DFS"),
            topic(25, "Union-Find (Disjoint Set)", 4, 3, "Graphs — Representation & BFS/DFS"),
            topic(26, "Shortest Path Algorithms", 6, 4, "Graphs — Representation & BFS/DFS", "Heaps / Priority Queues"),
            topic(27, "Minimum Spanning Tree", 3, 2, "Union-Find (Disjoint Set)"),
            topic(28, "Greedy Algorithms", 5, 4, "Sorting Algorithms", "Intervals"),
            topic(29, "Dynamic Programming — 1D", 8, 5, "Recursion Fundamentals"),
            topic(30, "Dynamic Programming — 2D", 8, 5, "Dynamic Programming — 1D"),
            topic(31, "DP on Strings", 6, 4, "Dynamic Programming — 2D"),
            topic(32, "DP on Trees", 5, 2, "Dynamic Programming — 1D", "Trees — Traversals"),
            topic(33, "Advanced Graphs (Bridges/SCC)", 6, 2, "Graphs — Representation & BFS/DFS"),
            topic(34, "System/Object-Oriented Design", 6, 4, "Hashing (Hash Maps/Sets)", "Linked Lists"),
            topic(35, "Design (Iterators, Rate Limiters, etc.)", 5, 3, "System/Object-Oriented Design")
        ));
    }

    private TopicPriority topic(int rank, String name, double hours, int freq, String... prereqs) {
        return TopicPriority.builder().rank(rank).name(name).estimatedHours(hours).interviewFrequency(freq)
            .prerequisiteTopics(prereqs.length > 0 ? List.of(prereqs) : List.of()).build();
    }

    private void seedInterviewScript() {
        if (interviewScriptStepRepository.count() > 0) return;
        interviewScriptStepRepository.saveAll(List.of(
            InterviewScriptStep.builder().orderIndex(0).name("State the constraint target")
                .description("Before anything else, say the target complexity out loud: \"Given n up to X, I'm aiming for O(...).\"").build(),
            InterviewScriptStep.builder().orderIndex(1).name("Restate the problem")
                .description("In your own words, confirm you understand the input/output and any implicit rules.").build(),
            InterviewScriptStep.builder().orderIndex(2).name("Brute force")
                .description("State the obvious brute-force approach and its complexity, even though you won't fully code it.").build(),
            InterviewScriptStep.builder().orderIndex(3).name("Trace an example")
                .description("Walk through one small example by hand so the interviewer sees your reasoning, not just a memorized answer.").build(),
            InterviewScriptStep.builder().orderIndex(4).name("Name the bottleneck")
                .description("Say exactly what the brute force wastes or recomputes.").build(),
            InterviewScriptStep.builder().orderIndex(5).name("State approach + complexity")
                .description("Name your optimized approach and its time/space complexity before writing a line of code.").build(),
            InterviewScriptStep.builder().orderIndex(6).name("Code it")
                .description("Write clean code, narrating major decisions as you go.").build(),
            InterviewScriptStep.builder().orderIndex(7).name("Offer a follow-up")
                .description("Proactively raise one follow-up question (e.g. \"what if this needs to run on a stream?\") before the interviewer asks.").build()
        ));
    }
}
