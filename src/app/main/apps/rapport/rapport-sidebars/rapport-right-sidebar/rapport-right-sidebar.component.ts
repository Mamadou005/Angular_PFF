import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Rapport } from 'app/main/apps/rapport/rapport.model';
import { RapportService } from 'app/main/apps/rapport/rapport.service';


@Component({
  selector: 'app-rapport-right-sidebar',
  templateUrl: './rapport-right-sidebar.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class RapportRightSidebarComponent implements OnInit {
  public rapport: Rapport = new Rapport();
  public selectedFile: File | null = null;
  public rapportForm: FormGroup;
  isDataEmpty: boolean = true;

  @ViewChild('dueDateRef', { static: false }) private dueDateRef: any;

  constructor(
      private _rapportService: RapportService,
      private _coreSidebarService: CoreSidebarService,
      private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.rapportForm = this._formBuilder.group({
      titre: ['', Validators.required],
      contenuUrl: ['', Validators.required],
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  closeSidebar(): void {
    this._coreSidebarService.getSidebarRegistry('rapport-sidebar-right').toggleOpen();
  }

  updateRapport(): void {
    const dateSoumission = this.dueDateRef?.flatpickrElement?.nativeElement?.children[0]?.value;
    if (dateSoumission) {
      this.rapport.dateSoumission = dateSoumission;
      this._rapportService.updateCurrentRapport(this.rapport).subscribe(() => {
        console.log('Rapport mis à jour avec succès');
        this.closeSidebar();
      });
    }
  }

  addRapport(form: any): void {
    if (form.valid && this.selectedFile) {
      const rapport: Rapport = {
        titre: form.value.titre,
        contenuUrl: '',  // Vous devrez peut-être utiliser l'URL du fichier téléchargé
        dateSoumission: new Date(),
        etatSoumission: 'EN_ATTENTE',

      };

      console.log("rapport", rapport);


      this._rapportService.addRapport(rapport).subscribe(
          (response) => {
            console.log('Rapport ajouté avec succès:', response);
            //this.showForm = false;
            form.reset();
          },
          (error) => {
            console.error('Erreur complète:', error);  // Afficher l'objet d'erreur complet
            const errorMessage = error?.message || (error?.error?.message) || 'Une erreur inconnue est survenue';
            console.error('Erreur lors de l\'ajout du rapport:', errorMessage);
            alert(`Une erreur est survenue: ${errorMessage}`);
          }
      );
    } else {
      console.error('Formulaire invalide ou fichier manquant');
      alert('Le formulaire est invalide ou aucun fichier n\'a été sélectionné.');
    }
  }

  updateData(data: any) {
    this.isDataEmpty = !data || data.length === 0;
  }

  onSubmit(form: NgForm) {
    console.log('Form Submitted', form.value);
  }
}