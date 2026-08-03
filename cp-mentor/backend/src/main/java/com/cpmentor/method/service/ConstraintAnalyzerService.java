package com.cpmentor.method.service;

import com.cpmentor.method.dto.ConstraintAnalysisRequest;
import com.cpmentor.method.dto.ConstraintAnalysisResponse;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure logic, no AI/DB involved — maps a max input size (n) to a target complexity
 * and a starter list of candidate techniques, per the standard competitive-programming
 * "n tells you the complexity" heuristic. Flags reorder/extend that list.
 */
@Service
public class ConstraintAnalyzerService {

    public ConstraintAnalysisResponse analyze(ConstraintAnalysisRequest req) {
        Bracket bracket = bracketFor(req.getN());

        List<String> techniques = new ArrayList<>(bracket.baseTechniques);

        // Bounded values promotes counting sort / frequency arrays — often applicable
        // regardless of bracket, so they're inserted (not just reordered) when relevant.
        if (req.isValuesBounded()) {
            promote(techniques, "Frequency array");
            promote(techniques, "Counting sort");
        }

        // Sorted input promotes two-pointer and binary search techniques.
        if (req.isSorted()) {
            promote(techniques, "Binary search");
            promote(techniques, "Two pointer");
        }

        // Negative values break the monotonic-window assumption sliding window relies
        // on, and undermine most greedy exchange arguments — demote both if present.
        if (req.isNegativesAllowed()) {
            demote(techniques, "Sliding window");
            demote(techniques, "Greedy");
        }

        return ConstraintAnalysisResponse.builder()
                .targetComplexity(bracket.targetComplexity)
                .candidateTechniques(techniques)
                .overflowWarning(overflowWarning(req.getN(), req.getMaxValue()))
                .build();
    }

    private String overflowWarning(long n, Long maxValue) {
        if (maxValue == null) return null;
        BigInteger product = BigInteger.valueOf(n).multiply(BigInteger.valueOf(Math.abs(maxValue)));
        if (product.compareTo(BigInteger.valueOf(Integer.MAX_VALUE)) > 0) {
            return "n * maxValue overflows a 32-bit accumulator — use `long` for sums/products.";
        }
        return null;
    }

    private void promote(List<String> techniques, String item) {
        techniques.remove(item);
        techniques.add(0, item);
    }

    private void demote(List<String> techniques, String item) {
        if (techniques.remove(item)) {
            techniques.add(item);
        }
    }

    private Bracket bracketFor(long n) {
        for (Bracket b : Bracket.values()) {
            if (n <= b.maxN) return b;
        }
        return Bracket.HUGE; // n larger than any bracket ceiling still falls to the last one
    }

    private enum Bracket {
        FACTORIAL(12, "O(n!)", List.of("Permutations", "Full backtracking")),
        EXPONENTIAL(25, "O(2^n)", List.of("Bitmask DP", "Subset enumeration")),
        CUBIC(500, "O(n^3)", List.of("Interval DP", "Floyd-Warshall")),
        QUADRATIC(5_000, "O(n^2)", List.of("2D DP", "Pairwise comparison")),
        LINEARITHMIC(1_000_000, "O(n log n) / O(n)",
                List.of("Sort", "Heap", "Two pointer", "Sliding window", "Hashing")),
        LOGARITHMIC(1_000_000_000L, "O(log n) / O(1)",
                List.of("Binary search on answer", "Maths")),
        HUGE(1_000_000_000_000_000_000L, "O(log n)",
                List.of("Matrix exponentiation", "Digit DP"));

        final long maxN;
        final String targetComplexity;
        final List<String> baseTechniques;

        Bracket(long maxN, String targetComplexity, List<String> baseTechniques) {
            this.maxN = maxN;
            this.targetComplexity = targetComplexity;
            this.baseTechniques = baseTechniques;
        }
    }
}
