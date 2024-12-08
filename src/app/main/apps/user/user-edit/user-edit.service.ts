import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  matricule: string;
  password: string;
}

@Injectable()
export class UserEditService implements Resolve<any> {
  public apiData: UserData[];
  public onUserEditChanged: BehaviorSubject<UserData[]>;
  private apiUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {
    this.onUserEditChanged = new BehaviorSubject<UserData[]>([]);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    const userId = route.paramMap.get('id');
    if (userId) {
      return this.getUserData(userId);
    } else {
      return of([]);
    }
  }
  

  getUserData(id: string): Observable<UserData[]> {
    return this.http.get<UserData[]>(`${this.apiUrl}/${id}`).pipe(
      switchMap(data => {
        this.apiData = data;
        this.onUserEditChanged.next(data);
        return of(data);
      }),
      catchError(err => {
        console.error('Error fetching data', err);
        return of([]);
      })
    );
  }

  updateUser(id:string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData); 
  }
}
