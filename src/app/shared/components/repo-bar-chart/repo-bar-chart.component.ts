import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';
import {
  DashboardMetric,
  GithubRepoDetails,
} from '../../../core/models/github.models';
import { CHART_METRICS, CHART_BAR_COLORS } from '../../constants';

@Component({
  selector: 'app-repo-bar-chart',
  standalone: true,
  templateUrl: './repo-bar-chart.component.html',
  styleUrl: './repo-bar-chart.component.scss',
})
export class RepoBarChartComponent {
  repos = input.required<GithubRepoDetails[]>();
  metric = input<DashboardMetric | 'all'>('all');

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('c');
  private chart?: Chart;

  constructor(private destroyRef: DestroyRef) {
    effect(() => {
      const list = this.repos();
      const m = this.metric();
      queueMicrotask(() => this.updateChart(list, m));
    });
    this.destroyRef.onDestroy(() => this.chart?.destroy());
  }

  private updateChart(repos: GithubRepoDetails[], metric: DashboardMetric | 'all'): void {
    const ref = this.canvas();
    if (!ref) return;

    const canvas = ref.nativeElement;

    if (!repos.length) {
      this.chart?.destroy();
      this.chart = undefined;
      return;
    }

    const isAllMetrics = metric === 'all';

    let labels: string[];
    let datasets: any[];

    if (isAllMetrics) {
      labels = CHART_METRICS.map((x) => x.label);
      datasets = repos.map((repo, i) => {
        const c = CHART_BAR_COLORS[i % CHART_BAR_COLORS.length];
        return {
          label: repo.full_name,
          data: CHART_METRICS.map((x) => this.getNumber(repo, x.key)),
          backgroundColor: c.backgroundColor,
          borderColor: c.borderColor,
          borderWidth: 2,
        };
      });
    } else {
      labels = repos.map((r) => r.full_name);
      const label = CHART_METRICS.find((x) => x.key === metric)?.label ?? metric;
      const perRepoColors = repos.map((_, i) => CHART_BAR_COLORS[i % CHART_BAR_COLORS.length]);
      datasets = [
        {
          label,
          data: repos.map((r) => this.getNumber(r, metric)),
          backgroundColor: perRepoColors.map((c) => c.backgroundColor),
          borderColor: perRepoColors.map((c) => c.borderColor),
          borderWidth: 2,
        },
      ];
    }

    const legend =
      isAllMetrics
        ? { display: true, position: 'top' as const }
        : {
            display: true,
            position: 'top' as const,
            labels: {
              boxWidth: 0,
              boxHeight: 0,
              padding: 8,
              generateLabels: (chart: Chart) => {
                const ds = chart.data.datasets[0];
                if (!ds) return [];
                return [
                  {
                    text: String(ds.label ?? ''),
                    fillStyle: 'transparent',
                    strokeStyle: 'transparent',
                    lineWidth: 0,
                    hidden: !chart.isDatasetVisible(0),
                    datasetIndex: 0,
                  },
                ];
              },
            },
          };

    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend },
        scales: {
          x: { stacked: false },
          y: { beginAtZero: true },
        },
        animation: { duration: 280 },
      },
    });
  }

  private getNumber(repo: GithubRepoDetails, key: DashboardMetric): number {
    if (key === 'stars') return repo.stargazers_count;
    if (key === 'forks') return repo.forks_count;
    if (key === 'open_issues') return repo.open_issues_count;
    return repo.subscribers_count;
  }
}
