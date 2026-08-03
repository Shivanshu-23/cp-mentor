package com.cpmentor.profile.controller;

import com.cpmentor.auth.entity.User;
import com.cpmentor.auth.repository.UserRepository;
import com.cpmentor.profile.dto.LeetCodeStatsDTO;
import com.cpmentor.profile.service.LeetCodeProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leetcode-stats")
@RequiredArgsConstructor
public class LeetCodeProfileController {

    private final LeetCodeProfileService leetCodeProfileService;
    private final UserRepository userRepository;

    // Unchanged v1 shape — public, uses the app-wide LEETCODE_USERNAME default.
    // Kept for backward compatibility; never break v1 shapes.
    @GetMapping
    public LeetCodeStatsDTO getStats() {
        return leetCodeProfileService.fetchStats();
    }

    // v2 Phase G — the current user's own configured LeetCode username, falling
    // back to the app-wide default when they haven't set one.
    @GetMapping("/me")
    public ResponseEntity<LeetCodeStatsDTO> getMyStats(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();

        LeetCodeStatsDTO stats = (user.getLeetcodeUsername() != null && !user.getLeetcodeUsername().isBlank())
                ? leetCodeProfileService.fetchStats(user.getLeetcodeUsername())
                : leetCodeProfileService.fetchStats();
        return ResponseEntity.ok(stats);
    }

    // v2 Phase G — any public LeetCode profile, cached 10 min with
    // stale-on-error (see LeetCodeProfileService).
    @GetMapping("/{username}")
    public LeetCodeStatsDTO getStatsForUsername(@PathVariable String username) {
        return leetCodeProfileService.fetchStats(username);
    }
}
