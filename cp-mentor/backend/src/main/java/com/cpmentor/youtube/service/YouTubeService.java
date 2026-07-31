package com.cpmentor.youtube.service;

import com.cpmentor.youtube.dto.VideoDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * YouTubeService:
 *  - No YOUTUBE_API_KEY → returns curated mock videos (real URLs, real channels)
 *  - YOUTUBE_API_KEY set → searches YouTube Data API v3, filters to whitelisted
 *    educational channels, enriches with view count + duration
 *
 * In-memory cache per topic (TTL: session lifetime).
 * Upgrade to Redis cache in the next module.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class YouTubeService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${youtube.api-key:}")
    private String apiKey;

    @Value("${youtube.base-url:https://www.googleapis.com/youtube/v3}")
    private String baseUrl;

    // ── Whitelisted educational CP channels (lowercase for matching) ─────────
    private static final Set<String> WHITELISTED = Set.of(
        "neetcode", "take u forward", "striver",
        "abdul bari", "william fiset", "codehelp",
        "errichto", "tushar roy", "kevin naughton",
        "back to back swe", "codewithharry"
    );

    // Simple in-memory cache: topic → videos
    private final Map<String, List<VideoDTO>> cache = new ConcurrentHashMap<>();

    // ── Public API ────────────────────────────────────────────────────────────

    public List<VideoDTO> getVideosForTopic(String topic) {
        String key = topic.toLowerCase().trim();

        if (cache.containsKey(key)) {
            log.debug("YouTube cache hit for topic: {}", topic);
            return cache.get(key);
        }

        List<VideoDTO> videos;
        if (apiKey != null && !apiKey.isBlank()) {
            log.info("Fetching YouTube videos for topic '{}' via API", topic);
            try {
                videos = fetchFromYouTube(topic);
            } catch (Exception e) {
                log.warn("YouTube API failed ({}), falling back to mock", e.getMessage());
                videos = getMockVideos(topic);
            }
        } else {
            log.info("No YouTube API key — returning curated mock videos for: {}", topic);
            videos = getMockVideos(topic);
        }

        cache.put(key, videos);
        return videos;
    }

    // ── Real YouTube API ──────────────────────────────────────────────────────

    private List<VideoDTO> fetchFromYouTube(String topic) throws Exception {
        String query = URLEncoder.encode(topic + " DSA algorithm tutorial", StandardCharsets.UTF_8);
        String searchUrl = baseUrl + "/search?part=snippet&q=" + query
                + "&type=video&maxResults=20&relevanceLanguage=en&videoDuration=medium&key=" + apiKey;

        String searchJson = webClientBuilder.build()
                .get().uri(searchUrl)
                .retrieve().bodyToMono(String.class).block();

        JsonNode searchRoot = objectMapper.readTree(searchJson);
        JsonNode items = searchRoot.path("items");

        // Collect video IDs + basic info, filter to whitelisted channels
        List<Map<String, String>> candidates = new ArrayList<>();
        StreamSupport.stream(items.spliterator(), false)
                .filter(item -> {
                    String channel = item.path("snippet").path("channelTitle").asText("").toLowerCase();
                    return WHITELISTED.stream().anyMatch(channel::contains);
                })
                .limit(8)
                .forEach(item -> {
                    Map<String, String> v = new HashMap<>();
                    v.put("videoId",  item.path("id").path("videoId").asText());
                    v.put("title",    item.path("snippet").path("title").asText());
                    v.put("channel",  item.path("snippet").path("channelTitle").asText());
                    v.put("thumb",    item.path("snippet").path("thumbnails").path("high").path("url").asText());
                    v.put("published",item.path("snippet").path("publishedAt").asText());
                    candidates.add(v);
                });

        if (candidates.isEmpty()) return getMockVideos(topic);

        // Enrich with stats (views + duration)
        String ids = candidates.stream().map(v -> v.get("videoId")).collect(Collectors.joining(","));
        String statsUrl = baseUrl + "/videos?part=contentDetails,statistics&id=" + ids + "&key=" + apiKey;

        String statsJson = webClientBuilder.build()
                .get().uri(statsUrl)
                .retrieve().bodyToMono(String.class).block();

        JsonNode statsRoot = objectMapper.readTree(statsJson);
        Map<String, JsonNode> statsById = new HashMap<>();
        StreamSupport.stream(statsRoot.path("items").spliterator(), false)
                .forEach(item -> statsById.put(item.path("id").asText(), item));

        return candidates.stream().map(v -> {
            JsonNode stats = statsById.getOrDefault(v.get("videoId"), objectMapper.createObjectNode());
            String rawDuration = stats.path("contentDetails").path("duration").asText("PT0M0S");
            long views = stats.path("statistics").path("viewCount").asLong(0);

            return VideoDTO.builder()
                    .videoId(v.get("videoId"))
                    .title(v.get("title"))
                    .channelTitle(v.get("channel"))
                    .thumbnailUrl(v.get("thumb"))
                    .url("https://www.youtube.com/watch?v=" + v.get("videoId"))
                    .duration(parseDuration(rawDuration))
                    .viewCount(formatViews(views))
                    .publishedAt(v.get("published").substring(0, 10))
                    .topic(topic)
                    .whitelisted(true)
                    .build();
        }).collect(Collectors.toList());
    }

    // ── Mock data — real YouTube URLs from top CP educators ──────────────────

    private List<VideoDTO> getMockVideos(String topic) {
        String t = topic.toLowerCase();

        if (t.contains("hash") || t.contains("two sum") || t.contains("array")) {
            return List.of(
                video("dP1r4fk9d-8", "Two Sum - LeetCode #1 EXPLAINED",
                    "NeetCode", "18:42", "2.1M", "Hash Table", "https://i.ytimg.com/vi/dP1r4fk9d-8/hqdefault.jpg"),
                video("XKu_SEDAykw", "Two Sum | Brute → Better → Optimal",
                    "take U forward", "22:15", "1.4M", "Hash Table", "https://i.ytimg.com/vi/XKu_SEDAykw/hqdefault.jpg"),
                video("aotknb6G4Hg", "HashMap in Java | Complete Guide",
                    "CodeHelp - by Babbar", "45:30", "890K", "Hash Table", "https://i.ytimg.com/vi/aotknb6G4Hg/hqdefault.jpg")
            );
        }
        if (t.contains("sliding window")) {
            return List.of(
                video("MK-NZ4hYm50", "Sliding Window Technique | All Patterns",
                    "NeetCode", "25:10", "1.8M", "Sliding Window", "https://i.ytimg.com/vi/MK-NZ4hYm50/hqdefault.jpg"),
                video("0l2nePjDFqw", "Sliding Window | Master Template",
                    "take U forward", "38:00", "1.1M", "Sliding Window", "https://i.ytimg.com/vi/0l2nePjDFqw/hqdefault.jpg"),
                video("jCGzpMRoJXs", "Longest Substring Without Repeating Characters",
                    "Kevin Naughton Jr.", "14:22", "620K", "Sliding Window", "https://i.ytimg.com/vi/jCGzpMRoJXs/hqdefault.jpg")
            );
        }
        if (t.contains("dynamic programming") || t.contains("dp")) {
            return List.of(
                video("oBt53YbR9Kk", "Dynamic Programming — Learn to Solve Algorithmic Problems",
                    "freeCodeCamp.org", "5:21:00", "4.2M", "Dynamic Programming", "https://i.ytimg.com/vi/oBt53YbR9Kk/hqdefault.jpg"),
                video("tyB0ztf0DNY", "DP Series | All Patterns Covered",
                    "take U forward", "42:00", "2.3M", "Dynamic Programming", "https://i.ytimg.com/vi/tyB0ztf0DNY/hqdefault.jpg"),
                video("nqowUJzG-iM", "Dynamic Programming Fundamentals",
                    "Abdul Bari", "35:18", "1.9M", "Dynamic Programming", "https://i.ytimg.com/vi/nqowUJzG-iM/hqdefault.jpg"),
                video("wbX7DrzMruk", "Fibonacci Memoization & Tabulation",
                    "NeetCode", "21:44", "1.2M", "Dynamic Programming", "https://i.ytimg.com/vi/wbX7DrzMruk/hqdefault.jpg")
            );
        }
        if (t.contains("binary search")) {
            return List.of(
                video("s4DPM8ct1pI", "Binary Search — Complete Guide",
                    "NeetCode", "22:30", "1.5M", "Binary Search", "https://i.ytimg.com/vi/s4DPM8ct1pI/hqdefault.jpg"),
                video("GU7DpgHINWQ", "Binary Search Template | All Patterns",
                    "take U forward", "30:14", "980K", "Binary Search", "https://i.ytimg.com/vi/GU7DpgHINWQ/hqdefault.jpg"),
                video("j5uXyPJ0Pew", "Binary Search Algorithm",
                    "Abdul Bari", "28:00", "2.1M", "Binary Search", "https://i.ytimg.com/vi/j5uXyPJ0Pew/hqdefault.jpg")
            );
        }
        if (t.contains("graph") || t.contains("bfs") || t.contains("dfs")) {
            return List.of(
                video("tWVWeAqZ0WU", "Graph Algorithms for Technical Interviews",
                    "freeCodeCamp.org", "2:16:00", "2.8M", "Graphs", "https://i.ytimg.com/vi/tWVWeAqZ0WU/hqdefault.jpg"),
                video("pcKY4hjDrxk", "Graph BFS & DFS | All Patterns",
                    "take U forward", "55:00", "1.3M", "Graphs", "https://i.ytimg.com/vi/pcKY4hjDrxk/hqdefault.jpg"),
                video("EgI5nU9etnU", "Graph Theory Algorithms",
                    "William Fiset", "48:22", "1.7M", "Graphs", "https://i.ytimg.com/vi/EgI5nU9etnU/hqdefault.jpg")
            );
        }
        if (t.contains("tree") || t.contains("bst")) {
            return List.of(
                video("fAAZixBzIAI", "Binary Trees for Technical Interviews",
                    "freeCodeCamp.org", "1:48:00", "2.4M", "Trees", "https://i.ytimg.com/vi/fAAZixBzIAI/hqdefault.jpg"),
                video("BHB0B1jFKQc", "Binary Search Tree | Complete Series",
                    "take U forward", "44:00", "1.1M", "Trees", "https://i.ytimg.com/vi/BHB0B1jFKQc/hqdefault.jpg"),
                video("0m_JDAdRFhM", "Tree Data Structure | All Traversals",
                    "Abdul Bari", "38:15", "1.6M", "Trees", "https://i.ytimg.com/vi/0m_JDAdRFhM/hqdefault.jpg")
            );
        }
        if (t.contains("two pointer") || t.contains("stock")) {
            return List.of(
                video("On03HWe2tZM", "Two Pointer Technique | Complete Guide",
                    "NeetCode", "20:15", "1.1M", "Two Pointers", "https://i.ytimg.com/vi/On03HWe2tZM/hqdefault.jpg"),
                video("D0XqC_JchF4", "Best Time to Buy and Sell Stock",
                    "NeetCode", "14:30", "890K", "Arrays/DP", "https://i.ytimg.com/vi/D0XqC_JchF4/hqdefault.jpg")
            );
        }

        // Default: general DSA / competitive programming
        return List.of(
            video("pkYVOmU3MgA", "Data Structures Easy to Advanced — Full Tutorial",
                "freeCodeCamp.org", "8:01:00", "5.4M", "General DSA", "https://i.ytimg.com/vi/pkYVOmU3MgA/hqdefault.jpg"),
            video("RBSGKlAvoiM", "Data Structures — CS50",
                "CS50", "2:28:00", "3.1M", "General DSA", "https://i.ytimg.com/vi/RBSGKlAvoiM/hqdefault.jpg"),
            video("BBpAmxU_NQo", "Top DSA Sheet Problems | NeetCode 150",
                "NeetCode", "32:00", "1.8M", "General DSA", "https://i.ytimg.com/vi/BBpAmxU_NQo/hqdefault.jpg")
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private VideoDTO video(String id, String title, String channel,
                           String duration, String views, String topic, String thumb) {
        return VideoDTO.builder()
                .videoId(id)
                .title(title)
                .channelTitle(channel)
                .thumbnailUrl(thumb)
                .url("https://www.youtube.com/watch?v=" + id)
                .duration(duration)
                .viewCount(views)
                .publishedAt("")
                .topic(topic)
                .whitelisted(true)
                .build();
    }

    /** Convert ISO 8601 duration (PT18M42S) → "18:42" */
    private String parseDuration(String iso) {
        try {
            iso = iso.replace("PT", "");
            int hours = 0, minutes = 0, seconds = 0;
            if (iso.contains("H")) {
                hours = Integer.parseInt(iso.substring(0, iso.indexOf('H')));
                iso = iso.substring(iso.indexOf('H') + 1);
            }
            if (iso.contains("M")) {
                minutes = Integer.parseInt(iso.substring(0, iso.indexOf('M')));
                iso = iso.substring(iso.indexOf('M') + 1);
            }
            if (iso.contains("S")) {
                seconds = Integer.parseInt(iso.substring(0, iso.indexOf('S')));
            }
            if (hours > 0) return String.format("%d:%02d:%02d", hours, minutes, seconds);
            return String.format("%d:%02d", minutes, seconds);
        } catch (Exception e) {
            return "—";
        }
    }

    /** Format view count: 1234567 → "1.2M" */
    private String formatViews(long views) {
        if (views >= 1_000_000) return String.format("%.1fM", views / 1_000_000.0);
        if (views >= 1_000)     return String.format("%.0fK", views / 1_000.0);
        return String.valueOf(views);
    }
}
