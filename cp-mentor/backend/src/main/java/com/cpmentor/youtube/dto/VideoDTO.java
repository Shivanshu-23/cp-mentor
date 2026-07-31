package com.cpmentor.youtube.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoDTO {
    private String videoId;
    private String title;
    private String channelTitle;
    private String thumbnailUrl;
    private String url;
    private String duration;      // e.g. "18:42"
    private String viewCount;     // e.g. "1.2M"
    private String publishedAt;
    private String topic;
    private boolean whitelisted;  // from curated educational channel
}
