package com.cpmentor.worksheet.service;

import com.cpmentor.worksheet.dto.WorksheetSaveResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

// Commits a rendered worksheet markdown file to a GitHub repo via the REST
// Contents API, using a single fine-grained personal access token (not an
// OAuth App) — deliberate choice for a solo-user app, see CLAUDE.md's Yodh
// worksheet section. HttpURLConnection matches the project's existing
// convention for external HTTP calls (LeetCodeFetchService,
// LeetCodeProfileService) rather than introducing WebClient.
@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubWorksheetService {

    private final ObjectMapper objectMapper;

    @Value("${github.worksheet.pat:}")
    private String pat;

    @Value("${github.worksheet.repo:}")
    private String repo; // "owner/repo"

    @Value("${github.worksheet.branch:master}")
    private String branch;

    private static final DateTimeFormatter YEAR = DateTimeFormatter.ofPattern("yyyy");
    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("MM");

    public WorksheetSaveResponse save(String fileName, String markdown) {
        if (pat.isBlank() || repo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "GitHub sync isn't configured on the backend yet — set GITHUB_PAT and GITHUB_WORKSHEET_REPO.");
        }

        LocalDate today = LocalDate.now();
        String path = "worksheets/" + today.format(YEAR) + "/" + today.format(MONTH) + "/" + fileName + ".md";

        try {
            String existingSha = fetchExistingSha(path);
            return putFile(path, markdown, existingSha);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("GitHub worksheet save failed for {}: {}", path, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub sync failed: " + e.getMessage());
        }
    }

    private String fetchExistingSha(String path) throws IOException {
        URL url = new URL("https://api.github.com/repos/" + repo + "/contents/" + path + "?ref=" + branch);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        applyCommonHeaders(conn);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(15000);

        int status = conn.getResponseCode();
        if (status == 404) {
            return null; // file doesn't exist yet — create, not update
        }
        if (status != 200) {
            throw new IOException("Unexpected status checking existing file: HTTP " + status);
        }

        try (InputStream is = conn.getInputStream()) {
            JsonNode node = objectMapper.readTree(is);
            return node.path("sha").asText(null);
        }
    }

    private WorksheetSaveResponse putFile(String path, String markdown, String existingSha) throws IOException {
        URL url = new URL("https://api.github.com/repos/" + repo + "/contents/" + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("PUT");
        applyCommonHeaders(conn);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(15000);

        String encodedContent = Base64.getEncoder().encodeToString(markdown.getBytes(StandardCharsets.UTF_8));
        String commitMessage = (existingSha == null ? "Add worksheet: " : "Update worksheet: ") + path;

        var body = objectMapper.createObjectNode();
        body.put("message", commitMessage);
        body.put("content", encodedContent);
        body.put("branch", branch);
        if (existingSha != null) {
            body.put("sha", existingSha);
        }

        try (OutputStream os = conn.getOutputStream()) {
            os.write(objectMapper.writeValueAsBytes(body));
        }

        int status = conn.getResponseCode();
        InputStream is = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String responseJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (status != 200 && status != 201) {
            throw new IOException("GitHub commit failed: HTTP " + status + " — " + responseJson);
        }

        JsonNode root = objectMapper.readTree(responseJson);
        String commitUrl = root.path("commit").path("html_url").asText("");
        return new WorksheetSaveResponse(path, commitUrl);
    }

    private void applyCommonHeaders(HttpURLConnection conn) {
        conn.setRequestProperty("Authorization", "Bearer " + pat);
        conn.setRequestProperty("Accept", "application/vnd.github+json");
        conn.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
        conn.setRequestProperty("User-Agent", "drona-worksheet-sync");
    }
}
