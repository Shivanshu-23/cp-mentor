package com.cpmentor.method.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "topic_priorities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicPriority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mapped to `topic_rank`, not `rank` — RANK is a reserved word in MySQL 8
    // (window-function keyword since 8.0.2). Same class of gotcha as
    // TriggerEntry.trigger -> trigger_text.
    @Column(name = "topic_rank", nullable = false, unique = true)
    private int rank;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double estimatedHours;

    @Column(nullable = false)
    private int interviewFrequency; // 1-5

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "topic_priority_prerequisites", joinColumns = @JoinColumn(name = "topic_priority_id"))
    @Column(name = "prerequisite_topic")
    @Builder.Default
    private List<String> prerequisiteTopics = new ArrayList<>();
}
