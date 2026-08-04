package com.cpmentor.bookmark.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

// A bookmark on either a Pattern (itemKey = slug) or a company/pattern
// problem (itemKey = leetcodeId) — `title` is denormalized at save time so
// listing bookmarks never needs to join back into pattern_problems or
// company_problems (which don't share a single ID space anyway).
// `userEmail` is a plain string column, matching the existing TriggerEntry/
// Worksheet convention (not a @ManyToOne User).
@Entity
@Table(name = "bookmarks",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_email", "item_type", "item_key"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;

    @Column(name = "item_key", nullable = false)
    private String itemKey;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum ItemType {
        PATTERN, PROBLEM
    }
}
