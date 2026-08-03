package com.cpmentor.method.service;

import com.cpmentor.method.dto.SolveSessionCompleteRequest;
import com.cpmentor.method.dto.SolveSessionCreateRequest;
import com.cpmentor.method.dto.SolveSessionResponse;
import com.cpmentor.method.dto.SolveSessionUpdateRequest;
import com.cpmentor.method.entity.SolveSession;
import com.cpmentor.method.repository.SolveSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SolveSessionService {

    private final SolveSessionRepository repository;

    @Transactional
    public SolveSessionResponse create(String userEmail, SolveSessionCreateRequest request) {
        SolveSession session = SolveSession.builder()
                .userEmail(userEmail)
                .leetcodeId(request.getLeetcodeId())
                .title(request.getTitle())
                .difficulty(request.getDifficulty())
                .startedAt(LocalDateTime.now())
                .build();
        return toDTO(repository.save(session));
    }

    @Transactional
    public SolveSessionResponse update(String userEmail, Long id, SolveSessionUpdateRequest request) {
        SolveSession session = findOwned(userEmail, id);

        if (request.getPatternSlug() != null) session.setPatternSlug(request.getPatternSlug());
        if (request.getSubmissionCount() != null) session.setSubmissionCount(request.getSubmissionCount());
        if (request.getSolvedUnaided() != null) session.setSolvedUnaided(request.getSolvedUnaided());
        if (request.getHighestHintLevel() != null) session.setHighestHintLevel(request.getHighestHintLevel());
        if (request.getStuckRung() != null) session.setStuckRung(request.getStuckRung());
        if (request.getConstraintNotes() != null) session.setConstraintNotes(request.getConstraintNotes());
        if (request.getTargetComplexity() != null) session.setTargetComplexity(request.getTargetComplexity());
        if (request.getRestatement() != null) session.setRestatement(request.getRestatement());
        if (request.getBruteForceIdea() != null) session.setBruteForceIdea(request.getBruteForceIdea());
        if (request.getBruteForceComplexity() != null) session.setBruteForceComplexity(request.getBruteForceComplexity());
        if (request.getHandSolveNotes() != null) session.setHandSolveNotes(request.getHandSolveNotes());
        if (request.getBottleneckStatement() != null) session.setBottleneckStatement(request.getBottleneckStatement());
        if (request.getMovesFired() != null) session.setMovesFired(request.getMovesFired());
        if (request.getFinalApproach() != null) session.setFinalApproach(request.getFinalApproach());
        if (request.getFinalComplexity() != null) session.setFinalComplexity(request.getFinalComplexity());
        if (request.getEdgeCasesChecked() != null) session.setEdgeCasesChecked(request.getEdgeCasesChecked());
        if (request.getCodeSnapshot() != null) session.setCodeSnapshot(request.getCodeSnapshot());

        return toDTO(repository.save(session));
    }

    @Transactional
    public SolveSessionResponse complete(String userEmail, Long id, SolveSessionCompleteRequest request) {
        SolveSession session = findOwned(userEmail, id);

        if (request != null) {
            if (request.getSolvedUnaided() != null) session.setSolvedUnaided(request.getSolvedUnaided());
            if (request.getStuckRung() != null) session.setStuckRung(request.getStuckRung());
        }

        LocalDateTime now = LocalDateTime.now();
        session.setEndedAt(now);
        session.setDurationSeconds((int) Duration.between(session.getStartedAt(), now).getSeconds());

        return toDTO(repository.save(session));
    }

    @Transactional(readOnly = true)
    public SolveSessionResponse getById(String userEmail, Long id) {
        return toDTO(findOwned(userEmail, id));
    }

    @Transactional(readOnly = true)
    public Page<SolveSessionResponse> list(String userEmail, String difficulty, Boolean solvedUnaided, Pageable pageable) {
        Page<SolveSession> page;
        if (difficulty != null && !difficulty.isBlank()) {
            page = repository.findByUserEmailAndDifficulty(userEmail, difficulty, pageable);
        } else if (solvedUnaided != null) {
            page = repository.findByUserEmailAndSolvedUnaided(userEmail, solvedUnaided, pageable);
        } else {
            page = repository.findByUserEmail(userEmail, pageable);
        }
        return page.map(this::toDTO);
    }

    private SolveSession findOwned(String userEmail, Long id) {
        return repository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solve session not found: " + id));
    }

    private SolveSessionResponse toDTO(SolveSession s) {
        return SolveSessionResponse.builder()
                .id(s.getId())
                .leetcodeId(s.getLeetcodeId())
                .title(s.getTitle())
                .difficulty(s.getDifficulty())
                .patternSlug(s.getPatternSlug())
                .startedAt(s.getStartedAt())
                .endedAt(s.getEndedAt())
                .durationSeconds(s.getDurationSeconds())
                .submissionCount(s.getSubmissionCount())
                .solvedUnaided(s.isSolvedUnaided())
                .highestHintLevel(s.getHighestHintLevel())
                .stuckRung(s.getStuckRung())
                .constraintNotes(s.getConstraintNotes())
                .targetComplexity(s.getTargetComplexity())
                .restatement(s.getRestatement())
                .bruteForceIdea(s.getBruteForceIdea())
                .bruteForceComplexity(s.getBruteForceComplexity())
                .handSolveNotes(s.getHandSolveNotes())
                .bottleneckStatement(s.getBottleneckStatement())
                .movesFired(s.getMovesFired())
                .finalApproach(s.getFinalApproach())
                .finalComplexity(s.getFinalComplexity())
                .edgeCasesChecked(s.getEdgeCasesChecked())
                .codeSnapshot(s.getCodeSnapshot())
                .build();
    }
}
