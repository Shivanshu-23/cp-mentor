package com.cpmentor.method.repository;

import com.cpmentor.method.entity.TriggerPhrase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TriggerPhraseRepository extends JpaRepository<TriggerPhrase, Long> {
    List<TriggerPhrase> findByPhraseContainingIgnoreCase(String query);
    boolean existsByPhrase(String phrase);
}
