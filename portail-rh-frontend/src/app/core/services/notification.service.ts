import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  message: string;
  lu: boolean;
  dateCreation: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifCount = new BehaviorSubject<number>(0);
  notifCount$ = this.notifCount.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${environment.apiUrl}/api/notifications`
    );
  }

  getNonLues(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${environment.apiUrl}/api/notifications/non-lues`
    );
  }

  countNonLues(): Observable<number> {
    return this.http.get<number>(
      `${environment.apiUrl}/api/notifications/non-lues/count`
    );
  }

  marquerLu(id: number): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/notifications/${id}/lu`, {}
    );
  }

  marquerToutLu(): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/api/notifications/lu-tout`, {}
    );
  }

  updateCount(count: number): void {
    this.notifCount.next(count);
  }
}