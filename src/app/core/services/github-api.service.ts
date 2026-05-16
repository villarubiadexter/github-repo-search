import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GithubRepoDetails,
  GithubSearchReposParams,
  GithubSearchResponse,
} from '../models/github.models';

@Injectable({ providedIn: 'root' })
export class GithubApiService {
  constructor(private http: HttpClient) {}

  searchRepositories(params: GithubSearchReposParams): Observable<GithubSearchResponse> {
    const q = params.query.trim();
    let httpParams = new HttpParams()
      .set('q', q)
      .set('page', String(params.page))
      .set('per_page', String(params.perPage))
      .set('order', params.order);

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<GithubSearchResponse>(
      `${environment.githubApiUrl}/search/repositories`,
      { params: httpParams }
    );
  }

  getRepository(fullName: string): Observable<GithubRepoDetails> {
    return this.http.get<GithubRepoDetails>(`${environment.githubApiUrl}/repos/${fullName}`);
  }
}
