import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {Echeanche, Sujet} from './sujet.model';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable()
export class SujetService implements Resolve<any> {


  // Public
  public sujets: Sujet[];
  public echeances: Echeanche[];
  public assignee;
  public filters;
  public tags;
  public tempSujets: Sujet[];
  public currentSujet;
  public sortParamRef = 'id';

  public onSujetDataChange: BehaviorSubject<any>;
  public onCurrentSujetChange: BehaviorSubject<any>;
  public onAssigneeChange: BehaviorSubject<any>;
  public onFilterChange: BehaviorSubject<any>;
  public onTagChange: BehaviorSubject<any>;
  public onSearchQueryChange: BehaviorSubject<any>;
  public onFiltersChange: BehaviorSubject<any>;
  public onTagsChange: BehaviorSubject<any>;

  // Private
  private apiUrl: string = environment.apiUrl;
  private filtersSubject = new BehaviorSubject<any[]>([]);
  filters$ = this.filtersSubject.asObservable();
  private routeParams: any;
  private sortSujetRef = key => (a, b) => {
    let fieldA;
    let fieldB;

    // If sorting is by dueDate => Convert data to date
    if (key === 'dueDate') {
      fieldA = new Date(a[key]);
      fieldB = new Date(b[key]);
    }

    // If sorting is by assignee => Use `fullName` of assignee
    else if (key === 'assignee') {
      fieldA = a.assignee ? a.assignee.fullName : null;
      fieldB = b.assignee ? b.assignee.fullName : null;
    } else {
      fieldA = a[key];
      fieldB = b[key];
    }

    let comparison = 0;

    if (fieldA === fieldB) {
      comparison = 0;
    } else if (fieldA === null) {
      comparison = 1;
    } else if (fieldB === null) {
      comparison = -1;
    } else if (fieldA > fieldB) {
      comparison = 1;
    } else if (fieldA < fieldB) {
      comparison = -1;
    }

    return comparison;
  };

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    this.onSujetDataChange = new BehaviorSubject({});
    this.onCurrentSujetChange = new BehaviorSubject({});
    this.onAssigneeChange = new BehaviorSubject({});
    this.onFilterChange = new BehaviorSubject({});
    this.onTagChange = new BehaviorSubject({});
    this.onSearchQueryChange = new BehaviorSubject({});
    this.onFiltersChange = new BehaviorSubject({});
    this.onTagsChange = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getSujetsList(), this.getFilters(), this.getTags(), this.getAssignee()]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get Sujets List
   *
   * @returns {Promise<Sujet[]>}
   */
  getSujetsList(): Observable<any[]> {
    return this._httpClient.get<any[]>(this.apiUrl + '/api/sujets');
  }

  /**
   * Get Filters
   */
  getFilters(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      this._httpClient.get('api/sujets-filters').subscribe(
          (filters: any[]) => {
            this.filters = filters;
            this.onFiltersChange.next(this.filters);
            observer.next(filters);
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
      );
    });
  }

  /**
   * Get Tags
   */
  getTags() {
    return new Promise<void>((resolve, reject) => {
      this._httpClient.get('api/sujets-tags').subscribe((tags: any) => {
        this.tags = tags;
        this.onTagsChange.next(this.tags);
        resolve();
      }, reject);
    });
  }

  /**
   * Get Sujets By Filter
   *
   * @param filterHandel
   */
  getSujetsByFilter(filterHandel): Promise<any[]> {
    let param;
    // Setup param for filter
    if (filterHandel === 'all') {
      param = 'deleted=false';
    } else if (filterHandel === 'deleted') {
      param = filterHandel + '=true';
    } else {
      param = filterHandel + '=true' + '&&deleted=false';
    }

    return new Promise((resolve, reject) => {
      this._httpClient.get('api/sujets-data?' + param).subscribe((sujets: any) => {
        this.sujets = sujets;
        this.tempSujets = sujets;
        this.onSujetDataChange.next(this.sujets);
        this.sortSujets(this.sortParamRef);
        resolve(this.sujets);
      }, reject);
    });
  }

  /**
   * Get Sujets By Tag
   *
   * @param tagHandel
   */
  getSujetsByTag(tagHandel): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/sujets-data?tags=' + tagHandel).subscribe((sujets: any) => {
        this.sujets = sujets;
        this.tempSujets = sujets;
        this.onSujetDataChange.next(this.sujets);
        this.sortSujets(this.sortParamRef);
        resolve(this.sujets);
      }, reject);
    });
  }

  /**
   * Get Sujets Assignee
   *
   */
  getAssignee(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/sujets-assignee').subscribe((assignee: any) => {
        this.assignee = assignee;
        this.onAssigneeChange.next(this.assignee);
        resolve(this.sujets);
      }, reject);
    });
  }

  /**
   * Get Sujets By Search
   *
   * @param query
   */
  getSujetsBySearch(query) {
    const filteredSujets = this.tempSujets.filter(sujet => {
      return sujet.titre.toLowerCase().includes(query.toLowerCase());
    });
    this.sujets = filteredSujets;
    this.onSujetDataChange.next(this.sujets);
    this.sortSujets(this.sortParamRef);
  }

  /**
   * Create New Sujet
   */
  createNewSujet(newSujet: Sujet): Observable<Sujet> {
    return this._httpClient.post<Sujet>(this.apiUrl + '/api/sujets', newSujet);
  }

  /**
   * Set Current Sujet
   *
   * @param id
   */
  setCurrentSujet(id) {
    this.currentSujet = this.sujets.find(sujet => {
      return sujet.id === id;
    });
    this.onCurrentSujetChange.next(this.currentSujet);
  }

  /**
   * Update Current Sujet
   *
   * @param sujet
   */
  updateCurrentSujet(sujet) {
    if (sujet.id === undefined) {
      this.currentSujet = sujet;
      this.onCurrentSujetChange.next(this.currentSujet);
      this.postNewSujet();
    } else {
      this.currentSujet = sujet;
      this.onCurrentSujetChange.next(this.currentSujet);
      this.postSujet();
    }
  }

  /**
   * Post Sujet (Update Sujet to fake-db)
   */
  postSujet() {
    return new Observable((observer) => {
      this._httpClient.post(this.apiUrl + '/api/sujets/' + this.currentSujet.id, {...this.currentSujet})
          .subscribe(
              (response) => {

                this.getSujetsList().subscribe(
                    (sujets) => {
                      observer.next(sujets);
                      observer.complete();
                    },
                    (error) => {
                      observer.error(error);
                    }
                );
              },
              (error) => {
                observer.error(error);
              }
          );
    });
  }


  /**
   * Post New Sujet (Add Sujet to fake-db)
   *
   * NOTE: In this POST request fakeDB will automatically assign a ID to new Object
   */
  postNewSujet() {
    return new Observable((observer) => {
      this._httpClient.post(this.apiUrl + '/api/sujets/', this.currentSujet).subscribe(
          (response) => {
            this.getSujetsList().subscribe(
                (sujets) => {
                  this.sortSujets(this.sortParamRef);
                  observer.next(sujets);
                  observer.complete();
                },
                (error) => {
                  observer.error(error);
                }
            );
          },
          (error) => {
            observer.error(error);
          }
      );
    });
  }


  /**
   * Sort Sujets
   *
   * @param sortByParam
   */
  sortSujets(sortByParam) {
    this.sortParamRef = sortByParam;
    let sortDesc = true;

    const sortBy = (() => {
      if (sortByParam === 'title-asc') {
        sortDesc = false;
        return 'title';
      }
      if (sortByParam === 'title-desc') return 'title';
      if (sortByParam === 'assignee') {
        sortDesc = false;
        return 'assignee';
      }
      if (sortByParam === 'due-date') {
        sortDesc = false;
        return 'dueDate';
      }
      return 'id';
    })();

    if (sortByParam !== null) {
      this.sujets.sort(this.sortSujetRef(sortBy));
      this.onSujetDataChange.next(this.sujets);
    }
  }

  applyFilters(): void {
    if (this.filters && this.filters.length > 0) {
      this.sujets = this.sujets.filter(sujet => {
        // Implémenter la logique de filtrage ici
        return this.filters.every(filter => {
          // Exemple de filtrage basé sur les critères
          return sujet[filter.key] === filter.value;
        });
      });
    } else {
      // Si aucun filtre n'est appliqué, réinitialiser la liste des sujets
      this.sujets = [...this.tempSujets];
    }
  }

  setFilters(filters: any[]) {
    this.filtersSubject.next(filters);
  }

  deleteSujet(sujetId: number): Observable<void> {
    return this._httpClient.delete<void>(this.apiUrl + `/api/sujets/${sujetId}`).pipe(
        catchError(error => {
          console.error('Erreur lors de la suppression du sujet :', error);
          return throwError(error);
        })
    );
  }

  getSujetById(sujetId: number): Observable<Sujet> {
    return this._httpClient.get<Sujet>(this.apiUrl + `/api/sujets/${sujetId}`).pipe(
        catchError(error => {
          console.error('Erreur lors de la recuperation du sujet :', error);
          return throwError(error);
        })
    );
  }

  getAllEcheances(): Observable<Echeanche[]> {
    return this._httpClient.get<Echeanche[]>(`${this.apiUrl}/api/echeances`).pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des échéances :', error);
          return throwError(() => error);
        })
    );
  }
}
