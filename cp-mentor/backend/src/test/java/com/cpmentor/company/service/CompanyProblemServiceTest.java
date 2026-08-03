package com.cpmentor.company.service;

import com.cpmentor.company.dto.CompanyProblemDTO;
import com.cpmentor.company.entity.CompanyProblem;
import com.cpmentor.company.repository.CompanyProblemRepository;
import com.cpmentor.company.repository.UserProblemProgressRepository;
import com.cpmentor.method.entity.PatternProblem;
import com.cpmentor.method.repository.PatternProblemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyProblemServiceTest {

    @Mock private CompanyProblemRepository problemRepository;
    @Mock private UserProblemProgressRepository progressRepository;
    @Mock private PatternProblemRepository patternProblemRepository;

    private CompanyProblemService service;

    @BeforeEach
    void setUp() {
        service = new CompanyProblemService(problemRepository, progressRepository, patternProblemRepository);
    }

    @Test
    void patternSlug_resolvesLeetcodeIdsAndFiltersByThem() {
        Pageable pageable = PageRequest.of(0, 50);
        when(patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc("monotonic-stack"))
                .thenReturn(List.of(patternProblem("739"), patternProblem("42")));

        CompanyProblem match = CompanyProblem.builder()
                .id(1L).leetcodeId("739").title("Daily Temperatures").url("u")
                .difficulty("Medium").company("amazon").timeframe("all").build();
        when(problemRepository.findByCompanyAndTimeframeAndLeetcodeIdIn(
                eq("amazon"), eq("all"), eq(List.of("739", "42")), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(match)));

        Page<CompanyProblemDTO> result = service.getProblems(
                "amazon", "all", null, "monotonic-stack", null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getLeetcodeId()).isEqualTo("739");
    }

    @Test
    void patternSlug_withNoLinkedProblems_returnsEmptyPageWithoutQueryingCompanyData() {
        Pageable pageable = PageRequest.of(0, 50);
        when(patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc("trie"))
                .thenReturn(List.of());

        Page<CompanyProblemDTO> result = service.getProblems(
                "amazon", "all", null, "trie", null, pageable);

        assertThat(result.getContent()).isEmpty();
        verify(problemRepository, org.mockito.Mockito.never())
                .findByCompanyAndTimeframeAndLeetcodeIdIn(any(), any(), any(), any());
    }

    @Test
    void patternSlugAndDifficulty_combinesBothFilters() {
        Pageable pageable = PageRequest.of(0, 50);
        when(patternProblemRepository.findByPatternSlugOrderByOrderIndexAsc("two-pointer"))
                .thenReturn(List.of(patternProblem("15")));
        when(problemRepository.findByCompanyAndTimeframeAndDifficultyAndLeetcodeIdIn(
                eq("google"), eq("all"), eq("Medium"), eq(List.of("15")), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of()));

        service.getProblems("google", "all", "Medium", "two-pointer", null, pageable);

        verify(problemRepository).findByCompanyAndTimeframeAndDifficultyAndLeetcodeIdIn(
                "google", "all", "Medium", List.of("15"), pageable);
    }

    @Test
    void noPatternSlug_fallsBackToExistingCompanyTimeframeQuery() {
        Pageable pageable = PageRequest.of(0, 50);
        when(problemRepository.findByCompanyAndTimeframe(eq("amazon"), eq("all"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of()));

        service.getProblems("amazon", "all", null, null, null, pageable);

        verify(problemRepository).findByCompanyAndTimeframe("amazon", "all", pageable);
        verify(patternProblemRepository, org.mockito.Mockito.never())
                .findByPatternSlugOrderByOrderIndexAsc(any());
    }

    private PatternProblem patternProblem(String leetcodeId) {
        return PatternProblem.builder()
                .patternSlug("monotonic-stack").leetcodeId(leetcodeId).title("T").url("u")
                .role(PatternProblem.Role.CORE).orderIndex(1)
                .build();
    }
}
