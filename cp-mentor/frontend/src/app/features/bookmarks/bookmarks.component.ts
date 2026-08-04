import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookmarkService, BookmarkResponse } from '../../core/services/bookmark.service';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent implements OnInit {

  bookmarks: BookmarkResponse[] = [];
  loading = true;
  editingId: number | null = null;
  editingNote = '';

  constructor(
    private bookmarkService: BookmarkService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.bookmarkService.listMine().subscribe({
      next: bookmarks => {
        this.bookmarks = bookmarks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load bookmarks', '', { duration: 3000 });
      }
    });
  }

  get patternBookmarks(): BookmarkResponse[] {
    return this.bookmarks.filter(b => b.itemType === 'PATTERN');
  }

  get problemBookmarks(): BookmarkResponse[] {
    return this.bookmarks.filter(b => b.itemType === 'PROBLEM');
  }

  startEditNote(b: BookmarkResponse): void {
    this.editingId = b.id;
    this.editingNote = b.note ?? '';
  }

  cancelEditNote(): void {
    this.editingId = null;
    this.editingNote = '';
  }

  saveNote(b: BookmarkResponse): void {
    this.bookmarkService.updateNote(b.id, this.editingNote.trim()).subscribe({
      next: updated => {
        b.note = updated.note;
        this.editingId = null;
        this.snack.open('Note saved', '', { duration: 1500 });
      },
      error: () => this.snack.open('Failed to save note', '', { duration: 3000 })
    });
  }

  remove(b: BookmarkResponse): void {
    this.bookmarkService.delete(b.id).subscribe({
      next: () => {
        this.bookmarks = this.bookmarks.filter(x => x.id !== b.id);
      },
      error: () => this.snack.open('Failed to remove bookmark', '', { duration: 3000 })
    });
  }
}
