import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-form.html',
  styleUrls: ['./document-form.css']
})
export class DocumentFormComponent {

  demande = {
    typeDocument: '',
    description: ''
  };

  typesDocument = [
    'Attestation de travail',
    'Attestation de salaire',
    'Bulletin de paie',
    'Contrat de travail',
    'Attestation d\'emploi',
    'Autre'
  ];

  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (!this.demande.typeDocument) {
      this.errorMessage = 'Veuillez sélectionner un type de document';
      return;
    }
    if (!this.demande.description.trim()) {
      this.errorMessage = 'Veuillez saisir une description';
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
      `http://localhost:8080/api/documents/employe/${user.id}`,
      { typeDocument: this.demande.typeDocument, description: this.demande.description.trim() },
      { headers }
    ).subscribe({
      next: () => {
        alert('Demande de document soumise avec succès !');
        this.retour();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la soumission';
      }
    });
  }

  retour(): void {
  this.router.navigate(['/dashboard'], { state: { section: 'documents' } });
  }
}