package com.cpmentor.company.repository;

import com.cpmentor.company.entity.UserProblemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProblemProgressRepository extends JpaRepository<UserProblemProgress, Long> {

    Optional<UserProblemProgress> findByUserEmailAndLeetcodeId(String userEmail, String leetcodeId);

    List<UserProblemProgress> findByUserEmailAndLeetcodeIdIn(String userEmail, List<String> leetcodeIds);

    long countByUserEmailAndTickCount(String userEmail, int tickCount);
}
