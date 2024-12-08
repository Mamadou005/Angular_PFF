import { Component } from '@angular/core';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { RapportService } from 'app/main/apps/rapport/rapport.service';
import { Rapport } from '../../rapport.model';

@Component({
  selector: 'app-rapport-main-sidebar',
  templateUrl: './rapport-main-sidebar.component.html',
})
export class RapportMainSidebarComponent {
  public showForm: boolean = false;
  public filters: any[] = [];
  public selectedFile: File | null = null;

  constructor(
    private _coreSidebarService: CoreSidebarService,
    private _rapportService: RapportService
  ) {}

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  handleFileInput(files: FileList): void {
    if (files.length > 0) {
      this.selectedFile = files.item(0);
    }
  }

  addRapport(form: any): void {
    if (form.valid && this.selectedFile) {
      const rapport: Rapport = {
        titre: form.value.titre,
        contenuUrl: '', 
        dateSoumission: new Date(),
        etatSoumission: 'EN_ATTENTE',
      };
  
      this._rapportService.uploadFileToMinIO(this.selectedFile).subscribe(
        (fileUrl: string) => {
          console.log('URL du fichier uploadé reçu:', fileUrl);
          rapport.contenuUrl = fileUrl;  
      
          this._rapportService.addRapport(rapport).subscribe(
            (response) => {
              console.log('Réponse après ajout du rapport:', response);
              alert("Rapport ajouté avec succès !");
              this.showForm = false;
              form.reset();
            },
            (error) => {
              console.error('Erreur lors de l\'ajout du rapport:', error);
              alert(`Erreur lors de l'ajout du rapport : ${error.message}`);
            }
          );
        },
        (error) => {
          console.error('Erreur lors de l\'upload du fichier:', error);
          alert(`Erreur lors de l'upload du fichier : ${error.message}`);
        }
      );
      
    } else {
      alert('Le formulaire est invalide ou aucun fichier n\'a été sélectionné.');
    }
  }
  
  
  

  toggleSidebar(nameRef: string): void {
    const sidebar = this._coreSidebarService.getSidebarRegistry(nameRef);
    if (sidebar) {
      sidebar.toggleOpen();
    }
  }
}
