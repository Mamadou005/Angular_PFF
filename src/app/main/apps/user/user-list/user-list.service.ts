import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class UserListService implements Resolve<any> {
  public rows: any[] = [];
  public onUserListChanged: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private apiUrl = 'http://localhost:8080/user'; 

  constructor(private http: HttpClient) {}

  /**
   * Resolve method to fetch data before routing
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.getDataTableRows();  // Retourne l'Observable des utilisateurs
  }

  /**
   * Get rows (list of users)
   */
  getDataTableRows(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((data) => {
        // Log the data to inspect it
        console.log('User data:', data);
        this.rows = data;  // Sauvegarde des utilisateurs dans `rows`
        this.onUserListChanged.next(this.rows);  // Émet les utilisateurs sur `BehaviorSubject`
      }),
      catchError((error) => {
        console.error('Error fetching user data', error);
        this.rows = [];  // Si erreur, initialise avec une liste vide
        this.onUserListChanged.next(this.rows);  // Émet une liste vide
        return [];  // Retourne une liste vide en cas d'erreur
      })
    );
  }
}
