import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent {
  user: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.user = this.authService.getUser();
  }

  isEmploye(): boolean { return this.authService.isEmploye(); }
  isChef(): boolean    { return this.authService.isChef(); }
  isAdmin(): boolean   { return this.authService.isAdmin(); }

  getRoleLabel(): string {
    if (this.isEmploye()) return 'Employé';
    if (this.isChef())    return 'Chef de département';
    if (this.isAdmin())   return 'Administrateur RH';
    return 'Invité';
  }

  logout() {
    this.authService.logout();
  }
}