import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userNameSubject = new BehaviorSubject<string>('Invitado'); // Valor inicial
  userName$ = this.userNameSubject.asObservable(); 

  updateUserName(newName: string): void {
    this.userNameSubject.next(newName); // Actualiza el valor y notifica a los suscriptores
  }
}
