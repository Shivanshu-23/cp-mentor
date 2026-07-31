package com.cpmentor.ingestion.service;

import com.cpmentor.ingestion.entity.DailyChallenge;
import com.cpmentor.ingestion.repository.DailyChallengeRepository;
import com.cpmentor.problem.entity.Problem;
import com.cpmentor.problem.entity.Problem.Difficulty;
import com.cpmentor.problem.repository.ProblemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeetCodeFetchService {

    private final ObjectMapper objectMapper;
    private final ProblemRepository problemRepository;
    private final DailyChallengeRepository dailyChallengeRepository;

    private static final String GRAPHQL_URL = "https://leetcode.com/graphql";

    // "constraints" isn't a separate field on LeetCode's QuestionNode — it's embedded
    // in the "Constraints:" <ul> inside the HTML `content` field, parsed out below.
    private static final String QUERY =
        "{\"query\":\"query questionOfToday { activeDailyCodingChallengeQuestion { date link question { questionId questionFrontendId title titleSlug difficulty content topicTags { name } exampleTestcases } } }\"}";

    @Transactional
    public DailyChallenge fetchAndSaveTodaysChallenge() {
        LocalDate today = LocalDate.now();

        if (dailyChallengeRepository.existsByChallengeDate(today)) {
            log.info("Daily challenge for {} already exists", today);
            return dailyChallengeRepository.findByChallengeDate(today).orElseThrow();
        }

        log.info("Fetching LeetCode daily challenge for {}...", today);
        try {
            return fetchFromLeetCode(today);
        } catch (Exception e) {
            log.warn("LeetCode fetch failed: {}. Using fallback.", e.getMessage());
            return useFallback(today);
        }
    }

    private DailyChallenge fetchFromLeetCode(LocalDate today) throws Exception {
        log.debug("Calling LeetCode GraphQL via HttpURLConnection...");

        URL url = new URL(GRAPHQL_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
        conn.setRequestProperty("Referer", "https://leetcode.com/");
        conn.setRequestProperty("Origin", "https://leetcode.com");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(15000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(QUERY.getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = conn.getResponseCode();
        log.debug("LeetCode HTTP response code: {}", responseCode);

        InputStream is = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String responseJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        log.debug("LeetCode response body: {}", responseJson);

        if (responseCode != 200) {
            throw new RuntimeException("HTTP " + responseCode + ": " + responseJson);
        }

        JsonNode check = objectMapper.readTree(responseJson);
        if (check.has("errors")) {
            throw new RuntimeException("GraphQL error: " + check.path("errors").toString());
        }

        return parseAndSave(responseJson, today);
    }

    private DailyChallenge parseAndSave(String json, LocalDate today) throws Exception {
        JsonNode root     = objectMapper.readTree(json);
        JsonNode q        = root.path("data").path("activeDailyCodingChallengeQuestion");

        if (q.isMissingNode() || q.isNull())
            throw new RuntimeException("activeDailyCodingChallengeQuestion missing");

        String link       = q.path("link").asText("");
        JsonNode question = q.path("question");

        String leetcodeId    = question.path("questionFrontendId").asText();
        String title         = question.path("title").asText();
        String slug          = question.path("titleSlug").asText();
        String difficultyStr = question.path("difficulty").asText("Easy");
        String rawContent    = question.path("content").asText("");
        String content       = stripHtml(rawContent);
        String constraints   = extractConstraints(rawContent);
        String exampleOutput = extractFirstExampleOutput(rawContent);
        String examples      = question.path("exampleTestcases").asText("");

        List<String> topics = new ArrayList<>();
        for (JsonNode tag : question.path("topicTags")) {
            topics.add(tag.path("name").asText());
        }

        Difficulty difficulty = switch (difficultyStr.toLowerCase()) {
            case "medium" -> Difficulty.MEDIUM;
            case "hard"   -> Difficulty.HARD;
            default       -> Difficulty.EASY;
        };

        Problem problem = problemRepository.findByLeetcodeId(leetcodeId).orElseGet(() ->
            Problem.builder()
                .leetcodeId(leetcodeId).title(title).slug(slug).difficulty(difficulty)
                .description(content).constraints(constraints).topics(topics)
                .exampleInput(parseFirstInput(examples)).exampleOutput(exampleOutput)
                .fetchedAt(LocalDateTime.now()).build());

        problem.setTitle(title);
        problem.setDifficulty(difficulty);
        problem.setTopics(topics);
        if (!content.isBlank()) problem.setDescription(content);
        if (!constraints.isBlank()) problem.setConstraints(constraints);
        if (!exampleOutput.isBlank()) problem.setExampleOutput(exampleOutput);
        problem = problemRepository.save(problem);

        DailyChallenge saved = dailyChallengeRepository.save(DailyChallenge.builder()
                .problem(problem).challengeDate(today)
                .leetcodeLink("https://leetcode.com" + link)
                .fetchedAt(LocalDateTime.now()).build());

        log.info("✓ Daily challenge saved: #{} {} ({})", leetcodeId, title, difficulty);
        return saved;
    }

    private DailyChallenge useFallback(LocalDate today) {
        return dailyChallengeRepository.findFirstByOrderByChallengeDateDesc()
                .map(prev -> dailyChallengeRepository.save(DailyChallenge.builder()
                        .problem(prev.getProblem()).challengeDate(today)
                        .leetcodeLink(prev.getLeetcodeLink())
                        .fetchedAt(LocalDateTime.now()).build()))
                .orElseGet(() -> {
                    Problem first = problemRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("No problems in DB"));
                    return dailyChallengeRepository.save(DailyChallenge.builder()
                            .problem(first).challengeDate(today)
                            .leetcodeLink("https://leetcode.com/problems/" + first.getSlug())
                            .fetchedAt(LocalDateTime.now()).build());
                });
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) return "";
        // Preserve exponents like 10^5 before the generic tag-strip below blanks <sup> out
        return html.replaceAll("(?i)<sup>", "^").replaceAll("(?i)</sup>", "")
                .replaceAll("<[^>]+>", " ").replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">").replaceAll("&amp;", "&")
                .replaceAll("&nbsp;", " ").replaceAll("&#39;", "'")
                .replaceAll("&quot;", "\"").replaceAll("\\s{2,}", " ").trim();
    }

    private String parseFirstInput(String examples) {
        if (examples == null || examples.isBlank()) return "";
        return examples.split("\n")[0];
    }

    private String extractConstraints(String rawHtml) {
        if (rawHtml == null || rawHtml.isBlank()) return "";

        int headingIdx = indexOfIgnoreCase(rawHtml, "constraints");
        if (headingIdx < 0) return "";

        int ulStart = rawHtml.indexOf("<ul>", headingIdx);
        if (ulStart < 0) return "";
        int ulEnd = rawHtml.indexOf("</ul>", ulStart);
        if (ulEnd < 0) return "";

        String listHtml = rawHtml.substring(ulStart, ulEnd + "</ul>".length());
        var liMatcher = java.util.regex.Pattern.compile("(?is)<li>(.*?)</li>").matcher(listHtml);

        StringBuilder sb = new StringBuilder();
        while (liMatcher.find()) {
            String item = stripHtml(liMatcher.group(1));
            if (!item.isBlank()) sb.append("• ").append(item).append("\n");
        }
        return sb.toString().trim();
    }

    // exampleTestcases from GraphQL only carries raw inputs — the matching output for the
    // first example lives in the "Output:" line of the first <pre> block in `content`.
    private String extractFirstExampleOutput(String rawHtml) {
        if (rawHtml == null || rawHtml.isBlank()) return "";

        int preStart = rawHtml.indexOf("<pre>");
        if (preStart < 0) return "";
        int preEnd = rawHtml.indexOf("</pre>", preStart);
        if (preEnd < 0) return "";

        String preText = stripHtml(rawHtml.substring(preStart, preEnd + "</pre>".length()));

        int outIdx = indexOfIgnoreCase(preText, "Output:");
        if (outIdx < 0) return "";
        int afterOut = outIdx + "Output:".length();

        int explainIdx = indexOfIgnoreCase(preText.substring(afterOut), "Explanation:");
        String output = explainIdx >= 0
                ? preText.substring(afterOut, afterOut + explainIdx)
                : preText.substring(afterOut);

        return output.trim();
    }

    private int indexOfIgnoreCase(String haystack, String needle) {
        return haystack.toLowerCase().indexOf(needle.toLowerCase());
    }
}
