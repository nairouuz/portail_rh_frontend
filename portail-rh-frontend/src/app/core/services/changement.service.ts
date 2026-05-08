import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChangementService {
  private apiUrl = 'http://localhost:8080/api/changements';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getMesChangements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  creerChangement(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  annulerChangement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllChangements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/toutes`, { headers: this.getHeaders() });
  }

  approuver(id: number, commentaire: string = ''): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/admin/${id}/approuver`,
      { commentaire },
      { headers: this.getHeaders() }
    );
  }

  refuser(id: number, commentaire: string = ''): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/admin/${id}/refuser`,
      { commentaire },
      { headers: this.getHeaders() }
    );
  }
}