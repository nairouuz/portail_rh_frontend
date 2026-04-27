import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  stats = {
    demandesTotal: 0,
    enAttente: 0,
    approuvees: 0
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    const conges = JSON.parse(localStorage.getItem('demandes_conge') || '[]');
    const autorisations = JSON.parse(localStorage.getItem('demandes_autorisation') || '[]');
    const allDemandes = [...conges, ...autorisations];
    
    this.stats.demandesTotal = allDemandes.length;
    this.stats.enAttente = allDemandes.filter((d: any) => d.statut === 'EN_ATTENTE').length;
    this.stats.approuvees = allDemandes.filter((d: any) => d.statut === 'APPROUVE').length;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToDemandes() {
    this.router.navigate(['/conges']);
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}