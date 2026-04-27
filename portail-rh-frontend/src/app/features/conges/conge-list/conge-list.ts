import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conge-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conge-list.html',
  styleUrls: ['./conge-list.css']
})
export class CongeListComponent implements OnInit, OnDestroy {
  demandes: any[] = [];
  erreur: string = '';
  private routerSub: Subscription | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.fetchConges();
  }

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url === '/conges') {
        this.fetchConges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private fetchConges(): void {
    const user = this.authService.getUser();
    if (!user) return;

    this.http.get<any[]>(
      `http://localhost:8080/api/conges/employe/${user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.demandes = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur GET congés:', err);
        this.erreur = 'Impossible de charger les demandes.';
        this.demandes = [];
        this.cdr.detectChanges();
      }
    });
  }

  nouvelleDemande(): void {
    this.router.navigate(['/conges/nouveau']);
  }

  supprimer(id: number): void {
    if (!confirm('Confirmer l\'annulation ?')) return;
    this.http.delete(
      `http://localhost:8080/api/conges/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.demandes = this.demandes.filter(d => d.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur suppression:', err)
    });
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