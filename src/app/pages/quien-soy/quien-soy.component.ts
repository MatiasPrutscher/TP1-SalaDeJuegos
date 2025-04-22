import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../services/github.service';

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.component.html',
  styleUrls: ['./quien-soy.component.css'],
})
export class QuienSoyComponent implements OnInit {
  userData: any;
  username: string = 'MatiasPrutscher'; 

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.githubService.getUser(this.username).subscribe({
      next: (data) => (this.userData = data),
      error: (err) => console.error('Error fetching user data:', err),
    });
  }
}
