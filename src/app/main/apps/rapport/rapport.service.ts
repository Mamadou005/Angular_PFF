import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Rapport } from './rapport.model';


@Injectable()
export class RapportService {
  public rapports: Rapport[] = [];
  public tempRapports: Rapport[] = [];
  public currentRapport: Rapport | null = null;

  public onRapportDataChange: BehaviorSubject<Rapport[]> = new BehaviorSubject<Rapport[]>([]);
  public onFiltersChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]); // Gestion des filtres

  private readonly API_URL = 'http://localhost:8080/api/rapport'; 

  constructor(private http: HttpClient) {}

  getInitialRapports(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(this.API_URL);
  }

  setFilters(filters: any[]): void {
    this.onFiltersChange.next(filters); // Notifier les abonnés des nouveaux filtres
  }

  getFilters(): Observable<any[]> {
    return this.onFiltersChange.asObservable();
  }

  applyFilters(): void {
    const filters = this.onFiltersChange.value; // Récupérer les filtres actuels
    this.rapports = this.tempRapports.filter((rapport) => {
      return filters.every((filter) => {
        return filter.field ? rapport[filter.field] === filter.value : true;
      });
    });

    this.onRapportDataChange.next(this.rapports); // Mettre à jour les abonnés
  }

  getRapportsBySearch(query: string): void {
    const filteredRapports = this.tempRapports.filter(rapport =>
      rapport.titre.toLowerCase().includes(query.toLowerCase())
    );
    this.rapports = filteredRapports;
    this.onRapportDataChange.next(this.rapports);
  }

  setCurrentRapport(id: number): void {
    this.currentRapport = this.rapports.find(rapport => rapport.id === id) || null;
  }

  sortRapports(sortBy: string): void {
    this.rapports.sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];
      return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
    });
    this.onRapportDataChange.next(this.rapports);
  }

  postRapport(rapport: Rapport): Observable<any> {
    return this.http.post(`${this.API_URL}/${rapport.id}`, rapport);
  }

  createRapport(rapport: Rapport): Observable<Rapport> {
    return this.http.post<Rapport>(`${this.API_URL}`, rapport).pipe(
      catchError((error) => {
        console.error('Erreur dans la requête HTTP:', error);
        return throwError(error); // Propager l'erreur pour la gérer dans le composant
      })
    );
  }

  deleteRapport(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  updateCurrentRapport(rapport: Rapport): Observable<any> {
    return this.http.put(`${this.API_URL}/${rapport.id}`, rapport);
  }

  getRapportById(id: number): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.API_URL}/documents/${id}`);
  }
}
