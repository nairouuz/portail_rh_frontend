import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-demandes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demandes-list.html',
  styleUrls: ['./demandes-list.css']
})
export class DemandesListComponent implements OnInit {
  demandes: any[] = [];
  role: string = '';
  filteredDemandes: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.role = this.authService.getRole() || '';
    console.log('Rôle:', this.role);
    this.loadDemandes();
  }

  loadDemandes(): void {
    const conges = JSON.parse(localStorage.getItem('demandes_conge') || '[]');
    const autorisations = JSON.parse(localStorage.getItem('demandes_autorisation') || '[]');
    const prets = JSON.parse(localStorage.getItem('demandes_pret') || '[]');
    const avances = JSON.parse(localStorage.getItem('demandes_avance') || '[]');
    
    const toutesDemandes = [...conges, ...autorisations, ...prets, ...avances];
    
    if (this.role === 'CHEF') {
      // Chef voit seulement les congés et autorisations en attente
      this.filteredDemandes = toutesDemandes.filter(d => 
        (d.type === 'CONGE' || d.type === 'AUTORISATION') && 
        d.statut === 'ATTENTE_CHEF'
      );
    } else if (this.role === 'ADMIN') {
      // Admin voit toutes les demandes en attente (chef + direct)
      this.filteredDemandes = toutesDemandes.filter(d => 
        d.statut === 'ATTENTE_CHEF' || d.statut === 'ATTENTE_ADMIN'
      );
    }
    
    this.demandes = this.filteredDemandes;
    console.log('Demandes à valider:', this.demandes);
  }

  approuverDemande(demande: any): void {
    if (this.role === 'CHEF') {
      // Chef valide → passe à l'admin
      demande.statut = 'ATTENTE_ADMIN';
    } else if (this.role === 'ADMIN') {
      // Admin valide directement
      demande.statut = 'APPROUVE';
    }
    this.updateDemandeInStorage(demande);
    this.loadDemandes();
    alert('Demande approuvée');
  }

  refuserDemande(demande: any): void {
    demande.statut = 'REFUSE';
    this.updateDemandeInStorage(demande);
    this.loadDemandes();
    alert('Demande refusée');
  }

  updateDemandeInStorage(demande: any): void {
    let conges = JSON.parse(localStorage.getItem('demandes_conge') || '[]');
    let autorisations = JSON.parse(localStorage.getItem('demandes_autorisation') || '[]');
    let prets = JSON.parse(localStorage.getItem('demandes_pret') || '[]');
    let avances = JSON.parse(localStorage.getItem('demandes_avance') || '[]');
    
    const updateArray = (array: any[]) => {
      const index = array.findIndex(d => d.id === demande.id);
      if (index !== -1) {
        array[index] = demande;
        return true;
      }
      return false;
    };
    
    if (updateArray(conges)) {
      localStorage.setItem('demandes_conge', JSON.stringify(conges));
    } else if (updateArray(autorisations)) {
      localStorage.setItem('demandes_autorisation', JSON.stringify(autorisations));
    } else if (updateArray(prets)) {
      localStorage.setItem('demandes_pret', JSON.stringify(prets));
    } else if (updateArray(avances)) {
      localStorage.setItem('demandes_avance', JSON.stringify(avances));
    }
  }

  getStatutLabel(statut: string): string {
    switch(statut) {
      case 'ATTENTE_CHEF': return 'En attente chef';
      case 'ATTENTE_ADMIN': return 'En attente RH';
      case 'APPROUVE': return 'Approuvé';
      case 'REFUSE': return 'Refusé';
      default: return statut;
    }
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'CONGE': return 'Congé';
      case 'AUTORISATION': return 'Autorisation';
      case 'PRET': return 'Prêt';
      case 'AVANCE': return 'Avance';
      default: return type;
    }
  }
}