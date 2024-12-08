import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Rapport } from './rapport.model';


interface UploadResponse {
  fileUrl: string;
}

@Injectable({
  providedIn: 'root',
})


export class RapportService {
  private readonly API_URL = 'http://localhost:8080/api/rapport';
  private readonly MINIO_API_URL = 'http://localhost:8080/api/oss';

  public rapports: Rapport[] = [];
  public tempRapports: Rapport[] = [];
  private currentRapport = new BehaviorSubject<any | null>(null);


  public onRapportDataChange = new BehaviorSubject<Rapport[]>([]);
  public onFiltersChange = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}

  uploadFileToMinIO(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.MINIO_API_URL}/upload`, formData).pipe(
        map((response: any) => {
          if (response && response.url) {
            return response.url;
          }
          throw new Error(`Réponse inattendue : ${JSON.stringify(response)}`);
        }),
        catchError((error) => {
          console.error('Erreur lors de l\'upload:', error);
          return throwError(() => new Error('Erreur lors de l\'upload du fichier'));
        })
    );
  }




  addRapport(rapport: Rapport): Observable<any> {
    return this.http.post(`${this.API_URL}`, rapport).pipe(
        tap((response) => console.log('Réponse du backend après ajout du rapport:', response)),
        catchError((error) => {
          console.error('Erreur dans addRapport:', error);
          return throwError(() => new Error('Erreur lors de l\'ajout du rapport: ' + (error.message || error)));
        })
    );
  }






  getInitialRapports(): Observable<Rapport[]> {
    return this.http.get<Rapport[]>(this.API_URL).pipe(catchError(this.handleError));
  }

  updateCurrentRapport(rapport: Rapport): Observable<Rapport> {
    return this.http.put<Rapport>(`${this.API_URL}/${rapport.id}`, rapport).pipe(catchError(this.handleError));
  }

  deleteRapport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(catchError(this.handleError));
  }

  applyFilters(): void {
    this.rapports = this.tempRapports.filter((rapport) =>
        this.onFiltersChange.value.every((filter) => rapport[filter.field] === filter.value)
    );
    this.onRapportDataChange.next(this.rapports);
  }

  handleError(error: any): Observable<never> {
    // Vérifier si l'erreur a un message
    const errorMessage = error?.message || (error?.error?.message) || 'Une erreur inconnue est survenue';
    console.error('Erreur lors de l\'ajout du rapport:', errorMessage);
    alert(`Une erreur est survenue: ${errorMessage}`);
    return throwError(() => new Error(errorMessage));
  }



  getRapportById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  setCurrentRapport(idRef: number): void {
    const foundRapport = this.rapports.find((rapport) => rapport.id === idRef);
    this.currentRapport.next(foundRapport || null);
    console.log('Rapport actuel:', foundRapport);
  }

  getRapportsBySearch(query: string): any[] {
    return this.rapports.filter((rapport) =>
        rapport.titre.toLowerCase().includes(query.toLowerCase())
    );
  }

  sortRapports(sortRef: string): void {
    if (sortRef === 'asc') {
      this.rapports.sort((a, b) => a.titre.localeCompare(b.titre));
    } else if (sortRef === 'desc') {
      this.rapports.sort((a, b) => b.titre.localeCompare(a.titre));
    }
    console.log('Rapports triés:', this.rapports);
  }
}