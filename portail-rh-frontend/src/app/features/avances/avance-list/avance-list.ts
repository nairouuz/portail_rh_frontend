import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-avance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avance-list.html',
  styleUrls: ['./avance-list.css']
})
export class AvanceListComponent implements OnInit {
  avances: any[] | undefined = undefined;
  showForm = false;
  enCours = false;
  erreur = '';
  nouvelleAvance = { montant: null as number | null, motif: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router

  ) {}

  ngOnInit(): void {
    this.loadAvances();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  loadAvances(): void {
    const user = this.authService.getUser();
    if (!user) { this.avances = []; return; }

    this.avances = undefined;

    this.http.get<any[]>(
      `http://localhost:8080/api/avances/employe/${user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.avances = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur GET avances:', err);
        this.erreur = 'Impossible de charger les demandes.';
        this.avances = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ← Alias pour le bouton "Nouvelle demande"
  nouvelleDemande(): void {
  this.router.navigate(['/avances/nouveau']);
}
  ouvrirFormulaire(): void {
    this.showForm = true;
    this.nouvelleAvance = { montant: null, motif: '' };
  }

  fermerFormulaire(): void {
    this.showForm = false;
    this.nouvelleAvance = { montant: null, motif: '' };
  }

  ajouterAvance(): void {
    if (!this.nouvelleAvance.montant || this.nouvelleAvance.montant <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }
    if (!this.nouvelleAvance.motif.trim()) {
      alert('Veuillez saisir un motif');
      return;
    }

    const user = this.authService.getUser();
    if (!user) { alert('Vous devez être connecté'); return; }

    this.enCours = true;

    const payload = {
      montant: this.nouvelleAvance.montant,
      motif: this.nouvelleAvance.motif.trim()
    };

    this.http.post(
      `http://localhost:8080/api/avances/employe/${user.id}`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.enCours = false;
        alert('Demande d\'avance soumise avec succès !');
        this.fermerFormulaire();
        this.loadAvances();
      },
      error: (err) => {
        this.enCours = false;
        console.error('Erreur POST avance:', err);
        alert('Erreur lors de la soumission.');
      }
    });
  }

  supprimer(id: number): void {
    if (confirm('Annuler cette demande d\'avance ?')) {
      this.http.delete(
        `http://localhost:8080/api/avances/${id}`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          this.avances = (this.avances as any[]).filter(a => a.id !== id);
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