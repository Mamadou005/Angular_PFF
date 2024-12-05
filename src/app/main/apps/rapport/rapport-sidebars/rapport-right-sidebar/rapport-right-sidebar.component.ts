import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Rapport } from 'app/main/apps/rapport/rapport.model';
import { RapportService } from 'app/main/apps/rapport/rapport.service';

@Component({
  selector: 'app-rapport-right-sidebar',
  templateUrl: './rapport-right-sidebar.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RapportRightSidebarComponent implements OnInit {
  public isDataEmpty: boolean = false;
  public rapport: Rapport = new Rapport();  
  public selectedFile: File | null = null;  // Variable pour stocker le fichier sélectionné

  public selectTags: any;
  public selectAssignee: any;

  @ViewChild('dueDateRef') private dueDateRef: any;

  constructor(private _rapportService: RapportService, private _coreSidebarService: CoreSidebarService) {}

  ngOnInit(): void {
    // Récupération des rapports avec abonnement
    this._rapportService.getInitialRapports().subscribe({
      next: (response) => {
        if (response && this.isRapport(response)) {
          this.rapport = response;  // Assurez-vous que 'response' est du type 'Rapport'
          this.isDataEmpty = false;
        } else {
          this.isDataEmpty = true;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des rapports', error);
      }
    });

    // Abonnement aux changements de tags et assignés
    this._rapportService.onFiltersChange.subscribe((filters) => {
      this.selectTags = filters.map(filter => filter.handle); 
      this.selectAssignee = filters.find(filter => filter.field === 'assignee');
    });
  }

  // Vérification que l'objet est bien un rapport
  private isRapport(obj: any): obj is Rapport {
    return 'titre' in obj && 'dateSoumission' in obj && 'contenuUrl' in obj && 'etatSoumission' in obj;
  }

  // Capture du fichier sélectionné
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Fermeture du sidebar
  closeSidebar() {
    this._coreSidebarService.getSidebarRegistry('rapport-sidebar-right').toggleOpen();
  }

  // Mise à jour d'un rapport
  updateRapport() {
    const dateSoumission = this.dueDateRef?.flatpickrElement?.nativeElement?.children[0]?.value;
    if (dateSoumission) {
      this.rapport.dateSoumission = dateSoumission;
      this._rapportService.updateCurrentRapport(this.rapport).subscribe(() => {
        this.closeSidebar();
      });
    }
  }

  // Création d'un nouveau rapport
  addRapport(rapportForm: NgForm) {
    console.log("rapport form ",rapportForm.value);
    if (rapportForm.valid && this.selectedFile) {
      console.log("rapportA "+this.rapport)
      const dateSoumission = this.dueDateRef?.flatpickrElement?.nativeElement?.children[0]?.value;
      if (dateSoumission) {
        this.rapport.dateSoumission = dateSoumission;
        
        // Appel à la méthode createRapport avec rapport et fichier
        this._rapportService.createRapport(this.rapport, this.selectedFile).subscribe(() => {
          this.closeSidebar();
        });
      }
    } else {
      console.error('Formulaire invalide ou fichier manquant');
    }
  }

  // Suppression d'un rapport
  deleteRapport() {
    if (this.rapport.id) {
      this._rapportService.deleteRapport(this.rapport.id).subscribe(() => {
        this.closeSidebar();
      });
    }
  }

  // Changement de l'état "completed"
  toggleComplete() {
    this.rapport.etatSoumission = this.rapport.etatSoumission === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    this._rapportService.updateCurrentRapport(this.rapport).subscribe(() => {
      this.closeSidebar();
    });
  }

  // Changement de l'état "important"
  toggleImportant() {
    this.rapport.etatSoumission = this.rapport.etatSoumission === 'IMPORTANT' ? 'NORMAL' : 'IMPORTANT';
    this._rapportService.updateCurrentRapport(this.rapport).subscribe(() => {
      this.closeSidebar();
    });
  }

  // Soumission du formulaire (juste pour affichage ici)
  onSubmit(rapportForm: NgForm): void {
    if (rapportForm.valid) {
      console.log('Formulaire soumis', this.rapport);
    }
  }

  // Fonction pour basculer l'affichage du sidebar
  toggleSidebar(nameRef: string): void {
    const sidebar = this._coreSidebarService.getSidebarRegistry(nameRef);
  
    if (sidebar) {
      sidebar.toggleOpen();
    } else {
      console.error(`Le registre du sidebar avec le nom '${nameRef}' est introuvable.`);
    }
  }
}
