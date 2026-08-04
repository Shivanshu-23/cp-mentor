package com.cpmentor.bookmark.repository;

import com.cpmentor.bookmark.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    Optional<Bookmark> findByUserEmailAndItemTypeAndItemKey(String userEmail, Bookmark.ItemType itemType, String itemKey);
}
