package com.cpmentor.problem.dto;

import com.cpmentor.problem.entity.Problem.Difficulty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProblemDTO {
    private Long id;
    private String leetcodeId;
    private String title;
    private String slug;
    private Difficulty difficulty;
    private String description;
    private String constraints;
    private List<String> topics;
    private String exampleInput;
    private String exampleOutput;
    private String leetcodeUrl;
    private LocalDateTime fetchedAt;
}
