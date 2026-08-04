package com.cpmentor.mockinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RandomProblemResponse {
    private String leetcodeId;
    private String title;
    private String url;
    private String difficulty;
}
