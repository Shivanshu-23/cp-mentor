package com.cpmentor.method.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PracticeQueueItemResponse {
    private String patternSlug;
    private String patternName;
    private String leetcodeId;
    private String title;
    private String url;
    private String difficulty;
}
