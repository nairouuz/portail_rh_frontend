import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Demande {
  id: number;
  type: string;
  statut: string;
  dateCreation: string;
  dateDebut?: string;
  dateFin?: string;
  motif?: string;
  montant?: number;
  userId: number;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
}

@Injectable({ providedIn: 'root' })
export class DemandeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMesDemandes(type?: string): Observable<any[]> {
    if (type === 'CONGE') return this.http.get<any[]>(`${this.apiUrl}/api/conges`);
    if (type === 'PRET' || type === 'AVANCE') return this.http.get<any[]>(`${this.apiUrl}/api/prets`);
    if (type === 'AUTORISATION') return this.http.get<any[]>(`${this.apiUrl}/api/autorisations`);
    if (type === 'DOCUMENT') return this.http.get<any[]>(`${this.apiUrl}/api/documents`);
    return this.http.get<any[]>(`${this.apiUrl}/api/conges`);
  }

  getToutesDemandes(type?: string): Observable<any[]> {
    if (type === 'CONGE') return this.http.get<any[]>(`${this.apiUrl}/api/conges/equipe`);
    if (type === 'PRET') return this.http.get<any[]>(`${this.apiUrl}/api/prets/equipe`);
    if (type === 'AUTORISATION') return this.http.get<any[]>(`${this.apiUrl}/api/autorisations/equipe`);
    return this.http.get<any[]>(`${this.apiUrl}/api/conges/equipe`);
  }

  creerDemande(demande: any): Observable<any> {
    if (demande.type === 'CONGE') {
      return this.http.post<any>(`${this.apiUrl}/api/conges`, demande);
    }
    if (demande.type === 'PRET' || demande.type === 'AVANCE') {
      return this.http.post<any>(`${this.apiUrl}/api/prets`, demande);
    }
    if (demande.type === 'AUTORISATION') {
      return this.http.post<any>(`${this.apiUrl}/api/autorisations`, demande);
    }
    if (demande.type === 'DOCUMENT') {
      return this.http.post<any>(`${this.apiUrl}/api/documents`, demande);
    }
    if (demande.type === 'SITUATION') {
      return this.http.post<any>(`${this.apiUrl}/api/changements-situation`, demande);
    }
    return this.http.post<any>(`${this.apiUrl}/api/conges`, demande);
  }

  validerDemande(id: number, statut: string): Observable<any> {
    if (statut === 'REJETEE') {
      return this.http.put<any>(`${this.apiUrl}/api/conges/${id}/refuser`, {});
    }
    return this.http.put<any>(`${this.apiUrl}/api/conges/${id}/valider`, {});
  }

  supprimerDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/conges/${id}`);
  }
}