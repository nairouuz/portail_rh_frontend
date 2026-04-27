import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pret-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pret-form.html',
  styleUrls: ['./pret-form.css']
})
export class PretFormComponent {
  demande = {
    montant: null as number | null,
    nombreMensualites: null as number | null,
    motif: ''
  };

  enCours: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    // Validation
    if (!this.demande.montant || this.demande.montant <= 0) {
      alert('Veuillez saisir un montant valide (> 0)');
      return;
    }
    if (!this.demande.nombreMensualites || this.demande.nombreMensualites <= 0) {
      alert('Veuillez saisir le nombre de mensualités (> 0)');
      return;
    }
    if (!this.demande.motif.trim()) {
      alert('Veuillez saisir un motif');
      return;
    }

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
      montant: this.demande.montant,
      nombreMensualites: this.demande.nombreMensualites,
      motif: this.demande.motif.trim()
    };

    this.enCours = true;

    this.http.post(
      `http://localhost:8080/api/prets/employe/${user.id}`,
      payload,
      { headers }
    ).subscribe({
      next: () => {
        this.enCours = false;
        alert('Demande de prêt soumise avec succès !');
          this.router.navigate(['/dashboard'], { state: { section: 'prets' } });
      },
      error: (err) => {
        this.enCours = false;
        console.error('Erreur soumission:', err);
        alert('Erreur lors de la soumission. Vérifiez votre connexion.');
      }
    });
  }

  retour(): void {
          this.router.navigate(['/dashboard'], { state: { section: 'prets' } });
  }
}