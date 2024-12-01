import { Component, OnInit } from '@angular/core';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Rapport } from 'app/main/apps/rapport/rapport.model';
import { RapportService } from 'app/main/apps/rapport/rapport.service';

@Component({
  selector: 'app-rapport-main-sidebar',
  templateUrl: './rapport-main-sidebar.component.html'
})
export class RapportMainSidebarComponent implements OnInit {
  public filters: Array<any> = []; // Liste dynamique des filtres
  public rapports: Rapport[] = []; // Liste des rapports
  public isLoading: boolean = false; // Indicateur de chargement
  public isCreatingRapport: boolean = false; // Indicateur de création de rapport en cours
  public errorMessage: string = ''; // Message d'erreur

  constructor(
    private _coreSidebarService: CoreSidebarService,
    private _rapportService: RapportService
  ) {}
  rapport: any = {};
  showForm = false;

  ngOnInit(): void {
    // Charger les données initiales
    this.loadRapports();

    // Réagir aux changements de filtres
    this._rapportService.getFilters().subscribe((filters) => {
      this.filters = filters;
      this.applyFilters(); // Appliquer les filtres dynamiquement
    });

    // Mise à jour en temps réel des rapports
    this._rapportService.onRapportDataChange.subscribe((rapports) => {
      this.rapports = rapports;
    });
  }

  // Charger les rapports initiaux
  loadRapports(): void {
    this.isLoading = true;
    this._rapportService.getInitialRapports().subscribe(
      (rapports) => {
        this.isLoading = false;
        this.rapports = rapports || []; // Ensure rapports is never undefined
        this._rapportService.tempRapports = rapports;
        this._rapportService.onRapportDataChange.next(rapports);
      },
      (error) => {
        this.isLoading = false;
        console.error('Erreur lors du chargement des rapports :', error);
      }
    );
  }
  

  // Appliquer les filtres en temps réel
  applyFilters(): void {
    this._rapportService.applyFilters(); // Appeler la logique du service pour filtrer les rapports
  }

  // Créer un nouveau rapport et mettre à jour la liste
  createNewRapport(): void {
    const newRapport: Partial<Rapport> = {
      titre: this.rapport.titre,
      dateSoumission: this.rapport.dateSoumission, // Assurez-vous que c'est un format valide de date
      contenu: this.rapport.contenu,
      etatSoumission: 'EN_ATTENTE'
    };
  
    this.isCreatingRapport = true;
  
    this._rapportService.createRapport(newRapport as Rapport).subscribe(
      (createdRapport) => {
        // Ajoute le rapport créé à la liste
        this._rapportService.tempRapports.push(createdRapport);
        this._rapportService.onRapportDataChange.next(this._rapportService.tempRapports);
  
        // Réinitialiser l'état de création du rapport
        this.isCreatingRapport = false;
  
        // Fermer la sidebar après la création du rapport
        this._coreSidebarService.getSidebarRegistry('rapport-sidebar-right')?.close();
        this._coreSidebarService.getSidebarRegistry('rapport-sidebar-right')?.toggleCollapsible();
  
        // Cacher le formulaire après création
        this.showForm = false;
      },
      (error) => {
        this.isCreatingRapport = false;
        this.errorMessage = 'Erreur lors de la création du rapport : ' + (error.message || 'Erreur inconnue');
        console.error('Erreur lors de la création du rapport :', error);
      }
    );
  }
  
  
  
  

  // Basculer l'état d'ouverture d'une sidebar
  toggleSidebar(nameRef: string): void {
    this._coreSidebarService.getSidebarRegistry(nameRef).toggleOpen();
  }

  // Réinitialiser les filtres et recharger les rapports
  resetFilters(): void {
    this.filters = [];
    this._rapportService.setFilters(this.filters); // Réinitialiser les filtres dans le service
    this.loadRapports(); // Recharger les rapports initiaux
  }

  // Afficher le formulaire de création de rapport
  createNewRapportForm() {
    this.showForm = true;
    console.log("Formulaire de création de rapport ouvert");
  }
  
  
}
