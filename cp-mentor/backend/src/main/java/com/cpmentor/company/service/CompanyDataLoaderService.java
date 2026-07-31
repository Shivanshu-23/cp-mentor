package com.cpmentor.company.service;

import com.cpmentor.company.entity.CompanyProblem;
import com.cpmentor.company.repository.CompanyProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Fetches company-wise LeetCode problems from GitHub on startup.
 *
 * Source: https://github.com/snehasishroy/leetcode-companywise-interview-questions
 * CSV format: ID,URL,Title,Difficulty,AcceptanceRate%,Frequency%
 *
 * Runs asynchronously so it doesn't block the app from starting.
 * Skips if data already exists (safe to restart).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyDataLoaderService {

    private final CompanyProblemRepository repository;

    private static final String BASE_URL =
        "https://raw.githubusercontent.com/Shivanshu-23/leetcode-companywise-interview-questions/master/";

    // Top companies to load — add more as needed
    private static final List<String> COMPANIES = List.of(
        "amazon", "google", "microsoft", "meta", "apple",
        "uber", "netflix", "bloomberg", "adobe", "atlassian",
        "linkedin", "oracle", "salesforce", "walmart-labs", "paypal",
        "goldman-sachs", "morgan-stanley", "jpmorgan"
    );

    private static final List<String> TIMEFRAMES = List.of(
        "all", "six-months", "three-months", "thirty-days", "more-than-six-months"
    );

    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void loadOnStartup() {
        log.info("=== Starting company-wise problem data load (async) ===");
        int total = 0;
        for (String company : COMPANIES) {
            for (String timeframe : TIMEFRAMES) {
                try {
                    int loaded = loadCompanyTimeframe(company, timeframe);
                    total += loaded;
                } catch (Exception e) {
                    log.debug("Skipping {}/{}: {}", company, timeframe, e.getMessage());
                }
            }
        }
        log.info("✓ Company data load complete — {} problems loaded across {} companies",
                total, COMPANIES.size());
    }

    @Transactional
    public int loadCompanyTimeframe(String company, String timeframe) throws Exception {
        // Skip if already loaded
        if (repository.countByCompanyAndTimeframe(company, timeframe) > 0) {
            return 0;
        }

        String csvUrl = BASE_URL + company + "/" + timeframe + ".csv";
        String csvContent = fetchUrl(csvUrl);
        if (csvContent == null || csvContent.isBlank()) return 0;

        List<CompanyProblem> problems = parseCsv(csvContent, company, timeframe);
        if (!problems.isEmpty()) {
            repository.saveAll(problems);
            log.info("  ✓ Loaded {} problems for {}/{}", problems.size(), company, timeframe);
        }
        return problems.size();
    }

    private List<CompanyProblem> parseCsv(String csv, String company, String timeframe) {
        List<CompanyProblem> result = new ArrayList<>();
        String[] lines = csv.split("\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            // Format: ID,URL,Title,Difficulty,AcceptanceRate,Frequency
            String[] parts = line.split(",", 6);
            if (parts.length < 4) continue;

            try {
                String leetcodeId = parts[0].trim();
                String url        = parts[1].trim();
                String title      = parts[2].trim();
                String difficulty = parts[3].trim();
                String acceptance = parts.length > 4 ? parts[4].trim() : "";
                String frequency  = parts.length > 5 ? parts[5].trim() : "";

                // Skip header lines if any
                if (leetcodeId.equalsIgnoreCase("id") || !leetcodeId.matches("\\d+")) continue;

                // Skip duplicates within same batch
                if (repository.existsByLeetcodeIdAndCompanyAndTimeframe(leetcodeId, company, timeframe)) {
                    continue;
                }

                result.add(CompanyProblem.builder()
                        .leetcodeId(leetcodeId)
                        .url(url)
                        .title(title)
                        .difficulty(difficulty)
                        .company(company)
                        .timeframe(timeframe)
                        .acceptanceRate(acceptance)
                        .frequency(frequency)
                        .build());

            } catch (Exception e) {
                log.debug("Skipping malformed CSV line: {}", line);
            }
        }
        return result;
    }

    private String fetchUrl(String urlStr) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "CP-Mentor/1.0");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(15000);

        int code = conn.getResponseCode();
        if (code == 404) return null;
        if (code != 200) throw new RuntimeException("HTTP " + code + " for " + urlStr);

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        }
    }

    // Manual reload endpoint support
    @Transactional
    public int reloadCompany(String company) {
        int total = 0;
        for (String timeframe : TIMEFRAMES) {
            try {
                total += loadCompanyTimeframe(company, timeframe);
            } catch (Exception e) {
                log.warn("Failed to reload {}/{}: {}", company, timeframe, e.getMessage());
            }
        }
        return total;
    }
}
