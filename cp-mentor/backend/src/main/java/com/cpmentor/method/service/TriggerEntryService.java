package com.cpmentor.method.service;

import com.cpmentor.method.dto.TriggerEntryCreateRequest;
import com.cpmentor.method.dto.TriggerEntryResponse;
import com.cpmentor.method.dto.TriggerReviewRequest;
import com.cpmentor.method.entity.TriggerEntry;
import com.cpmentor.method.repository.TriggerEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spaced-repetition scheduling: stage 0 -> +2 days, stage 1 -> +7 days, stage 2 -> +21 days,
 * stage 3 -> retired (no further review). PASS advances the stage; FAIL resets to stage 0.
 */
@Service
@RequiredArgsConstructor
public class TriggerEntryService {

    private final TriggerEntryRepository repository;

    private static final int[] STAGE_INTERVAL_DAYS = {2, 7, 21}; // index = stage, applies to stages 0-2
    private static final int RETIRED_STAGE = 3;
    private static final int SKIP_DEFER_DAYS = 1;

    @Transactional
    public TriggerEntryResponse create(String userEmail, TriggerEntryCreateRequest request) {
        TriggerEntry entry = TriggerEntry.builder()
                .userEmail(userEmail)
                .leetcodeId(request.getLeetcodeId())
                .title(request.getTitle())
                .trigger(request.getTrigger())
                .missedObservation(request.getMissedObservation())
                .patternSlug(request.getPatternSlug())
                .reuseIn(request.getReuseIn())
                .createdAt(LocalDateTime.now())
                .reviewStage(0)
                .nextReviewAt(LocalDateTime.now().plusDays(STAGE_INTERVAL_DAYS[0]))
                .build();
        return toDTO(repository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<TriggerEntryResponse> due(String userEmail) {
        return repository.findDue(userEmail, LocalDateTime.now()).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TriggerEntryResponse> listAll(String userEmail) {
        return repository.findByUserEmail(userEmail).stream().map(this::toDTO).toList();
    }

    @Transactional
    public TriggerEntryResponse review(String userEmail, Long id, TriggerReviewRequest request) {
        TriggerEntry entry = repository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trigger entry not found: " + id));

        LocalDateTime now = LocalDateTime.now();
        entry.setLastReviewResult(request.getResult());
        entry.setLastReviewedAt(now);

        switch (request.getResult()) {
            case PASS -> {
                int newStage = Math.min(entry.getReviewStage() + 1, RETIRED_STAGE);
                entry.setReviewStage(newStage);
                entry.setNextReviewAt(newStage == RETIRED_STAGE
                        ? now.plusYears(100) // retired — effectively never due again
                        : now.plusDays(STAGE_INTERVAL_DAYS[newStage]));
            }
            case FAIL -> {
                entry.setReviewStage(0);
                entry.setNextReviewAt(now.plusDays(STAGE_INTERVAL_DAYS[0]));
            }
            case SKIPPED -> entry.setNextReviewAt(now.plusDays(SKIP_DEFER_DAYS)); // stage unchanged
        }

        return toDTO(repository.save(entry));
    }

    private TriggerEntryResponse toDTO(TriggerEntry e) {
        return TriggerEntryResponse.builder()
                .id(e.getId())
                .leetcodeId(e.getLeetcodeId())
                .title(e.getTitle())
                .trigger(e.getTrigger())
                .missedObservation(e.getMissedObservation())
                .patternSlug(e.getPatternSlug())
                .reuseIn(e.getReuseIn())
                .createdAt(e.getCreatedAt())
                .reviewStage(e.getReviewStage())
                .nextReviewAt(e.getNextReviewAt())
                .lastReviewResult(e.getLastReviewResult())
                .lastReviewedAt(e.getLastReviewedAt())
                .build();
    }
}
