import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-list.html',
  styleUrls: ['./document-list.css']
})
export class DocumentListComponent implements OnInit {
  documents: any[] | undefined = undefined;
  showForm = false;
  enCours = false;
  erreur = '';
  
  typesDocument = [
    'Attestation de travail',
    'Attestation de salaire',
    'Bulletin de paie',
    'Contrat de travail',
    'Attestation d\'emploi',
    'Autre'
  ];
  
  nouvelleDemande = {
    typeDocument: '',
    description: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('=== INIT DOCUMENTS ===');
    this.loadDocuments();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token présent:', !!token);
    return new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadDocuments(): void {
    const user = this.authService.getUser();
    console.log('User chargé:', user);
    
    if (!user) {
      this.documents = [];
      return;
    }

    this.documents = undefined;

    this.http.get<any[]>(
      `http://localhost:8080/api/documents/employe/${user.id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        console.log('Documents reçus:', data);
        this.documents = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur GET documents:', err);
        this.erreur = 'Impossible de charger les demandes.';
        this.documents = [];
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirFormulaire(): void {
    console.log('Ouverture formulaire');
    this.showForm = true;
    this.nouvelleDemande = { typeDocument: '', description: '' };
    this.erreur = '';
  }

  fermerFormulaire(): void {
    console.log('Fermeture formulaire');
    this.showForm = false;
    this.nouvelleDemande = { typeDocument: '', description: '' };
  }

  ajouterDocument(): void {
    console.log('=== SOUMISSION DEMANDE ===');
    console.log('Type document:', this.nouvelleDemande.typeDocument);
    console.log('Description:', this.nouvelleDemande.description);
    
    // Validation
    if (!this.nouvelleDemande.typeDocument) {
      alert('Veuillez sélectionner un type de document');
      return;
    }
    if (!this.nouvelleDemande.description || !this.nouvelleDemande.description.trim()) {
      alert('Veuillez ajouter une description');
      return;
    }

    const user = this.authService.getUser();
    console.log('Utilisateur connecté:', user);
    
    if (!user) {
      alert('Vous devez être connecté');
      return;
    }

    this.enCours = true;
    this.erreur = '';

    const payload = {
      typeDocument: this.nouvelleDemande.typeDocument,
      description: this.nouvelleDemande.description.trim()
    };
    
    console.log('Payload envoyé:', payload);
    console.log('URL:', `http://localhost:8080/api/documents/employe/${user.id}`);

    this.http.post(
      `http://localhost:8080/api/documents/employe/${user.id}`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        this.enCours = false;
        alert('Demande de document soumise avec succès !');
        this.fermerFormulaire();
        this.loadDocuments();
      },
      error: (err) => {
        this.enCours = false;
        console.error('ERREUR COMPLÈTE:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Erreur détaillée:', err.error);
        
        let messageErreur = 'Erreur lors de la soumission.';
        if (err.status === 0) {
          messageErreur = 'Impossible de contacter le serveur. Vérifiez que Spring Boot est démarré sur le port 8080.';
        } else if (err.status === 401) {
          messageErreur = 'Non authentifié. Veuillez vous reconnecter.';
        } else if (err.status === 500) {
          messageErreur = 'Erreur serveur. Vérifiez les logs Spring Boot.';
        } else if (err.error && err.error.message) {
          messageErreur = err.error.message;
        }
        
        alert(messageErreur);
        this.erreur = messageErreur;
        this.cdr.detectChanges();
      }
    });
  }

  supprimer(id: number): void {
    console.log('Suppression document ID:', id);
    
    if (confirm('Annuler cette demande de document ?')) {
      this.http.delete(
        `http://localhost:8080/api/documents/${id}`,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => {
          console.log('Suppression réussie');
          this.documents = (this.documents as any[]).filter(d => d.id !== id);
          this.cdr.detectChanges();
          alert('Demande annulée');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'statut-attente';
      case 'VALIDEE': return 'statut-approuve';
      case 'REFUSEE': return 'statut-refuse';
      default: return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDEE': return 'Validé';
      case 'REFUSEE': return 'Refusé';
      default: return statut;
    }
  }
}