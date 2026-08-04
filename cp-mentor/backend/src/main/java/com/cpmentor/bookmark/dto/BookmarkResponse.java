package com.cpmentor.bookmark.dto;

import com.cpmentor.bookmark.entity.Bookmark;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BookmarkResponse {
    private Long id;
    private Bookmark.ItemType itemType;
    private String itemKey;
    private String title;
    private String note;
    private LocalDateTime createdAt;

    public static BookmarkResponse from(Bookmark b) {
        return new BookmarkResponse(b.getId(), b.getItemType(), b.getItemKey(), b.getTitle(), b.getNote(), b.getCreatedAt());
    }
}
