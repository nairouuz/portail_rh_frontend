import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Conge {
  id: number;
  date_debut: string;
  date_fin: string;
  motif: string;
  statut?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CongeService {
  // ⚠️ À MODIFIER selon votre backend
  private apiUrl = 'http://localhost:8080/api/conges';
  // Si vous utilisez PHP: private apiUrl = 'http://localhost/portail_rh/api/conges.php';

  constructor(private http: HttpClient) {}

  getDemandes(): Observable<Conge[]> {
    return this.http.get<Conge[]>(this.apiUrl);
  }

  addDemande(demande: any): Observable<Conge> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Conge>(this.apiUrl, demande, { headers });
  }

  deleteDemande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}