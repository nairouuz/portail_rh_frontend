import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

type ActiveSection = 'dashboard' | 'conges' | 'autorisations' | 'prets' |
                     'avances' | 'documents' | 'employes' | 'changements';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminDashboardComponent implements OnInit {

  activeSection: ActiveSection = 'dashboard';
  sidebarOpen = true;
  user: any = null;
  userName = '';
  today: Date = new Date();
  loading = true;

  stats = {
    totalEmployes: 0,
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
  employes:      any[] = [];
  allUtilisateurs: any[] = [];
  recentDemandes: any[] = [];

  // ── Changements de situation ──
  tousChangements: any[] = [];
  changementsFiltres: any[] = [];
  filtreStatutChangement = '';
  commentairesAdmin: { [key: number]: string } = {};
  erreurChangementsAdmin = '';
  nbChangementsAttente = 0;

  showAddEmployeForm = false;
  addEmployeLoading = false;
  addEmployeError = '';
  newEmploye = {
    nom: '', prenom: '', email: '',
    password: '', telephone: '', role: 'UTILISATEUR'
  };

  private loadedCount = 0;
  private totalRequests = 6;

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
    this.fetchChangementsCount(); // badge sans charger tout
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  setSection(section: ActiveSection): void {
    this.activeSection = section;
    if (section === 'changements') {
      this.fetchTousChangements();
    }
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }

  // ══════════════════════════════════════════════
  // Chargement données originales
  // ══════════════════════════════════════════════

  loadAllData(): void {
    this.http.get<any[]>('http://localhost:8080/api/utilisateurs',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.allUtilisateurs = data || [];
        this.employes = data?.filter(u => u.role !== 'ADMIN') || [];
        this.stats.totalEmployes = data?.filter(u => u.role === 'UTILISATEUR').length || 0;
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>('http://localhost:8080/api/conges',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.conges = data || [];
        this.stats.conges.total     = this.conges.length;
        this.stats.conges.enAttente = this.conges.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').length;
        this.stats.conges.approuves = this.conges.filter(d => d.statut === 'VALIDEE_RH').length;
        this.stats.conges.refuses   = this.conges.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.conges.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').slice(0, 2), 'Congé');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>('http://localhost:8080/api/prets',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.prets = data || [];
        this.stats.prets.total     = this.prets.length;
        this.stats.prets.enAttente = this.prets.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').length;
        this.stats.prets.approuves = this.prets.filter(d => d.statut === 'VALIDEE_RH').length;
        this.stats.prets.refuses   = this.prets.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.prets.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').slice(0, 2), 'Prêt');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>('http://localhost:8080/api/avances',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.avances = data || [];
        this.stats.avances.total     = this.avances.length;
        this.stats.avances.enAttente = this.avances.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').length;
        this.stats.avances.approuves = this.avances.filter(d => d.statut === 'VALIDEE_RH').length;
        this.stats.avances.refuses   = this.avances.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.avances.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').slice(0, 2), 'Avance');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>('http://localhost:8080/api/autorisations',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.autorisations = data || [];
        this.stats.autorisations.total     = this.autorisations.length;
        this.stats.autorisations.enAttente = this.autorisations.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').length;
        this.stats.autorisations.approuves = this.autorisations.filter(d => d.statut === 'VALIDEE_RH').length;
        this.stats.autorisations.refuses   = this.autorisations.filter(d => d.statut === 'REFUSEE').length;
        this.addToRecent(this.autorisations.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDEE_CHEF').slice(0, 2), 'Autorisation');
        this.checkLoading();
      },
      error: () => this.checkLoading()
    });

    this.http.get<any[]>('http://localhost:8080/api/documents',
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
        date: item.dateDemande || item.date || new Date(),
        employeNom: this.getEmployeNomFromItem(item)
      }));
      this.recentDemandes.push(...items);
      this.recentDemandes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.recentDemandes = this.recentDemandes.slice(0, 8);
    }
  }

  checkLoading(): void {
    this.loadedCount++;
    if (this.loadedCount >= this.totalRequests) {
      setTimeout(() => { this.loading = false; this.cdr.detectChanges(); }, 300);
    }
  }

  // ══════════════════════════════════════════════
  // Changements de situation
  // ══════════════════════════════════════════════

  fetchChangementsCount(): void {
    this.http.get<any[]>('http://localhost:8080/api/changements/admin/toutes',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.tousChangements = data ?? [];
        this.nbChangementsAttente = this.tousChangements.filter(d => d.statut === 'EN_ATTENTE').length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  fetchTousChangements(): void {
    this.erreurChangementsAdmin = '';
    this.http.get<any[]>('http://localhost:8080/api/changements/admin/toutes',
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.tousChangements = data ?? [];
        this.nbChangementsAttente = this.tousChangements.filter(d => d.statut === 'EN_ATTENTE').length;
        this.filtrerChangements();
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreurChangementsAdmin = 'Impossible de charger les demandes.';
        this.cdr.detectChanges();
      }
    });
  }

  filtrerChangements(): void {
    if (!this.filtreStatutChangement) {
      this.changementsFiltres = [...this.tousChangements];
    } else {
      this.changementsFiltres = this.tousChangements.filter(d => d.statut === this.filtreStatutChangement);
    }
  }

  getNbChangementsParStatut(statut: string): number {
    return this.tousChangements.filter(d => d.statut === statut).length;
  }

  approuverChangement(id: number): void {
    const commentaire = this.commentairesAdmin[id] || '';
    this.http.put(`http://localhost:8080/api/changements/admin/${id}/approuver`,
      { commentaire }, { headers: this.getHeaders() }).subscribe({
      next: (updated: any) => this.mettreAJourChangement(id, updated),
      error: () => alert('Erreur lors de l\'approbation.')
    });
  }

  refuserChangement(id: number): void {
    const commentaire = this.commentairesAdmin[id] || '';
    this.http.put(`http://localhost:8080/api/changements/admin/${id}/refuser`,
      { commentaire }, { headers: this.getHeaders() }).subscribe({
      next: (updated: any) => this.mettreAJourChangement(id, updated),
      error: () => alert('Erreur lors du refus.')
    });
  }

  private mettreAJourChangement(id: number, updated: any): void {
    const index = this.tousChangements.findIndex(d => d.id === id);
    if (index !== -1) this.tousChangements[index] = updated;
    this.nbChangementsAttente = this.tousChangements.filter(d => d.statut === 'EN_ATTENTE').length;
    this.filtrerChangements();
    delete this.commentairesAdmin[id];
    this.cdr.detectChanges();
  }

  getStatutClassChangement(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'badge-pending';
      case 'APPROUVEE':  return 'badge-approved';
      case 'REFUSEE':    return 'badge-rejected';
      default:           return '';
    }
  }

  getStatutLabelChangement(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVEE':  return 'Approuvée';
      case 'REFUSEE':    return 'Refusée';
      default:           return statut;
    }
  }

  // ══════════════════════════════════════════════
  // Employés (identique à l'original)
  // ══════════════════════════════════════════════

  getEmployeNomFromItem(item: any): string {
    if (item.prenomEmploye || item.nomEmploye) return `${item.prenomEmploye || ''} ${item.nomEmploye || ''}`.trim();
    if (item.utilisateur) return `${item.utilisateur.prenom || ''} ${item.utilisateur.nom || ''}`.trim();
    if (item.employeId) {
      const u = this.allUtilisateurs.find(u => u.id === item.employeId);
      if (u) return `${u.prenom || ''} ${u.nom || ''}`.trim();
    }
    if (item.employe) return `${item.employe.prenom || ''} ${item.employe.nom || ''}`.trim();
    return 'Inconnu';
  }

  getEmployeInitiale(item: any): string {
    const nom = this.getEmployeNomFromItem(item);
    return nom && nom !== 'Inconnu' ? nom[0].toUpperCase() : '?';
  }

  getEmployesSansChef(): any[] { return this.allUtilisateurs.filter(u => u.role === 'UTILISATEUR'); }
  getChefs(): any[] { return this.allUtilisateurs.filter(u => u.role === 'CHEF'); }

  ouvrirFormEmploye(): void {
    this.showAddEmployeForm = true;
    this.addEmployeError = '';
    this.newEmploye = { nom: '', prenom: '', email: '', password: '', telephone: '', role: 'UTILISATEUR' };
  }

  fermerFormEmploye(): void { this.showAddEmployeForm = false; this.addEmployeError = ''; }

  ajouterEmploye(): void {
    if (!this.newEmploye.nom.trim() || !this.newEmploye.prenom.trim() ||
        !this.newEmploye.email.trim() || !this.newEmploye.password.trim()) {
      this.addEmployeError = 'Tous les champs obligatoires doivent être remplis';
      return;
    }
    this.addEmployeLoading = true;
    this.addEmployeError = '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    this.http.post('http://localhost:8080/api/auth/register', this.newEmploye, { headers }).subscribe({
      next: () => { this.addEmployeLoading = false; this.fermerFormEmploye(); this.resetAndReload(); },
      error: (err) => { this.addEmployeLoading = false; this.addEmployeError = err.error?.message || 'Erreur lors de la création'; }
    });
  }

  supprimerEmploye(id: number): void {
    if (!confirm('Voulez-vous vraiment supprimer cet employé ?')) return;
    this.http.delete(`http://localhost:8080/api/utilisateurs/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => this.resetAndReload(),
      error: (err) => console.error('Erreur suppression:', err)
    });
  }

  getTotalEnAttente(): number {
    return this.stats.conges.enAttente + this.stats.prets.enAttente +
           this.stats.avances.enAttente + this.stats.autorisations.enAttente +
           this.stats.documents.enAttente;
  }

  valider(type: string, id: number): void {
    const urls: any = {
      'conge':        `http://localhost:8080/api/conges/${id}/valider-rh`,
      'pret':         `http://localhost:8080/api/prets/${id}/valider`,
      'avance':       `http://localhost:8080/api/avances/${id}/valider`,
      'autorisation': `http://localhost:8080/api/autorisations/${id}/valider-rh`,
      'document':     `http://localhost:8080/api/documents/${id}/valider`
    };
    this.http.put(urls[type], {}, { headers: this.getHeaders() }).subscribe({
      next: () => this.resetAndReload(),
      error: (err) => console.error('Erreur validation:', err)
    });
  }

  refuser(type: string, id: number): void {
    const urls: any = {
      'conge':        `http://localhost:8080/api/conges/${id}/refuser`,
      'pret':         `http://localhost:8080/api/prets/${id}/refuser`,
      'avance':       `http://localhost:8080/api/avances/${id}/refuser`,
      'autorisation': `http://localhost:8080/api/autorisations/${id}/refuser`,
      'document':     `http://localhost:8080/api/documents/${id}/refuser`
    };
    this.http.put(urls[type], {}, { headers: this.getHeaders() }).subscribe({
      next: () => this.resetAndReload(),
      error: (err) => console.error('Erreur refus:', err)
    });
  }

  resetAndReload(): void {
    this.loadedCount = 0;
    this.recentDemandes = [];
    this.conges = []; this.prets = []; this.avances = [];
    this.autorisations = []; this.documents = [];
    this.allUtilisateurs = []; this.employes = [];
    this.loading = true;
    this.loadAllData();
  }

  logout(): void { this.authService.logout(); }

  getStatutLabel(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'En attente', 'VALIDEE_CHEF': 'Validée Chef',
      'VALIDEE_RH': 'Approuvée RH', 'APPROUVE': 'Approuvé', 'REFUSEE': 'Refusée'
    };
    return map[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'EN_ATTENTE': 'badge-pending', 'VALIDEE_CHEF': 'badge-chef',
      'VALIDEE_RH': 'badge-approved', 'APPROUVE': 'badge-approved', 'REFUSEE': 'badge-rejected'
    };
    return map[statut] || '';
  }

  getInitials(): string {
    if (!this.user) return 'A';
    return `${(this.user.prenom || '')[0] || ''}${(this.user.nom || '')[0] || ''}`.toUpperCase();
  }

  getDetailText(d: any): string {
    if (d.montant) return `${d.montant} DT`;
    if (d.dateDebut && d.dateFin)
      return `${new Date(d.dateDebut).toLocaleDateString('fr-FR')} → ${new Date(d.dateFin).toLocaleDateString('fr-FR')}`;
    return d.motif?.substring(0, 35) || '-';
  }

  canValider(statut: string): boolean { return statut === 'EN_ATTENTE' || statut === 'VALIDEE_CHEF'; }

  navigateTo(route: string): void { this.router.navigate([route]); }

  getTypeKey(type: string): string {
    const map: any = {
      'Congé': 'conge', 'Prêt': 'pret', 'Avance': 'avance',
      'Autorisation': 'autorisation', 'Document': 'document'
    };
    return map[type] || type.toLowerCase();
  }
}