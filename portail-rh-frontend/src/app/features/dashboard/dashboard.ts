import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

type ActiveSection = 'dashboard' | 'conges' | 'prets' | 'avances' |
                     'autorisations' | 'documents' | 'profil';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  encapsulation: ViewEncapsulation.None  // ✅ AJOUT CRITIQUE
})
export class DashboardComponent implements OnInit {

  activeSection: ActiveSection = 'dashboard';
  sidebarOpen = true;
  user: any = null;
  userName = '';
  today: Date = new Date();
  loading = true;

  stats = {
    conges:        { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    prets:         { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    avances:       { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    autorisations: { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    documents:     { total: 0, enAttente: 0, approuves: 0, refuses: 0 }
  };

  conges:        any[] = [];
  prets:         any[] = [];
  avances:       any[] = [];
  autorisations: any[] = [];
  documents:     any[] = [];
  recentDemandes: any[] = [];

  private loadedCount = 0;
  private totalRequests = 5;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  // ✅ Lire ici car getCurrentNavigation() est disponible pendant la navigation
  const nav = this.router.getCurrentNavigation();
  const section = nav?.extras?.state?.['section'];
  if (section) {
    this.activeSection = section as ActiveSection;
  }
}

  ngOnInit(): void {
 this.resetData();
  
  
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
private resetData(): void {
  this.loadedCount = 0;
  this.loading = true;
  this.recentDemandes = [];
  this.conges = [];
  this.prets = [];
  this.avances = [];
  this.autorisations = [];
  this.documents = [];
  this.stats = {
    conges:        { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    prets:         { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    avances:       { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    autorisations: { total: 0, enAttente: 0, approuves: 0, refuses: 0 },
    documents:     { total: 0, enAttente: 0, approuves: 0, refuses: 0 }
  };
}
  loadAllData(): void {
    if (!this.user) return;

    this.http.get<any[]>(`http://localhost:8080/api/conges/employe/${this.user.id}`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.conges = data || [];
        this.stats.conges.total     = this.conges.length;
        this.stats.conges.enAttente = this.conges.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.conges.approuves = this.conges.filter(d => d.statut === 'VALIDEE_RH' || d.statut === 'VALIDEE_CHEF').length;
        this.stats.conges.refuses   = this.conges.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.conges.slice(0, 2), 'Congé');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>(`http://localhost:8080/api/prets/employe/${this.user.id}`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.prets = data || [];
        this.stats.prets.total     = this.prets.length;
        this.stats.prets.enAttente = this.prets.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.prets.approuves = this.prets.filter(d => d.statut === 'VALIDEE_RH').length;
        this.stats.prets.refuses   = this.prets.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.prets.slice(0, 2), 'Prêt');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>(`http://localhost:8080/api/avances/employe/${this.user.id}`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.avances = data || [];
        this.stats.avances.total     = this.avances.length;
        this.stats.avances.enAttente = this.avances.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.avances.approuves = this.avances.filter(d => d.statut === 'VALIDEE_RH' || d.statut === 'APPROUVE').length;
        this.stats.avances.refuses   = this.avances.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.avances.slice(0, 2), 'Avance');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>(`http://localhost:8080/api/autorisations/employe/${this.user.id}`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.autorisations = data || [];
        this.stats.autorisations.total     = this.autorisations.length;
        this.stats.autorisations.enAttente = this.autorisations.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.autorisations.approuves = this.autorisations.filter(d => d.statut === 'VALIDEE_RH' || d.statut === 'VALIDEE_CHEF').length;
        this.stats.autorisations.refuses   = this.autorisations.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.autorisations.slice(0, 2), 'Autorisation');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>(`http://localhost:8080/api/documents/employe/${this.user.id}`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.documents = data || [];
        this.stats.documents.total     = this.documents.length;
        this.stats.documents.enAttente = this.documents.filter(d => d.statut === 'EN_ATTENTE').length;
        this.stats.documents.approuves = this.documents.filter(d => d.statut === 'VALIDEE_RH' || d.statut === 'APPROUVE').length;
        this.stats.documents.refuses   = this.documents.filter(d => d.statut === 'REFUSEE').length;
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });
  }

  addToRecent(data: any[], type: string): void {
    if (data && data.length > 0) {
      const items = data.map((item: any) => ({
        ...item, type,
        date: item.dateDemande || item.date || new Date()
      }));
      this.recentDemandes.push(...items);
      this.recentDemandes.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime());
      this.recentDemandes = this.recentDemandes.slice(0, 6);
    }
  }

  checkLoading(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.totalRequests) {
      setTimeout(() => { this.loading = false; this.cdr.detectChanges(); }, 300);
    }
  }

  logout(): void { this.authService.logout(); 
    this.resetData
  }
  navigateTo(route: string): void { this.router.navigate([route]); }

  getStatutLabel(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'En attente', 'VALIDEE_CHEF': 'Validée Chef',
      'VALIDEE_RH': 'Approuvée', 'REFUSEE': 'Refusée', 'APPROUVE': 'Approuvé'
    };
    return map[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'badge-pending', 'VALIDEE_CHEF': 'badge-chef',
      'VALIDEE_RH': 'badge-approved', 'APPROUVE': 'badge-approved',
      'REFUSEE': 'badge-rejected'
    };
    return map[statut] || '';
  }

  getDetailText(demande: any): string {
    if (demande.montant) return `${demande.montant} DT`;
    if (demande.dateDebut && demande.dateFin)
      return `${new Date(demande.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(demande.dateFin).toLocaleDateString('fr-FR')}`;
    return demande.motif?.substring(0, 35) || '-';
  }

  getInitials(): string {
    if (!this.user) return 'U';
    return `${(this.user.prenom || '')[0] || ''}${(this.user.nom || '')[0] || ''}`.toUpperCase();
  }
}