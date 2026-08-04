package com.cpmentor.worksheet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// A SQL record of every worksheet saved from /yodh, independent of whether
// the GitHub commit succeeded — see GitHubWorksheetService. `userEmail` is a
// plain string column (not a @ManyToOne User), matching the existing
// TriggerEntry convention in this codebase.
@Entity
@Table(name = "worksheets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Worksheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String problem;

    @Column(name = "lc_number")
    private String lcNumber;

    private String difficulty;

    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String markdown;

    @Column(name = "github_path")
    private String githubPath;

    @Column(name = "github_commit_url")
    private String githubCommitUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
