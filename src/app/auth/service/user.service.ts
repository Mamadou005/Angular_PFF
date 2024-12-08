import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Utilisateur } from 'app/auth/models';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   *
   * @param {HttpClient} _http
   */
  constructor(private _http: HttpClient) {}

  /**
   * Get all users
   */
  getAll() {
    return this._http.get<Utilisateur[]>(`${environment.apiUrl}/user`);
  }

  /**
   * Get user by id
   */
  getById(id: number) {
    return this._http.get<Utilisateur>(`${environment.apiUrl}/user/${id}`);
  }
}
