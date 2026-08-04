import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type BookmarkItemType = 'PATTERN' | 'PROBLEM';

export interface BookmarkCreateRequest {
  itemType: BookmarkItemType;
  itemKey: string;
  title: string;
  note?: string;
}

export interface BookmarkResponse {
  id: number;
  itemType: BookmarkItemType;
  itemKey: string;
  title: string;
  note: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private API = '/api/v1/bookmarks';
  constructor(private http: HttpClient) {}

  listMine(): Observable<BookmarkResponse[]> {
    return this.http.get<BookmarkResponse[]>(this.API);
  }

  create(req: BookmarkCreateRequest): Observable<BookmarkResponse> {
    return this.http.post<BookmarkResponse>(this.API, req);
  }

  updateNote(id: number, note: string): Observable<BookmarkResponse> {
    return this.http.patch<BookmarkResponse>(`${this.API}/${id}`, { note });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
