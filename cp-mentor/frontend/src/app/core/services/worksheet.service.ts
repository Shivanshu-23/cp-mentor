import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorksheetSaveResponse {
  id: number;
  path: string;
  commitUrl: string;
}

export interface WorksheetResponse {
  id: number;
  problem: string;
  lcNumber: string | null;
  difficulty: string | null;
  markdown: string;
  githubPath: string | null;
  githubCommitUrl: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WorksheetService {
  private API = '/api/v1/worksheet';
  constructor(private http: HttpClient) {}

  save(fileName: string, markdown: string, problem: string, lcNumber: string, difficulty: string): Observable<WorksheetSaveResponse> {
    return this.http.post<WorksheetSaveResponse>(`${this.API}/save`, { fileName, markdown, problem, lcNumber, difficulty });
  }

  listMine(): Observable<WorksheetResponse[]> {
    return this.http.get<WorksheetResponse[]>(this.API);
  }

  getOne(id: number): Observable<WorksheetResponse> {
    return this.http.get<WorksheetResponse>(`${this.API}/${id}`);
  }
}
