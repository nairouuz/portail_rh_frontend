import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-employe-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employe-form.html',
  styleUrls: ['./employe-form.css']
})
export class EmployeFormComponent implements OnInit {

  demande = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: 'UTILISATEUR',
    chefId: ''
  };

  chefs: any[] = [];
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadChefs();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  loadChefs(): void {
    this.http.get<any[]>('http://localhost:8080/api/utilisateurs/chefs', 
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => this.chefs = data,
      error: (err) => console.error('Erreur chargement chefs:', err)
    });
  }

  onSubmit(): void {
    if (!this.demande.prenom.trim() || !this.demande.nom.trim()) {
      this.errorMessage = 'Le prénom et le nom sont obligatoires';
      return;
    }
    if (!this.demande.email.trim()) {
      this.errorMessage = 'L\'email est obligatoire';
      return;
    }
    if (!this.demande.password.trim()) {
      this.errorMessage = 'Le mot de passe est obligatoire';
      return;
    }
    if (this.demande.role === 'UTILISATEUR' && !this.demande.chefId) {
      this.errorMessage = 'Veuillez sélectionner un chef hiérarchique';
      return;
    }

    this.errorMessage = '';

    // Si rôle CHEF, on n'envoie pas chefId
    const payload: any = { ...this.demande };
    if (this.demande.role !== 'UTILISATEUR') {
      delete payload.chefId;
    }

    this.http.post('http://localhost:8080/auth/register', payload, 
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        alert('Employé créé avec succès !');
        this.retour();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
      }
    });
  }

  retour(): void {
    this.router.navigate(['/admin/dashboard'], { state: { section: 'employes' } });
  }
}