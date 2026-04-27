import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-avance-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avance-form.html',
  styleUrls: ['./avance-form.css']
})
export class AvanceFormComponent {

  demande = {
    montant: null as number | null,
    motif: ''
  };

  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (!this.demande.montant || this.demande.montant <= 0) {
      this.errorMessage = 'Veuillez saisir un montant valide';
      return;
    }
    if (!this.demande.motif.trim()) {
      this.errorMessage = 'Veuillez saisir un motif';
      return;
    }

    const user = this.authService.getUser();
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    this.errorMessage = '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    this.http.post(
      `http://localhost:8080/api/avances/employe/${user.id}`,
      { montant: this.demande.montant, motif: this.demande.motif.trim() },
      { headers }
    ).subscribe({
      next: () => {
        alert('Demande d\'avance soumise avec succès !');
        this.retour();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la soumission';
      }
    });
  }

  retour(): void {
  this.router.navigate(['/dashboard'], { state: { section: 'avances' } });
  }
}