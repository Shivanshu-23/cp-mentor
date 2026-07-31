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
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ProblemRepository problemRepository;
    private final ObjectMapper objectMapper;

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

        log.info("No working AI — returning mock for: {}", problem.getTitle());
        return buildMockAnalysis(problem);
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
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(60000);

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

    // ── Mock ──────────────────────────────────────────────────────────────────

    private AIAnalysisDTO buildMockAnalysis(Problem problem) {
        return AIAnalysisDTO.builder()
            .problemId(problem.getId()).problemTitle(problem.getTitle())
            .problemSummary("All Gemini models quota exhausted for today.")
            .recognizedPattern("Quota resets at 12:30 AM IST. Try again tonight or create a new API key in a new project.")
            .requiredDataStructures(List.of("Quota reset pending"))
            .requiredAlgorithms(List.of("Quota reset pending"))
            .easyExplanation("Your Gemini API key is valid but daily quota is exhausted.\n\nFix: Go to https://aistudio.google.com/app/apikey → Create API key in NEW project → fresh quota immediately.")
            .interviewTips("Quota resets at midnight US Pacific Time = 12:30 AM IST.")
            .revisionNotes("Key works. Just quota exhausted.")
            .modelUsed("mock-v1 (quota exhausted — tried gemini-1.5-flash, gemini-1.5-flash-8b, gemini-2.0-flash)")
            .fromCache(false).build();
    }
}
