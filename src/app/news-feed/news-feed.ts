import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NewsService, Article } from '../services/news/news.service';

import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './news-feed.html',
  styleUrls: ['./news-feed.css']
})
export class NewsFeed implements OnInit {
  articles: Article[] = [];
  loading = true;
  isLoadingMore = false;
  hasMore = true;
  skip = 0;
  limit = 20;

  constructor(
    private newsService: NewsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNews(false);
  }

  loadNews(append: boolean): void {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.loading = true;
    }

    const feedObservable = this.newsService.getNews(this.skip, this.limit);

    feedObservable.subscribe({
      next: (data) => {
        if (data.length < this.limit) {
          this.hasMore = false;
        }

        if (append) {
          this.articles = [...this.articles, ...data];
          this.isLoadingMore = false;
        } else {
          this.articles = data;
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Failed to load news', err);
        this.loading = false;
        this.isLoadingMore = false;
      }
    });
  }

  onScroll(event: Event): void {
    if (!this.hasMore || this.isLoadingMore) {
      return;
    }

    const container = event.target as HTMLElement;
    // Check if we are near the bottom of the container
    const scrollPosition = container.scrollTop + container.clientHeight;
    const scrollThreshold = container.scrollHeight - 200; // Load 200px before reaching the end

    if (scrollPosition >= scrollThreshold) {
      this.skip += this.limit;
      this.loadNews(true);
    }
  }
}
