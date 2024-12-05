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
  public onFiltersChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private readonly API_URL = 'http://localhost:8080/api/rapport'; 
  private readonly MINIO_API_URL = 'http://localhost:8080/oss/upload';
  

  constructor(private http: HttpClient) {}

  // Méthode pour télécharger un fichier vers MinIO
  uploadFileToMinIO(file: File, bucketName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    

    return this.http.post(`${this.MINIO_API_URL}`, formData).pipe(
      catchError((error) => {
        console.error('Erreur lors du téléchargement vers MinIO:', error);
        return throwError(error); 
      })
    );
  }

  // Méthode pour créer un rapport et uploader un fichier
  createRapport(rapport: Rapport, file: File): Observable<Rapport> {
    console.log("rapport "+ rapport);
        return this.http.post<Rapport>(`${this.API_URL}`, rapport).pipe(
          catchError((error) => {
            console.error('Erreur dans la création du rapport:', error);
            return throwError(error);
          })
        );
      
  }

  // Méthode pour obtenir tous les rapports
  getInitialRapports(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(this.API_URL);
  }

  // Méthode pour appliquer des filtres
  setFilters(filters: any[]): void {
    this.onFiltersChange.next(filters);
  }

  getFilters(): Observable<any[]> {
    return this.onFiltersChange.asObservable();
  }

  // Méthode pour appliquer les filtres aux rapports
  applyFilters(): void {
    const filters = this.onFiltersChange.value;
    this.rapports = this.tempRapports.filter((rapport) => {
      return filters.every((filter) => {
        return filter.field ? rapport[filter.field] === filter.value : true;
      });
    });
    this.onRapportDataChange.next(this.rapports);
  }

  // Méthode pour rechercher les rapports
  getRapportsBySearch(query: string): void {
    const filteredRapports = this.tempRapports.filter(rapport =>
      rapport.titre.toLowerCase().includes(query.toLowerCase())
    );
    this.rapports = filteredRapports;
    this.onRapportDataChange.next(this.rapports);
  }

  // Méthode pour définir le rapport actuel
  setCurrentRapport(id: number): void {
    this.currentRapport = this.rapports.find(rapport => rapport.id === id) || null;
  }

  // Méthode pour trier les rapports
  sortRapports(sortBy: string): void {
    this.rapports.sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];
      return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
    });
    this.onRapportDataChange.next(this.rapports);
  }

  // Méthode pour mettre à jour un rapport
  postRapport(rapport: Rapport): Observable<any> {
    return this.http.post(`${this.API_URL}/${rapport.id}`, rapport);
  }

  // Méthode pour supprimer un rapport
  deleteRapport(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  // Méthode pour mettre à jour un rapport spécifique
  updateCurrentRapport(rapport: Rapport): Observable<any> {
    return this.http.put(`${this.API_URL}/${rapport.id}`, rapport);
  }

  // Méthode pour récupérer un rapport par ID
  getRapportById(id: number): Observable<Rapport> {
    return this.http.get<Rapport>(`${this.API_URL}/documents/${id}`);
  }
}
