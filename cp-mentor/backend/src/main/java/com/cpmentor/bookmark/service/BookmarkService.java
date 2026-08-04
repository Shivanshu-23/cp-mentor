package com.cpmentor.bookmark.service;

import com.cpmentor.bookmark.dto.BookmarkCreateRequest;
import com.cpmentor.bookmark.dto.BookmarkResponse;
import com.cpmentor.bookmark.entity.Bookmark;
import com.cpmentor.bookmark.repository.BookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;

    @Transactional(readOnly = true)
    public List<BookmarkResponse> listMine(String userEmail) {
        return bookmarkRepository.findByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(BookmarkResponse::from)
                .toList();
    }

    @Transactional
    public BookmarkResponse create(String userEmail, BookmarkCreateRequest request) {
        // Idempotent: bookmarking an already-bookmarked item just returns the
        // existing row rather than erroring on the unique constraint — the
        // frontend's toggle button shouldn't have to know whether it's the
        // first click or a retry after a dropped response.
        return bookmarkRepository.findByUserEmailAndItemTypeAndItemKey(userEmail, request.getItemType(), request.getItemKey())
                .map(BookmarkResponse::from)
                .orElseGet(() -> {
                    Bookmark saved = bookmarkRepository.save(Bookmark.builder()
                            .userEmail(userEmail)
                            .itemType(request.getItemType())
                            .itemKey(request.getItemKey())
                            .title(request.getTitle())
                            .note(request.getNote())
                            .createdAt(LocalDateTime.now())
                            .build());
                    return BookmarkResponse.from(saved);
                });
    }

    @Transactional
    public void delete(String userEmail, Long id) {
        Bookmark bookmark = bookmarkRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bookmark not found"));
        if (!bookmark.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your bookmark");
        }
        bookmarkRepository.delete(bookmark);
    }

    @Transactional
    public BookmarkResponse updateNote(String userEmail, Long id, String note) {
        Bookmark bookmark = bookmarkRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bookmark not found"));
        if (!bookmark.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your bookmark");
        }
        bookmark.setNote(note);
        return BookmarkResponse.from(bookmarkRepository.save(bookmark));
    }
}
