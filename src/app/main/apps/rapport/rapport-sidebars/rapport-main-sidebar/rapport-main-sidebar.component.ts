import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Rapport } from 'app/main/apps/rapport/rapport.model';
import { RapportService } from 'app/main/apps/rapport/rapport.service';


@Component({
  selector: 'app-rapport-main-sidebar',
  templateUrl: './rapport-main-sidebar.component.html'
})
export class RapportMainSidebarComponent implements OnInit {
  public filters: Array<any> = [];
  public rapports: Rapport[] = [];
  public isLoading: boolean = false;
  public isCreatingRapport: boolean = false;
  public errorMessage: string = '';
  public fileToUpload: File | null = null;
  public rapport: Rapport;
  public showForm: boolean = false;
  public selectedFile: File | null = null;
  @ViewChild('form')
  form: NgForm;

  constructor(
    private _coreSidebarService: CoreSidebarService,
    private _rapportService: RapportService
  ) {}

  ngOnInit(): void {
    this.loadRapports();
    this._rapportService.getFilters().subscribe((filters) => {
      this.filters = filters;
      this.applyFilters();
    });
    this._rapportService.onRapportDataChange.subscribe((rapports) => {
      this.rapports = rapports;
    });
  }

  loadRapports(): void {
    this.isLoading = true;
    this._rapportService.getInitialRapports().subscribe(
      (rapports) => {
        this.isLoading = false;
        this.rapports = rapports || [];
        this._rapportService.tempRapports = rapports;
        this._rapportService.onRapportDataChange.next(rapports);
      },
      (error) => {
        this.isLoading = false;
        console.error('Erreur lors du chargement des rapports :', error);
      }
    );
  }

  handleFileInput(files: FileList): void {
    if (files.length > 0) {
      this.fileToUpload = files.item(0);
    }
  }

  

  applyFilters(): void {
    this._rapportService.applyFilters();
  }

  addRapport(rapportForm: NgForm) {
    console.log("rapport form ",rapportForm.value);
    if (rapportForm.valid && this.selectedFile) {
      console.log("rapportA "+this.rapport)
      
      
        
        // Appel à la méthode createRapport avec rapport et fichier
        this._rapportService.createRapport(this.rapport, this.selectedFile).subscribe(() => {
          
        });
      
    } else {
      console.error('Formulaire invalide ou fichier manquant');
    }
  }

  toggleSidebar(nameRef: string): void {
    this._coreSidebarService.getSidebarRegistry(nameRef).toggleOpen();
  }

  resetFilters(): void {
    this.filters = [];
    this._rapportService.setFilters(this.filters);
    this.loadRapports();
  }

  createNewRapportForm(): void {
    this.showForm = true;
  }
}
