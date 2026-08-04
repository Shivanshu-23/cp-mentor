package com.cpmentor.worksheet.dto;

import com.cpmentor.worksheet.entity.Worksheet;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WorksheetResponse {
    private Long id;
    private String problem;
    private String lcNumber;
    private String difficulty;
    private String markdown;
    private String githubPath;
    private String githubCommitUrl;
    private LocalDateTime createdAt;

    public static WorksheetResponse from(Worksheet w) {
        return new WorksheetResponse(
            w.getId(), w.getProblem(), w.getLcNumber(), w.getDifficulty(),
            w.getMarkdown(), w.getGithubPath(), w.getGithubCommitUrl(), w.getCreatedAt()
        );
    }
}
