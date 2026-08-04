package com.cpmentor.bookmark.controller;

import com.cpmentor.bookmark.dto.BookmarkCreateRequest;
import com.cpmentor.bookmark.dto.BookmarkNoteUpdateRequest;
import com.cpmentor.bookmark.dto.BookmarkResponse;
import com.cpmentor.bookmark.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Not in any permitAll list — falls through to the default
// .anyRequest().authenticated() rule, same as Worksheet/PracticeQueue.
@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Bookmarks + revision notes on patterns and problems — requires login")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "List the current user's bookmarks, newest first")
    public ResponseEntity<List<BookmarkResponse>> listMine(@AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(bookmarkService.listMine(user.getUsername()));
    }

    @PostMapping
    @Operation(summary = "Bookmark a pattern or problem — idempotent, returns the existing bookmark if already saved")
    public ResponseEntity<BookmarkResponse> create(
            @Valid @RequestBody BookmarkCreateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(bookmarkService.create(user.getUsername(), request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a bookmark's revision note")
    public ResponseEntity<BookmarkResponse> updateNote(
            @PathVariable Long id,
            @RequestBody BookmarkNoteUpdateRequest request,
            @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(bookmarkService.updateNote(user.getUsername(), id, request.getNote()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a bookmark — owner-only")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        if (user == null) return ResponseEntity.status(401).build();
        bookmarkService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
