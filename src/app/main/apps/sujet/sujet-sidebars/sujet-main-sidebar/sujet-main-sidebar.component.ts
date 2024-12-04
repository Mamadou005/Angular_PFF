import { Component, OnInit } from '@angular/core';
import { Sujet } from '../../sujet.model';
import { SujetService } from '../../sujet.service';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import {AuthenticationService} from "../../../../../auth/service";


@Component({
  selector: 'app-sujet-main-sidebar',
  templateUrl: './sujet-main-sidebar.component.html'
})
export class SujetMainSidebarComponent implements OnInit {
  public filters: Array<any> = []; // Liste dynamique des filtres
  public sujets: Sujet[] = []; // Liste des sujets
  public tempSujets: Sujet[] = [];
  public isLoading: boolean = false; // Indicateur de chargement
  public isCreatingSujet: boolean = false; // Indicateur de création de sujet en cours
  public errorMessage: string = ''; // Message d'erreur

  constructor(
    private _coreSidebarService: CoreSidebarService,
    private _sujetService: SujetService,
    private authenticationService: AuthenticationService,
  ) {}

  sujet: any = {};
  showForm = false;

  ngOnInit(): void {
    // Charger les données initiales
    this.loadSujets();

    // Réagir aux changements de filtres
    this._sujetService.getFilters().subscribe((filters) => {
      this.filters = filters;
      this.applyFilters(); 
    });

    // Mise à jour en temps réel des sujets
    this._sujetService.onSujetDataChange.subscribe((sujets) => {
      this.sujets = sujets;
    });
  }

  // Charger les sujets initiaux
  loadSujets(): void {
    this.isLoading = true;
    this._sujetService.getSujetsList().subscribe(
      (sujets) => {
        this.isLoading = false;
        this.sujets = sujets || []; // Ensure sujets is never undefined
        this._sujetService.tempSujets = sujets;
        this._sujetService.onSujetDataChange.next(sujets);
      },
      (error) => {
        this.isLoading = false;
        console.error('Erreur lors du chargement des sujets :', error);
      }
    );
  }

  applyFilters(): void {
    this._sujetService.applyFilters(); 
  }

  createSujet(nameRef, closeNameRef): void {
    this._coreSidebarService.getSidebarRegistry(nameRef).toggleOpen();
    this._coreSidebarService.getSidebarRegistry(closeNameRef).toggleOpen();
    //this._sujetService.createNewSujet();
  }

  // Basculer l'état d'ouverture d'une sidebar
  toggleSidebar(nameRef: string): void {
    this._coreSidebarService.getSidebarRegistry(nameRef).toggleOpen();
  }

  // Réinitialiser les filtres et recharger les sujets
  resetFilters(): void {
    this.filters = [];
    this._sujetService.setFilters(this.filters); 
    this.loadSujets();
  }

  // Afficher le formulaire de création de sujet
  createNewSujetForm() {
    this.showForm = true;
    console.log("Formulaire de création de sujet ouvert");
  }


}
