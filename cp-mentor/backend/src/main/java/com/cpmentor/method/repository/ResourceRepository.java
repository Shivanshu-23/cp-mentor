package com.cpmentor.method.repository;

import com.cpmentor.method.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByPatternSlug(String patternSlug);

    List<Resource> findByPatternSlugIsNull();

    boolean existsByTitleAndUrl(String title, String url);
}
