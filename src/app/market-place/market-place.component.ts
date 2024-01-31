import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market-place',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './market-place.component.html',
  styleUrl: './market-place.component.css',
})
export class MarketPlaceComponent {
  constructor(private router: Router) {}

  gotoagendar() {
    this.router.navigate(['/agendar']);
  }
}
