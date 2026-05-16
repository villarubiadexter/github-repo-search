export interface GithubRepoSearchItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
}

export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepoSearchItem[];
}

export interface GithubSearchReposParams {
  query: string;
  sort: string;
  order: 'asc' | 'desc';
  page: number;
  perPage: number;
}

export interface GithubRepoDetails {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
}

export interface StoredDashboardRepo {
  id: number;
  name: string;
  full_name: string;
  url: string;
}

export type DashboardMetric = 'stars' | 'forks' | 'open_issues' | 'watchers';
