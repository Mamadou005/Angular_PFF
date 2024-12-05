import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import {Echeanche, Sujet} from 'app/main/apps/sujet/sujet.model'; // Modification pour utiliser le modèle Sujet
import { SujetService } from '../../sujet.service';
import {AuthenticationService} from "../../../../../auth/service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-sujet-right-sidebar',
  templateUrl: './sujet-right-sidebar.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SujetRightSidebarComponent implements OnInit {
  public isDataEmpty: boolean = false;
  public sujet: Sujet = new Sujet(); // Initialisation correcte de l'objet Sujet
  public isCreatingSujet: boolean = false;
  public errorMessage: string = ''; // Message d'erreur
  public selectTags: any;
  public selectAssignee: any;
  public listeEcheances: Echeanche[] = [];




  //@ViewChild('dueDateRef') private dueDateRef: any;

  constructor(
      private _sujetService: SujetService,
      private _coreSidebarService: CoreSidebarService,
      private authenticationService: AuthenticationService,
  ) {}
  showForm = false;
  ngOnInit(): void {
    // Récupération des sujets avec abonnement
    if(this.sujet == null){
      this.sujet = new Sujet();
    }
    this._sujetService.getSujetsList().subscribe({
      next: (response) => {
        if (response && this.isSujet(response)) {
          this.sujet = response; 
          this.isDataEmpty = false;
        } else {
          this.isDataEmpty = true;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des sujets', error);
      }
    });

    // Abonnement aux changements de tags et assignés
    this._sujetService.onFiltersChange.subscribe((filters) => {
      this.selectTags = filters.map(filter => filter.handle);
      this.selectAssignee = filters.find(filter => filter.field === 'assignee');
    });

    this._sujetService.getAllEcheances().subscribe({
      next: (data: Echeanche[]) => {
        this.listeEcheances = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des échéances :', err);
      }
    });

  }

  closeSidebar() {
    this._coreSidebarService.getSidebarRegistry('sujet-sidebar-right').toggleOpen();
  }

  // updateSujet() {
  //   const dateSoumission = this.dueDateRef?.flatpickrElement?.nativeElement?.children[0]?.value;
  //   if (dateSoumission) {
  //     this.sujet.titre = titre;
  //     this._sujetService.updateCurrentSujet(this.sujet).subscribe(() => {
  //       this.closeSidebar();
  //     });
  //   }
  // }

  // addSujet(sujetForm: NgForm) {
  //   if (sujetForm.valid) {
  //     const dateSoumission = this.dueDateRef?.flatpickrElement?.nativeElement?.children[0]?.value;
  //     if (dateSoumission) {
  //       this.sujet.dateSoumission = dateSoumission;
  //       this._sujetService.createNewSujet(this.sujet).subscribe(() => {
  //         this.closeSidebar();
  //       });
  //     }
  //   }
  // }

  deleteSujet() {
    if (this.sujet.id) {
      this._sujetService.deleteSujet(this.sujet.id).subscribe(() => {
        this.closeSidebar();
      });
    }
  }

  // toggleComplete() {
  //   this.sujet.etatSoumission = this.sujet.etatSoumission === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
  //   this._sujetService.updateCurrentSujet(this.sujet).subscribe(() => {
  //     this.closeSidebar();
  //   });
  // }

  // toggleImportant() {
  //   this.sujet.etatSoumission = this.sujet.etatSoumission === 'IMPORTANT' ? 'NORMAL' : 'IMPORTANT';
  //   this._sujetService.updateCurrentSujet(this.sujet).subscribe(() => {
  //     this.closeSidebar();
  //   });
  // }

  onSubmit(sujetForm: NgForm): void {
    if (sujetForm.valid) {
      console.log('Formulaire soumis', this.sujet);
    }
  }

  toggleSidebar(nameRef: string): void {
    const sidebar = this._coreSidebarService.getSidebarRegistry(nameRef);

    if (sidebar) {
      sidebar.toggleOpen();
    } else {
      console.error(`Le registre du sidebar avec le nom '${nameRef}' est introuvable.`);
    }
  }

  private isSujet(response: any): response is Sujet {
    return response && typeof response === 'object' && 'id' in response;
  }

  createNewSujet(): void {
    this.sujet.encadreur ={ id :  this.authenticationService.currentUserValue.id};
    this.isCreatingSujet = true;
    this.sujet.echeance = JSON.parse (this.sujet.echeance) ;
    this._sujetService.createNewSujet(this.sujet).subscribe(
        (createdSujet) => {
          this._sujetService.getSujetsList().subscribe(
              sujets => {
                this._sujetService.tempSujets = sujets;
                this._sujetService.onSujetDataChange.next(this._sujetService.tempSujets);
              }
          );
          this.isCreatingSujet = false;
          this._coreSidebarService.getSidebarRegistry('sujet-sidebar-right')?.close();
          this._coreSidebarService.getSidebarRegistry('sujet-sidebar-right')?.toggleCollapsible();
          this.showForm = false;
        },
        (error) => {
          this.isCreatingSujet = false;
          this.errorMessage = 'Erreur lors de la création du sujet : ' + (error.message || 'Erreur inconnue');
          console.error('Erreur lors de la création du sujet :', error);
        }
    );
  }
  convert(echeance: any) {
    return JSON.stringify(echeance);
  }

}
