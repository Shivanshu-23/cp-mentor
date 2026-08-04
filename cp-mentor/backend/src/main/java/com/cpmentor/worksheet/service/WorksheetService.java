package com.cpmentor.worksheet.service;

import com.cpmentor.worksheet.dto.WorksheetResponse;
import com.cpmentor.worksheet.dto.WorksheetSaveRequest;
import com.cpmentor.worksheet.dto.WorksheetSaveResponse;
import com.cpmentor.worksheet.entity.Worksheet;
import com.cpmentor.worksheet.repository.WorksheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

// Orchestrates the two things a worksheet save does: commit to GitHub
// (GitHubWorksheetService, which stays a pure API wrapper) and persist a SQL
// row (this class). The SQL row is written regardless of whether the GitHub
// commit succeeds — a worksheet a user filled in shouldn't be lost just
// because GITHUB_PAT isn't set or GitHub is briefly unreachable — but a
// failed GitHub commit still surfaces as an error to the caller so the
// frontend's existing Saving -> Synced/Failed status chip keeps working
// exactly as before this feature existed.
@Service
@RequiredArgsConstructor
public class WorksheetService {

    private final GitHubWorksheetService gitHubWorksheetService;
    private final WorksheetRepository worksheetRepository;

    public WorksheetSaveResponse save(String userEmail, WorksheetSaveRequest request) {
        String githubPath = null;
        String githubCommitUrl = null;
        ResponseStatusException githubError = null;

        try {
            var result = gitHubWorksheetService.save(request.getFileName(), request.getMarkdown());
            githubPath = result.path();
            githubCommitUrl = result.commitUrl();
        } catch (ResponseStatusException e) {
            githubError = e;
        }

        Worksheet worksheet = Worksheet.builder()
            .userEmail(userEmail)
            .problem(request.getProblem())
            .lcNumber(request.getLcNumber())
            .difficulty(request.getDifficulty())
            .markdown(request.getMarkdown())
            .githubPath(githubPath)
            .githubCommitUrl(githubCommitUrl)
            .createdAt(LocalDateTime.now())
            .build();
        worksheet = worksheetRepository.save(worksheet);

        if (githubError != null) {
            throw githubError;
        }
        return new WorksheetSaveResponse(worksheet.getId(), githubPath, githubCommitUrl);
    }

    public List<WorksheetResponse> listMine(String userEmail) {
        return worksheetRepository.findByUserEmailOrderByCreatedAtDesc(userEmail).stream()
            .map(WorksheetResponse::from)
            .toList();
    }

    public WorksheetResponse getOne(String userEmail, Long id) {
        Worksheet worksheet = worksheetRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Worksheet not found"));
        if (!worksheet.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Not your worksheet");
        }
        return WorksheetResponse.from(worksheet);
    }
}
