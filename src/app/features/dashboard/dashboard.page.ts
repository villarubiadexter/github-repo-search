import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  DashboardMetric,
  GithubRepoDetails,
} from '../../core/models/github.models';
import { GithubApiService } from '../../core/services/github-api.service';
import { RepoStorageService } from '../../core/services/repo-storage.service';
import { getGithubApiErrorMessage } from '../../core/utils/github-api-error-handler';
import { RepoBarChartComponent } from '../../shared/components/repo-bar-chart/repo-bar-chart.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { DASHBOARD_METRIC_OPTIONS } from '../../shared/constants';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, RepoBarChartComponent, SpinnerComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  details = signal<GithubRepoDetails[]>([]);

  selectedMetric = signal<DashboardMetric | 'all'>('all');
  enabledFullNames = signal<Set<string>>(new Set());

  metricOptions = DASHBOARD_METRIC_OPTIONS;

  private readonly destroy$ = new Subject<void>();

  chartRepos = computed(() => {
    const enabled = this.enabledFullNames();
    return this.details().filter((d) => enabled.has(d.full_name));
  });

  constructor(
    private api: GithubApiService,
    public storage: RepoStorageService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMetricChange(value: string): void {
    this.selectedMetric.set(value as DashboardMetric | 'all');
  }

  toggleRepo(fullName: string, checked: boolean): void {
    this.enabledFullNames.update((set) => {
      const next = new Set(set);
      if (checked) {
        next.add(fullName);
      } else {
        next.delete(fullName);
      }
      return next;
    });
  }

  isRepoEnabled(fullName: string): boolean {
    return this.enabledFullNames().has(fullName);
  }

  private loadDashboard(): void {
    const saved = this.storage.savedRepos();
    if (!saved.length) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin(saved.map((s) => this.api.getRepository(s.full_name)))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (repos) => {
          this.details.set(repos);
          this.enabledFullNames.set(new Set(repos.map((r) => r.full_name)));
        },
        error: (err) => {
          this.errorMessage.set(
            getGithubApiErrorMessage(err, 'Could not load repository metrics.')
          );
        },
      });
  }
}
