package com.cpmentor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableRetry   // ← enables @Retryable on LeetCodeFetchService
public class CpMentorApplication {
    public static void main(String[] args) {
        SpringApplication.run(CpMentorApplication.class, args);
    }
}
