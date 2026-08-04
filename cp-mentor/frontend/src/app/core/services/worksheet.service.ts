import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorksheetSaveResponse {
  path: string;
  commitUrl: string;
}

@Injectable({ providedIn: 'root' })
export class WorksheetService {
  private API = '/api/v1/worksheet';
  constructor(private http: HttpClient) {}

  save(fileName: string, markdown: string): Observable<WorksheetSaveResponse> {
    return this.http.post<WorksheetSaveResponse>(`${this.API}/save`, { fileName, markdown });
  }
}
