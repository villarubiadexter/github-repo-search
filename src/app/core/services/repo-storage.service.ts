import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../../shared/constants';
import { StoredDashboardRepo } from '../models/github.models';

@Injectable({ providedIn: 'root' })
export class RepoStorageService {
  private repos = signal<StoredDashboardRepo[]>(this.readFromStorage());

  readonly savedRepos = this.repos.asReadonly();

  add(repo: StoredDashboardRepo): boolean {
    if (this.repos().some((r) => r.id === repo.id)) {
      return false;
    }
    const next = [...this.repos(), repo];
    this.write(next);
    return true;
  }

  private write(list: StoredDashboardRepo[]): void {
    localStorage.setItem(STORAGE_KEYS.dashboardRepos, JSON.stringify(list));
    this.repos.set(list);
  }

  private readFromStorage(): StoredDashboardRepo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.dashboardRepos);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((item) => {
        if (typeof item !== 'object' || item === null) return false;
        const r = item as Record<string, unknown>;
        return typeof r['id'] === 'number' && typeof r['full_name'] === 'string';
      }) as StoredDashboardRepo[];
    } catch {
      return [];
    }
  }
}
