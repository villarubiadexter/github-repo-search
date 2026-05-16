import { DashboardMetric } from '../../core/models/github.models';

export const GITHUB_SEARCH = {
  perPage: 30,
  defaultSort: 'stars',
  defaultOrder: 'desc' as const,
} ;

export const GITHUB_SORT_OPTIONS = [
  { value: 'stars', label: 'Stars' },
  { value: 'forks', label: 'Forks' },
  { value: 'updated', label: 'Updated' },
  { value: 'help-wanted-issues', label: 'Help wanted issues' },
];

export const DASHBOARD_METRIC_OPTIONS: { value: DashboardMetric | 'all'; label: string }[] = [
  { value: 'all', label: 'All metrics' },
  { value: 'stars', label: 'Stars' },
  { value: 'forks', label: 'Forks' },
  { value: 'open_issues', label: 'Open issues' },
  { value: 'watchers', label: 'Watchers' },
];

export const CHART_METRICS: { key: DashboardMetric; label: string }[] = [
  { key: 'stars', label: 'Stars' },
  { key: 'forks', label: 'Forks' },
  { key: 'open_issues', label: 'Open issues' },
  { key: 'watchers', label: 'Watchers' },
];
