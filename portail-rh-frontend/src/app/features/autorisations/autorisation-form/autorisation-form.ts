import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-autorisation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autorisation-form.html',
  styleUrls: ['./autorisation-form.css']
})
export class AutorisationFormComponent {
  demande = {
    dateAutorisation: '',
    heureDebut: '',
    heureFin: '',
    motif: ''
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    const user = this.authService.getUser();
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      dateAutorisation: this.demande.dateAutorisation,
      heureDebut: this.demande.heureDebut,
      heureFin: this.demande.heureFin,
      motif: this.demande.motif
    };

    this.http.post(
      `http://localhost:8080/api/autorisations/employe/${user.id}`,
      payload,
      { headers }
    ).subscribe({
      next: () => {
        alert('Demande soumise avec succès');
        this.retour()
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la soumission');
      }
    });
  }

  retour(): void {
  this.router.navigate(['/dashboard'], { state: { section: 'autorisations' } });
  }
}