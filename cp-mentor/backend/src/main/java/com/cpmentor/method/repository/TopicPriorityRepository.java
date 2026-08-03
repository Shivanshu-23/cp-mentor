package com.cpmentor.method.repository;

import com.cpmentor.method.entity.TopicPriority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicPriorityRepository extends JpaRepository<TopicPriority, Long> {
    List<TopicPriority> findAllByOrderByRankAsc();
    boolean existsByRank(int rank);
}
