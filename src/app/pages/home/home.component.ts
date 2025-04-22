import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-home',
imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private appComponent: AppComponent) {}

  toggleSidebar() {
    this.appComponent.toggleSidebar();
  }
}
