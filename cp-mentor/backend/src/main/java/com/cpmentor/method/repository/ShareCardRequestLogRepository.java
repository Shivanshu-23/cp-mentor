package com.cpmentor.method.repository;

import com.cpmentor.method.entity.ShareCardRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ShareCardRequestLogRepository extends JpaRepository<ShareCardRequestLog, Long> {
    long countByUserEmailAndRequestedAtAfter(String userEmail, LocalDateTime after);
}
