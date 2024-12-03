import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { Sujet } from 'app/main/apps/sujet/sujet.model';
import { SujetService } from 'app/main/apps/sujet/sujet.service';

@Component({
  selector: 'app-sujet-list',
  templateUrl: './sujet-list.component.html'
})
export class SujetListComponent implements OnInit {
  public sujets: Sujet[] = [];
  public searchQuery: Subject<string> = new Subject<string>();

  constructor(
    private _dragulaService: DragulaService,
    private _sujetService: SujetService,
    private _coreSidebarService: CoreSidebarService,
    private _router: Router
  ) {
    this._dragulaService.destroy('sujet-tasks-drag-area');
    this._dragulaService.createGroup('sujet-tasks-drag-area', {
      moves: (el, container, handle) => handle.classList.contains('drag-icon')
    });
  }

  toggleSidebar(nameRef: string): void {
    this._coreSidebarService.getSidebarRegistry(nameRef)?.toggleOpen();
  }

  updateSort(sortRef: string): void {
    this._sujetService.sortSujets(sortRef);
  }

  updateQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.searchQuery.next(target.value);
    }
  }

  openSujet(idRef: number): void {
    this._sujetService.setCurrentSujet(idRef);
    this._coreSidebarService.getSidebarRegistry('sujet-sidebar-right')?.toggleOpen();
  }

  ngOnInit(): void {
    this.searchQuery.pipe(debounceTime(300)).subscribe(query => {
      this._sujetService.getSujetsBySearch(query);
    });

    this._sujetService.onSujetDataChange.subscribe(sujets => {
      this.sujets = sujets;
    });

    this._sujetService.getSujetsList().subscribe({
      next: sujets => {
        this.sujets = sujets
      },
      error: err => console.error('Erreur lors du chargement des sujets:', err)
    });
  }

  editSujet(sujetId: number): void {
    // Naviguer vers la WebView en passant l'ID du sujet
    this._router.navigate(['/webview'], { queryParams: { id: sujetId } });
  }

  deleteSujet(sujetId: number): void {
    this._sujetService.deleteSujet(sujetId).subscribe({
      next: () => {
        this.sujets = this.sujets.filter(sujet => sujet.id !== sujetId);
        console.log('Sujet supprimé avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du sujet:', err);
      }
    });
  }
  

  submitSujet(sujetId: number): void {
    console.log('Soumettre sujet:', sujetId);
    // Implémenter la logique de soumission
  }
}
