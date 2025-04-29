import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartasService {
  private apiUrl = 'https://deckofcardsapi.com/api/deck';

  crearBaraja(): Observable<any> {
    return this.http.get(`${this.apiUrl}/new/shuffle/?deck_count=1`);
  }

  sacarCartas(deckId: string, count: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${deckId}/draw/?count=${count}`);
  }

  barajarBaraja(deckId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${deckId}/shuffle/`);
  }

  constructor(private http: HttpClient) {}
}
