import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Rapport } from 'app/main/apps/rapport/rapport.model';
import { RapportService } from 'app/main/apps/rapport/rapport.service';

@Component({
  selector: 'app-rapport-list',
  templateUrl: './rapport-list.component.html'
})
export class RapportListComponent implements OnInit {
  public rapports: Rapport[] = [];
  public searchQuery: Subject<string> = new Subject<string>();

  constructor(
      private _dragulaService: DragulaService,
      private _rapportService: RapportService,
      private _coreSidebarService: CoreSidebarService,
      private _router: Router
  ) {
    this._dragulaService.destroy('rapport-tasks-drag-area');
    this._dragulaService.createGroup('rapport-tasks-drag-area', {
      moves: (el, container, handle) => handle.classList.contains('drag-icon')
    });
  }

  toggleSidebar(nameRef: string): void {
    this._coreSidebarService.getSidebarRegistry(nameRef)?.toggleOpen();
  }

  updateSort(sortRef: string): void {
    this._rapportService.sortRapports(sortRef);
  }

  updateQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.searchQuery.next(target.value);
    }
  }

  openRapport(idRef: number): void {
    this._rapportService.setCurrentRapport(idRef);
    this._coreSidebarService.getSidebarRegistry('rapport-sidebar-right')?.toggleOpen();
  }

  ngOnInit(): void {
    this.searchQuery.pipe(debounceTime(300)).subscribe(query => {
      this._rapportService.getRapportsBySearch(query);
    });

    this._rapportService.onRapportDataChange.subscribe(rapports => {
      this.rapports = rapports;
    });

    this._rapportService.getInitialRapports().subscribe({
      next: rapports => (this.rapports = rapports),
      error: err => console.error('Erreur lors du chargement des rapports:', err)
    });
  }

  editRapport(rapportId: number): void {
    // Naviguer vers la WebView en passant l'ID du rapport
    this._router.navigate(['/webview'], { queryParams: { id: rapportId } });
  }

  deleteRapport(rapportId: number): void {
    // Supprimer un rapport
    this._rapportService.deleteRapport(rapportId).subscribe(
        () => {
          this.rapports = this.rapports.filter((rapport) => rapport.id !== rapportId);
        },
        (error) => console.error('Erreur lors de la suppression:', error)
    );
  }

  submitRapport(rapportId: number): void {
    console.log('Soumettre rapport:', rapportId);
    // Implémenter la logique de soumission
  }
}