import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class BlogListService implements Resolve<any> {
  // Public
  public apiData: any;
  public onBlogListChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    // Initialisation du comportement
    this.onBlogListChanged = new BehaviorSubject({});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getData()]).then(() => {
        resolve();
      }, reject);
    });
  }

  // Méthode pour récupérer les données depuis l'API
  getData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // Remplacez l'URL par l'URL de votre API backend pour récupérer les données
      this._httpClient.get('http://localhost:8080/api/user') 
        .subscribe((response: any) => {
          this.apiData = response;
          this.onBlogListChanged.next(this.apiData);
          resolve(this.apiData);
        }, reject);
    });
  }
}
