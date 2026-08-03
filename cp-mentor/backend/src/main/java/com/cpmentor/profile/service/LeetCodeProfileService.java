package com.cpmentor.profile.service;

import com.cpmentor.profile.dto.LeetCodeStatsDTO;
import com.cpmentor.profile.dto.LeetCodeStatsDTO.DayCount;
import com.cpmentor.profile.dto.LeetCodeStatsDTO.RecentSubmission;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Reads LeetCode's public GraphQL API (same one leetcode.com/u/<username> itself calls) —
// no API key, no auth, works for any public profile. Mirrors the HttpURLConnection style
// already used by LeetCodeFetchService for the daily-challenge fetch.
@Service
@RequiredArgsConstructor
@Slf4j
public class LeetCodeProfileService {

    private final ObjectMapper objectMapper;

    @Value("${leetcode.username}")
    private String defaultUsername;

    private static final String GRAPHQL_URL = "https://leetcode.com/graphql";
    private static final long CACHE_TTL_MILLIS = 10 * 60 * 1000; // 10 min, per v2 Phase G

    // Simple in-memory TTL cache with stale-on-error, keyed by username. Deliberately not a
    // library (Caffeine/Redis) — one small cache for one low-volume endpoint doesn't justify
    // a new dependency, consistent with the project's free-hosting/minimal-deps constraint.
    // Not distributed — fine for a single Render instance; would need rethinking behind a
    // multi-instance deploy.
    private final Map<String, CachedEntry> cache = new ConcurrentHashMap<>();

    private record CachedEntry(LeetCodeStatsDTO stats, long fetchedAtMillis) {}

    private static final String QUERY_TEMPLATE = """
        {"query":"query userProfile($username: String!) { \
        matchedUser(username: $username) { \
        username \
        submitStatsGlobal { acSubmissionNum { difficulty count } } \
        userCalendar { streak totalActiveDays submissionCalendar } \
        } \
        recentAcSubmissionList(username: $username, limit: 10) { title titleSlug timestamp } \
        }","variables":{"username":"%s"}}""";

    public LeetCodeStatsDTO fetchStats() {
        return fetchStats(defaultUsername);
    }

    public LeetCodeStatsDTO fetchStats(String username) {
        CachedEntry cached = cache.get(username);
        if (cached != null && System.currentTimeMillis() - cached.fetchedAtMillis() < CACHE_TTL_MILLIS) {
            return cached.stats();
        }

        try {
            LeetCodeStatsDTO fresh = fetchFromLeetCode(username);
            cache.put(username, new CachedEntry(fresh, System.currentTimeMillis()));
            return fresh;
        } catch (Exception e) {
            log.warn("LeetCode profile fetch failed for {}: {}", username, e.getMessage());
            if (cached != null) {
                log.info("Serving stale cached stats for {} (fetched {}ms ago)", username,
                        System.currentTimeMillis() - cached.fetchedAtMillis());
                return cached.stats();
            }
            return LeetCodeStatsDTO.builder()
                    .username(username)
                    .profileUrl("https://leetcode.com/u/" + username + "/")
                    .last7Days(List.of())
                    .recentSubmissions(List.of())
                    .build();
        }
    }

    private LeetCodeStatsDTO fetchFromLeetCode(String username) throws Exception {
        String body = QUERY_TEMPLATE.formatted(username);

        URL url = new URL(GRAPHQL_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
        conn.setRequestProperty("Referer", "https://leetcode.com/" + username + "/");
        conn.setRequestProperty("Origin", "https://leetcode.com");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(15000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = conn.getResponseCode();
        InputStream is = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String responseJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (responseCode != 200) {
            throw new RuntimeException("HTTP " + responseCode + ": " + responseJson);
        }

        return parse(responseJson, username);
    }

    private LeetCodeStatsDTO parse(String json, String username) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        if (root.has("errors")) {
            throw new RuntimeException("GraphQL error: " + root.path("errors"));
        }

        JsonNode matchedUser = root.path("data").path("matchedUser");
        if (matchedUser.isMissingNode() || matchedUser.isNull()) {
            throw new RuntimeException("matchedUser not found for " + username);
        }

        int easy = 0, medium = 0, hard = 0, total = 0;
        for (JsonNode entry : matchedUser.path("submitStatsGlobal").path("acSubmissionNum")) {
            String difficulty = entry.path("difficulty").asText("");
            int count = entry.path("count").asInt(0);
            switch (difficulty) {
                case "Easy" -> easy = count;
                case "Medium" -> medium = count;
                case "Hard" -> hard = count;
                case "All" -> total = count;
                default -> { }
            }
        }

        JsonNode calendarNode = matchedUser.path("userCalendar");
        int streak = calendarNode.path("streak").asInt(0);
        int totalActiveDays = calendarNode.path("totalActiveDays").asInt(0);

        Map<LocalDate, Integer> calendar = parseSubmissionCalendar(calendarNode.path("submissionCalendar").asText(""));

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
        List<DayCount> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            last7Days.add(DayCount.builder()
                    .date(day.format(fmt))
                    .count(calendar.getOrDefault(day, 0))
                    .build());
        }
        int solvedToday = calendar.getOrDefault(today, 0);

        List<RecentSubmission> recent = new ArrayList<>();
        for (JsonNode sub : root.path("data").path("recentAcSubmissionList")) {
            String title = sub.path("title").asText();
            String slug = sub.path("titleSlug").asText();
            long timestamp = sub.path("timestamp").asLong(0) * 1000L;
            recent.add(RecentSubmission.builder()
                    .title(title)
                    .url("https://leetcode.com/problems/" + slug + "/")
                    .timestamp(timestamp)
                    .build());
        }

        return LeetCodeStatsDTO.builder()
                .username(username)
                .profileUrl("https://leetcode.com/u/" + username + "/")
                .totalSolved(total)
                .easySolved(easy)
                .mediumSolved(medium)
                .hardSolved(hard)
                .streak(streak)
                .totalActiveDays(totalActiveDays)
                .solvedToday(solvedToday)
                .last7Days(last7Days)
                .recentSubmissions(recent)
                .build();
    }

    // submissionCalendar is a stringified JSON object: {"<unixDaySeconds>": count, ...}
    private Map<LocalDate, Integer> parseSubmissionCalendar(String calendarJson) throws Exception {
        Map<LocalDate, Integer> result = new java.util.HashMap<>();
        if (calendarJson == null || calendarJson.isBlank()) return result;

        JsonNode node = objectMapper.readTree(calendarJson);
        Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            long epochSeconds = Long.parseLong(entry.getKey());
            LocalDate date = Instant.ofEpochSecond(epochSeconds).atZone(ZoneOffset.UTC).toLocalDate();
            result.merge(date, entry.getValue().asInt(0), Integer::sum);
        }
        return result;
    }
}
