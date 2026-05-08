import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-changement-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './changement-form.html',
  styleUrls: ['./changement-form.css']

})
export class ChangementFormComponent {

  form = {
    nouvelleSituation: '',
    description: ''
  };

  chargement = false;
  succes = false;
  erreur = '';

  private readonly API = 'http://localhost:8080/api';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  soumettre(): void {
    if (!this.form.nouvelleSituation || !this.form.description.trim()) {
      this.erreur = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.chargement = true;
    this.erreur = '';
    this.succes = false;

    // ✅ ancienSituation envoyé comme chaîne vide — le backend l'ignore
    // et récupère la vraie valeur depuis le profil de l'employé connecté
    const body = {
      ancienSituation: '',
      nouvelleSituation: this.form.nouvelleSituation,
      description: this.form.description
    };

    this.http.post(`${this.API}/changements`, body, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.succes = true;
          this.chargement = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/changements']), 1500);
        },
        error: (err) => {
          console.error('Erreur soumission:', err);
          this.erreur = 'Erreur lors de l\'envoi. Veuillez réessayer.';
          this.chargement = false;
          this.cdr.detectChanges();
        }
      });
  }

  retour(): void {
    this.router.navigate(['/changements']);
  }
}