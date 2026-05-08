import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:8080/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        const user = {
          id: response.id,
          email: response.email,
          role: response.role,
          nom: response.nom,
          prenom: response.prenom
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', response.role);
        localStorage.setItem('token', response.token);

        this.loading = false;

        // ✅ Redirection par rôle
        switch (response.role) {
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'CHEF':
            this.router.navigate(['/chef/dashboard']);
            break;
          case 'UTILISATEUR':
            this.router.navigate(['/dashboard']);
            break;
          default:
            this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur.';
        } else if (err.status === 403) {
          this.errorMessage = 'Accès refusé.';
        } else if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMessage = err.error?.message || 'Une erreur est survenue.';
        }
      }
    }); 
  }
}