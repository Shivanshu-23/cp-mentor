package com.cpmentor.bookmark.dto;

import com.cpmentor.bookmark.entity.Bookmark;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookmarkCreateRequest {

    @NotNull
    private Bookmark.ItemType itemType;

    @NotBlank
    private String itemKey;

    @NotBlank
    private String title;

    private String note;
}
