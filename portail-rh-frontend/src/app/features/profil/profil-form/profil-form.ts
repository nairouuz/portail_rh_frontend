import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profil-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil-form.html',
  styleUrls: ['./profil-form.css']
})
export class ProfilFormComponent implements OnInit {
  employe: any = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    cin: '',
    nationalite: '',
    situationFamiliale: 'Célibataire',
    grade: '',
    salaire: null,
    departement: '',
    dateEmbauche: '',
    adresse: ''
  };
  
  originalEmploye: any = {};

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployeData();
  }

  loadEmployeData(): void {
    const user = this.authService.getUser();
    if (user) {
      // Charger depuis localStorage ou utiliser les données du user
      const savedData = localStorage.getItem(`profil_${user.id}`);
      if (savedData) {
        this.employe = JSON.parse(savedData);
      } else {
        this.employe = {
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone || '',
          dateNaissance: user.dateNaissance || '',
          cin: user.cin || '',
          nationalite: user.nationalite || 'Tunisienne',
          situationFamiliale: user.situationFamiliale || 'Célibataire',
          grade: user.grade || 'Employé',
          salaire: user.salaire || null,
          departement: user.departement || 'IT',
          dateEmbauche: user.dateEmbauche || '2024-01-01',
          adresse: user.adresse || ''
        };
      }
      this.originalEmploye = { ...this.employe };
    }
  }

  onSubmit(): void {
    const user = this.authService.getUser();
    if (user) {
      localStorage.setItem(`profil_${user.id}`, JSON.stringify(this.employe));
      alert('Informations sauvegardées avec succès !');
      this.originalEmploye = { ...this.employe };
    }
  }

  resetForm(): void {
    this.employe = { ...this.originalEmploye };
  }

  changerPhoto(): void {
    alert('Fonctionnalité d\'upload de photo à venir');
  }
}