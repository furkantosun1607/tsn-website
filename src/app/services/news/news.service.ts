import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  image_url: string;
  link: string;
  published_at: string;
  source_id: number;
  category_id: number;
  cluster_id: string;
}

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) {}

  getNews(skip: number = 0, limit: number = 100): Observable<Article[]> {
    const headers = new HttpHeaders({ 'ngrok-skip-browser-warning': 'true' });
    return this.http.get<Article[]>(`${this.apiUrl}/?skip=${skip}&limit=${limit}`, { headers });
  }

  getPersonalizedFeed(skip: number = 0, limit: number = 100): Observable<Article[]> {
    const headers = new HttpHeaders({ 'ngrok-skip-browser-warning': 'true' });
    return this.http.get<Article[]>(`${this.apiUrl}/feed?skip=${skip}&limit=${limit}`, { headers });
  }
}
