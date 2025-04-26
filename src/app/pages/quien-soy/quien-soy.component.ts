import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GithubService } from '../../services/github/github.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.component.html',
  styleUrls: ['./quien-soy.component.css'],
})
export class QuienSoyComponent implements OnInit {
  userData: any;
  username: string = 'MatiasPrutscher';

  constructor(private githubService: GithubService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUserData();
    console.log('Final OnInit:', this.userData); // Ahora debería mostrar los datos correctamente
  }

  private async fetchUserData(): Promise<void> {
    try {
      console.log('Fetching user data for:', this.username);
      this.userData = await firstValueFrom(this.githubService.getUser(this.username));
      console.log('Data fetched:', this.userData);
      this.cdr.detectChanges(); // Notifica a Angular que debe actualizar la vista
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }
}
