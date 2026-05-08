import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-changement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-changement-list.html',
  styleUrls: ['./admin-changement-list.css']
})
export class AdminChangementListComponent implements OnInit {
  toutesLesDemandes: any[] = [];
  demandesFiltrees: any[] = [];
  filtreStatut: string = '';
  commentaires: { [key: number]: string } = {};
  erreur: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  fetchAll(): void {
    this.http.get<any[]>(
      'http://localhost:8080/api/changements/admin/toutes',
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.toutesLesDemandes = data ?? [];
        this.filtrer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.erreur = 'Impossible de charger les demandes.';
        this.cdr.detectChanges();
      }
    });
  }

  filtrer(): void {
    if (!this.filtreStatut) {
      this.demandesFiltrees = [...this.toutesLesDemandes];
    } else {
      this.demandesFiltrees = this.toutesLesDemandes.filter(
        d => d.statut === this.filtreStatut
      );
    }
  }

  getNbParStatut(statut: string): number {
    return this.toutesLesDemandes.filter(d => d.statut === statut).length;
  }

  approuver(id: number): void {
    const commentaire = this.commentaires[id] || '';
    this.http.put(
      `http://localhost:8080/api/changements/admin/${id}/approuver`,
      { commentaire },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (updated: any) => {
        this.mettreAJourDemande(id, updated);
      },
      error: (err) => {
        console.error('Erreur approbation:', err);
        alert('Erreur lors de l\'approbation.');
      }
    });
  }

  refuser(id: number): void {
    const commentaire = this.commentaires[id] || '';
    if (!commentaire.trim()) {
      if (!confirm('Refuser sans commentaire ?')) return;
    }
    this.http.put(
      `http://localhost:8080/api/changements/admin/${id}/refuser`,
      { commentaire },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (updated: any) => {
        this.mettreAJourDemande(id, updated);
      },
      error: (err) => {
        console.error('Erreur refus:', err);
        alert('Erreur lors du refus.');
      }
    });
  }

  private mettreAJourDemande(id: number, updated: any): void {
    const index = this.toutesLesDemandes.findIndex(d => d.id === id);
    if (index !== -1) {
      this.toutesLesDemandes[index] = updated;
    }
    this.filtrer();
    delete this.commentaires[id];
    this.cdr.detectChanges();
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'statut-attente';
      case 'APPROUVEE':  return 'statut-approuve';
      case 'REFUSEE':    return 'statut-refuse';
      default:           return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVEE':  return 'Approuvée';
      case 'REFUSEE':    return 'Refusée';
      default:           return statut;
    }
  }
}