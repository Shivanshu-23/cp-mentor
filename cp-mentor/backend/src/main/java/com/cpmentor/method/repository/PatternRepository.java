package com.cpmentor.method.repository;

import com.cpmentor.method.entity.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatternRepository extends JpaRepository<Pattern, Long> {

    Optional<Pattern> findBySlug(String slug);

    Page<Pattern> findByCategory(Pattern.Category category, Pageable pageable);

    boolean existsBySlug(String slug);
}
