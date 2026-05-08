import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-changement-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './changement-list.html',
  styleUrls: ['./changement-list.css']
})
export class ChangementListComponent implements OnInit, OnDestroy {
  demandes: any[] = [];
  erreur: string = '';
  private routerSub: Subscription | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.fetchChangements();
  }

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url === '/changements') {
        this.fetchChangements();
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

  private fetchChangements(): void {
    this.http.get<any[]>(
      'http://localhost:8080/api/changements',
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.demandes = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur GET changements:', err);
        this.erreur = 'Impossible de charger les demandes.';
        this.demandes = [];
        this.cdr.detectChanges();
      }
    });
  }

  nouvelleDemande(): void {
    this.router.navigate(['/changements/nouveau']);
  }

  retour(): void {
    this.router.navigate(['/dashboard']);
  }

  annuler(id: number): void {
    if (!confirm('Confirmer l\'annulation ?')) return;
    this.http.delete(
      `http://localhost:8080/api/changements/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.demandes = this.demandes.filter(d => d.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur annulation:', err)
    });
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