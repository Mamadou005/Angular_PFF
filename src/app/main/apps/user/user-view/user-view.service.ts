import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class UserViewService implements Resolve<any> {
  public rows: any;
  public onUserViewChanged: BehaviorSubject<any>;
  public id;

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onUserViewChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    let currentId = Number(route.paramMap.get('id'));
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getApiData(currentId)]).then(() => {
        resolve();
      }, reject);
    });
  }


  /**
   * Get rows
   */
  getApiData(id: number): Promise<any[]> {
    const url = `http://localhost:8080/user/${id}`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.rows = response;
        this.onUserViewChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }
  createUser(user: { 
    nom: string; 
    prenom: string; 
    email: string; 
    password: string; 
    role: string; 
    matriculeEtudiant: string; 
    matriculeEncadreur: string; 
    departement: string; 
    selectedRole: string; 
  }): Observable<any> {
    return this._httpClient.post<any>("http://localhost:8080/auth/signup", user);
  }
  
}
