import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profil-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil-form.html',
  styleUrls: ['./profil-form.css']
})
export class ProfilFormComponent implements OnInit {
  employe: any = { prenom: '', nom: '', email: '', telephone: '', dateNaissance: '', cin: '', nationalite: '', situationFamiliale: 'Célibataire', grade: '', salaire: null, departement: '', dateEmbauche: '', adresse: '', telephoneUrgence: '' };
  originalEmploye: any = {};
  showInfos = false;
  showModalChangement = false;
  submitting = false;
  changementSuccess = false;
  changementRequest = { ancienSituation: '', nouvelleSituation: '', description: '' };
  mesChangements: any[] = [];
  private apiUrl = 'http://localhost:8080/api';

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void { this.loadEmployeData(); this.loadMesChangements(); }

  toggleInfos(): void { this.showInfos = !this.showInfos; }

  getNbParStatut(statut: string): number { return this.mesChangements.filter(c => c.statut === statut).length; }

  loadEmployeData(): void {
    const user = this.authService.getUser();
    if (user) {
      const savedData = localStorage.getItem('profil_' + user.id);
      if (savedData) { this.employe = JSON.parse(savedData); }
      else { this.employe = { prenom: user.prenom, nom: user.nom, email: user.email, telephone: user.telephone || '', dateNaissance: user.dateNaissance || '', cin: user.cin || '', nationalite: user.nationalite || 'Tunisienne', situationFamiliale: user.situationFamiliale || 'Célibataire', grade: user.grade || 'Employé', salaire: user.salaire || null, departement: user.departement || '', dateEmbauche: user.dateEmbauche || '', adresse: user.adresse || '', telephoneUrgence: '' }; }
      this.originalEmploye = { ...this.employe };
    }
  }

  onSubmit(): void {
    const user = this.authService.getUser();
    if (user) { localStorage.setItem('profil_' + user.id, JSON.stringify(this.employe)); alert('Coordonnées sauvegardées !'); this.originalEmploye = { ...this.employe }; }
  }

  resetForm(): void { this.employe = { ...this.originalEmploye }; }

  ouvrirModalChangement(): void { this.changementRequest = { ancienSituation: this.employe.situationFamiliale || '', nouvelleSituation: '', description: '' }; this.changementSuccess = false; this.showModalChangement = true; }

  fermerModalChangement(): void { this.showModalChangement = false; this.changementSuccess = false; this.submitting = false; }

  soumettreChangement(): void {
    if (!this.changementRequest.ancienSituation || !this.changementRequest.nouvelleSituation) return;
    if (this.changementRequest.ancienSituation === this.changementRequest.nouvelleSituation) { alert('La nouvelle situation doit être différente.'); return; }
    this.submitting = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.http.post<any>(this.apiUrl + '/changements', this.changementRequest, { headers }).subscribe({
      next: (res) => { this.submitting = false; this.changementSuccess = true; this.mesChangements.unshift(res); setTimeout(() => this.fermerModalChangement(), 2000); },
      error: () => { this.submitting = false; alert('Erreur lors de l\'envoi.'); }
    });
  }

  loadMesChangements(): void {
    const token = this.authService.getToken();
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    this.http.get<any[]>(this.apiUrl + '/changements', { headers }).subscribe({
      next: (data) => { this.mesChangements = data; },
      error: (err) => { console.error(err); }
    });
  }
}
