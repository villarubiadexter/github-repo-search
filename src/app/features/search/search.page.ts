import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, signal } from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  GithubRepoSearchItem,
  StoredDashboardRepo,
} from '../../core/models/github.models';
import { GithubApiService } from '../../core/services/github-api.service';
import { RepoStorageService } from '../../core/services/repo-storage.service';
import { getGithubApiErrorMessage } from '../../core/utils/github-api-error-handler';
import {
  GITHUB_SEARCH,
  GITHUB_SORT_OPTIONS,
  INFINITE_SCROLL,
} from '../../shared/constants';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, InfiniteScrollDirective, SpinnerComponent],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPageComponent implements OnDestroy {
  keyword = signal('');
  sort = signal<string>(GITHUB_SEARCH.defaultSort);
  order = signal<'asc' | 'desc'>(GITHUB_SEARCH.defaultOrder);

  items = signal<GithubRepoSearchItem[]>([]);
  page = signal(1);
  loading = signal(false);
  loadingMore = signal(false);
  totalCount = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  activeQuery = signal('');

  sortOptions = GITHUB_SORT_OPTIONS;
  infiniteScrollDistance = INFINITE_SCROLL.distance;
  infiniteScrollThrottle = INFINITE_SCROLL.throttle;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private api: GithubApiService,
    public storage: RepoStorageService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  infiniteScrollDisabled = computed(() => {
    if (this.loading() || this.loadingMore() || !this.activeQuery()) {
      return true;
    }
    const total = this.totalCount();
    if (total === null) return false;
    return this.items().length >= total;
  });

  onKeywordInput(value: string): void {
    this.keyword.set(value);
  }

  onSortChange(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value);
  }

  onOrderChange(event: Event): void {
    this.order.set((event.target as HTMLSelectElement).value as 'asc' | 'desc');
  }

  runSearch(): void {
    const q = this.keyword().trim();
    if (!q) {
      this.errorMessage.set('Enter a keyword to search repositories.');
      return;
    }

    this.errorMessage.set(null);
    this.activeQuery.set(q);
    this.page.set(1);
    this.items.set([]);
    this.totalCount.set(null);
    this.fetchPage(1, false);
  }

  loadNextPage(): void {
    if (this.infiniteScrollDisabled()) return;
    this.fetchPage(this.page() + 1, true);
  }

  addToDashboard(repo: GithubRepoSearchItem): void {
    const toSave: StoredDashboardRepo = {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
    };
    this.storage.add(toSave);
  }

  isSaved(id: number): boolean {
    return this.storage.savedRepos().some((r) => r.id === id);
  }

  private fetchPage(page: number, append: boolean): void {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
    }

    this.api
      .searchRepositories({
        query: this.activeQuery(),
        sort: this.sort(),
        order: this.order(),
        page,
        perPage: GITHUB_SEARCH.perPage,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading.set(false);
          this.loadingMore.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          if (append && res.items.length === 0) {
            this.totalCount.set(this.items().length);
            return;
          }

          this.totalCount.set(res.total_count);

          if (append) {
            this.items.update((cur) => [...cur, ...res.items]);
          } else {
            this.items.set(res.items);
          }

          this.page.set(page);
        },
        error: (err) => {
          this.errorMessage.set(
            getGithubApiErrorMessage(err, 'Search failed. Please try again.')
          );
        },
      });
  }
}
