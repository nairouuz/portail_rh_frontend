import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  userName: string = '';
  userRole: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.userName = this.user.prenom + ' ' + this.user.nom;
      this.userRole = this.getRoleLabel();
    }
  }

  getRoleLabel(): string {
    if (this.authService.isEmploye()) return 'Employé';
    if (this.authService.isChef()) return 'Chef de département';
    if (this.authService.isAdmin()) return 'Administrateur RH';
    return 'Invité';
  }

  logout(): void {
    this.authService.logout();
  }
}