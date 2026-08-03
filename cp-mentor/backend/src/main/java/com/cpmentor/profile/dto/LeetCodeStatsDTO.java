package com.cpmentor.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeetCodeStatsDTO {
    private String username;
    private String profileUrl;
    private int totalSolved;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    private int streak;
    private int totalActiveDays;
    private int solvedToday;
    private List<DayCount> last7Days;
    private List<RecentSubmission> recentSubmissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayCount {
        private String date;
        private int count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSubmission {
        private String title;
        private String url;
        private long timestamp;
    }
}
