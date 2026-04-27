import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pret-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pret-list.html',
  styleUrls: ['./pret-list.css']
})
export class PretListComponent implements OnInit {
  demandes: any[] | undefined = undefined;
  erreur: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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
    if (!user) {
      this.demandes = [];
      return;
    }

    this.demandes = undefined;

    this.http.get<any[]>(
      `http://localhost:8080/api/prets/employe/${user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.demandes = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur GET prêts:', err);
        this.erreur = 'Impossible de charger les demandes.';
        this.demandes = [];
        this.cdr.detectChanges();
      }
    });
  }

  nouvelleDemande(): void {
    this.router.navigate(['/prets/nouveau']);
  }

  supprimer(id: number): void {
    if (confirm('Annuler cette demande de prêt ?')) {
      this.http.delete(
        `http://localhost:8080/api/prets/${id}`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.demandes = (this.demandes as any[]).filter(d => d.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE':   return 'statut-attente';
      case 'VALIDEE_CHEF': return 'statut-approuve';
      case 'VALIDEE_RH':   return 'statut-approuve';
      case 'REFUSEE':      return 'statut-refuse';
      default:             return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE':   return 'En attente';
      case 'VALIDEE_CHEF': return 'Validée (Chef)';
      case 'VALIDEE_RH':   return 'Validée (RH)';
      case 'REFUSEE':      return 'Refusée';
      default:             return statut;
    }
  }
}