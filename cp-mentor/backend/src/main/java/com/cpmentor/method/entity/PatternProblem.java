package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "pattern_problems",
       uniqueConstraints = @UniqueConstraint(columnNames = {"pattern_slug", "leetcode_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pattern_slug", nullable = false)
    private String patternSlug;

    @Column(name = "leetcode_id", nullable = false)
    private String leetcodeId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String url;

    private String difficulty; // Easy / Medium / Hard

    private String striverStep; // nullable — reference into Striver's A2Z sheet, if applicable

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false)
    private Role role;

    @Column(name = "order_index", nullable = false)
    private int orderIndex; // defines learning order — intro first, hard variants last

    public enum Role {
        INTRO, CORE, VARIANT, HARD
    }
}
