package com.cpmentor.company.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_problems",
       uniqueConstraints = @UniqueConstraint(columnNames = {"leetcode_id", "company"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "leetcode_id", nullable = false)
    private String leetcodeId;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String title;

    private String difficulty;   // Easy / Medium / Hard

    private String company;      // amazon, google, microsoft ...

    private String timeframe;    // all, six-months, thirty-days

    private String acceptanceRate; // "63.9%"

    private String frequency;      // "50.0%"
}
