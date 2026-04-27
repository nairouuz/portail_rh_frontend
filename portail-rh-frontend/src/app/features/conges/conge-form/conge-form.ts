import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-conge-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conge-form.html',
  styleUrls: ['./conge-form.css']
})
export class CongeFormComponent {

  demande = {
    dateDebut: '',
    dateFin: '',
    motif: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (!this.demande.dateDebut || !this.demande.dateFin || !this.demande.motif.trim()) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.demande.dateFin < this.demande.dateDebut) {
      this.errorMessage = 'La date de fin doit être après la date de début';
      return;
    }

    const user = this.authService.getUser();
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    // Utiliser l'URL avec l'ID employé
    this.http.post(
      `http://localhost:8080/api/conges/employe/${user.id}`,
      this.demande,
      { headers }
    ).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Demande de congé soumise avec succès !');
  this.router.navigate(['/dashboard'], { state: { section: 'conges' } });
        
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la soumission';
      }
    });
  }

retour(): void {
  this.router.navigate(['/dashboard'], { state: { section: 'conges' } });
}
}