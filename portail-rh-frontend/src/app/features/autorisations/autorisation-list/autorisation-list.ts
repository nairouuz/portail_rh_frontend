import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-autorisation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autorisation-list.html',
  styleUrls: ['./autorisation-list.css']
})
export class AutorisationListComponent implements OnInit {
  demandes: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef  // ← Ajoutez ceci
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadDemandes(): void {
    const user = this.authService.getUser();
    if (!user) return;

    console.log('User ID:', user.id);

    this.http.get<any[]>(
      `http://localhost:8080/api/autorisations/employe/${user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        console.log('Demandes reçues:', data);
        this.demandes = data;
        this.cdr.detectChanges();  // ← Force la mise à jour du tableau
      },
      error: (err) => {
        console.log('Erreur GET:', err.status, err.error);
      }
    });
  }

  nouvelleDemande(): void {
    this.router.navigate(['/autorisations/nouveau']);
  }

  supprimer(id: number): void {
    if (confirm('Annuler cette demande ?')) {
      this.http.delete(
        `http://localhost:8080/api/autorisations/${id}`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.demandes = this.demandes.filter(d => d.id !== id);
          this.cdr.detectChanges();  // ← Force la mise à jour après suppression
          alert('Demande annulée');
        },
        error: (err) => console.error(err)
      });
    }
  }

  annulerDemande(id: number): void {
    this.supprimer(id);
  }

  getStatutClass(statut: string): string {
    switch(statut) {
      case 'EN_ATTENTE': return 'statut-attente';
      case 'APPROUVE': return 'statut-approuve';
      case 'REFUSE': return 'statut-refuse';
      default: return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch(statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVE': return 'Approuvé';
      case 'REFUSE': return 'Refusé';
      default: return statut;
    }
  }
}