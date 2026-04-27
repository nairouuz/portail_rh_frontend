import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

type ActiveSection = 'dashboard' | 'conges' | 'autorisations';

@Component({
  selector: 'app-chef-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chef-dashboard.html',
  styleUrls: ['./chef-dashboard.css'],
  encapsulation: ViewEncapsulation.None  // ✅ AJOUT CRITIQUE
})
export class ChefDashboardComponent implements OnInit {

  activeSection: ActiveSection = 'dashboard';
  sidebarOpen = true;
  user: any = null;
  userName = '';
  today: Date = new Date();
  loading = true;

  stats = {
    conges:        { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    autorisations: { total: 0, enAttente: 0, approuves: 0, refuses: 0 }
  };

  conges:        any[] = [];
  autorisations: any[] = [];
  recentDemandes: any[] = [];

  private loadedCount = 0;
  private totalRequests = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.userName = `${this.user.prenom || ''} ${this.user.nom || ''}`.trim();
    }
    this.loadAllData();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  setSection(section: ActiveSection): void { this.activeSection = section; }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }

  loadAllData(): void {
    if (!this.user) return;

    this.http.get<any[]>(
      `http://localhost:8080/api/conges/chef/${this.user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.conges = data || [];
        this.stats.conges.total     = this.conges.length;
        this.stats.conges.enAttente = this.conges.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.conges.approuves = this.conges.filter(d => d.statut === 'VALIDEE_CHEF' || d.statut === 'VALIDEE_RH').length;
        this.stats.conges.refuses   = this.conges.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.conges.filter(d => d.statut === 'EN_ATTENTE').slice(0, 3), 'Congé');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>(
      `http://localhost:8080/api/autorisations/chef/${this.user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.autorisations = data || [];
        this.stats.autorisations.total     = this.autorisations.length;
        this.stats.autorisations.enAttente = this.autorisations.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.autorisations.approuves = this.autorisations.filter(d => d.statut === 'VALIDEE_CHEF' || d.statut === 'VALIDEE_RH').length;
        this.stats.autorisations.refuses   = this.autorisations.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.autorisations.filter(d => d.statut === 'EN_ATTENTE').slice(0, 3), 'Autorisation');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  addToRecent(data: any[], type: string): void {
    if (data && data.length > 0) {
      const items = data.map((item: any) => ({
        ...item, type,
        date: item.dateDemande || item.date || new Date(),
        employeNom: item.utilisateur
          ? `${item.utilisateur.prenom || ''} ${item.utilisateur.nom || ''}`.trim()
          : 'Inconnu'
      }));
      this.recentDemandes.push(...items);
      this.recentDemandes.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime());
      this.recentDemandes = this.recentDemandes.slice(0, 8);
    }
  }

  checkLoading(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.totalRequests) {
      setTimeout(() => { this.loading = false; this.cdr.detectChanges(); }, 300);
    }
  }

  getTotalEnAttente(): number {
    return this.stats.conges.enAttente + this.stats.autorisations.enAttente;
  }

  valider(type: string, id: number): void {
    const urls: any = {
      'conge':        `http://localhost:8080/api/conges/${id}/valider-chef`,
      'autorisation': `http://localhost:8080/api/autorisations/${id}/valider-chef`
    };
    this.http.put(urls[type], {}, { headers: this.getHeaders() }).subscribe({
      next: () => { this.resetAndReload(); },
      error: (err) => console.error('Erreur validation:', err)
    });
  }

  refuser(type: string, id: number): void {
    const urls: any = {
      'conge':        `http://localhost:8080/api/conges/${id}/refuser`,
      'autorisation': `http://localhost:8080/api/autorisations/${id}/refuser`
    };
    this.http.put(urls[type], {}, { headers: this.getHeaders() }).subscribe({
      next: () => { this.resetAndReload(); },
      error: (err) => console.error('Erreur refus:', err)
    });
  }

  resetAndReload(): void {
    this.loadedCount = 0;
    this.recentDemandes = [];
    this.conges = [];
    this.autorisations = [];
    this.loading = true;
    this.loadAllData();
  }

  logout(): void { this.authService.logout(); }

  getStatutLabel(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'En attente', 'VALIDEE_CHEF': 'Validée',
      'VALIDEE_RH': 'Approuvée RH', 'REFUSEE': 'Refusée'
    };
    return map[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'badge-pending', 'VALIDEE_CHEF': 'badge-approved',
      'VALIDEE_RH': 'badge-approved', 'REFUSEE': 'badge-rejected'
    };
    return map[statut] || '';
  }

  getInitials(): string {
    if (!this.user) return 'C';
    return `${(this.user.prenom || '')[0] || ''}${(this.user.nom || '')[0] || ''}`.toUpperCase();
  }

  getDetailText(demande: any): string {
    if (demande.dateDebut && demande.dateFin)
      return `${new Date(demande.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(demande.dateFin).toLocaleDateString('fr-FR')}`;
    return demande.motif?.substring(0, 40) || '-';
  }
}