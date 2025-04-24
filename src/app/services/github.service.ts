import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private apiUrl = 'https://api.github.com/users';

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<any> {
    console.log(`Fetching data for user: ${username}`);
    return this.http.get(`${this.apiUrl}/${username}`);
  }
}