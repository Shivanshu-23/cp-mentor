package com.cpmentor.profile.controller;

import com.cpmentor.profile.dto.LeetCodeStatsDTO;
import com.cpmentor.profile.service.LeetCodeProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leetcode-stats")
@RequiredArgsConstructor
public class LeetCodeProfileController {

    private final LeetCodeProfileService leetCodeProfileService;

    @GetMapping
    public LeetCodeStatsDTO getStats() {
        return leetCodeProfileService.fetchStats();
    }
}
