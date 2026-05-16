export const APP_BRAND_TITLE = 'GitHub Search App';
export const APP_BRAND_LINK = '/search';

export const ROUTES = {
  search: '/search',
  dashboard: '/dashboard',
};

export const NAV_TABS = [
  { label: 'Search', path: ROUTES.search, exact: true },
  { label: 'Dashboard', path: ROUTES.dashboard },
];

export const STORAGE_KEYS = {
  dashboardRepos: 'github_dashboard_repos',
};

export const INFINITE_SCROLL = {
  distance: 2,
  throttle: 150,
};

