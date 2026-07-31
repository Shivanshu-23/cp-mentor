package com.cpmentor.youtube.controller;

import com.cpmentor.youtube.dto.VideoDTO;
import com.cpmentor.youtube.service.YouTubeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
@Tag(name = "Videos", description = "YouTube tutorial recommendations by topic")
public class VideoController {

    private final YouTubeService youTubeService;

    /**
     * GET /api/v1/videos?topic=dynamic+programming
     * Returns curated YouTube tutorials for the given topic.
     * No auth required — public endpoint.
     */
    @GetMapping
    @Operation(summary = "Get YouTube tutorials for a topic",
               description = "Returns up to 8 curated videos from whitelisted educational channels. " +
                             "Works in mock mode without a YouTube API key.")
    public ResponseEntity<List<VideoDTO>> getVideos(
            @RequestParam(defaultValue = "data structures algorithms") String topic) {
        return ResponseEntity.ok(youTubeService.getVideosForTopic(topic));
    }
}
