import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
export type { User } from '../models/user.model';

export interface LoginResponse {
  token: string;
  role: string;
  nom: string;
  prenom: string;
  email: string;
  id: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';
  private currentUser: User | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // ✅ Charger le user depuis localStorage au démarrage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  // ✅ Login — appel HTTP + sauvegarde
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        const user: User = {
          id: response.id,
          email: response.email,
          role: response.role,
          nom: response.nom,
          prenom: response.prenom
        };
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', response.role);
        localStorage.setItem('token', response.token);
      })
    );
  }

  // ✅ Logout — vide tout et redirige vers login
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUser(): User | null {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isEmploye(): boolean {
    return localStorage.getItem('role') === 'UTILISATEUR';
  }

  isChef(): boolean {
    return localStorage.getItem('role') === 'CHEF';
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'ADMIN';
  }
}