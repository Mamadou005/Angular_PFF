import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserListService } from './user-list.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  rows: any[] = []; // Liste des utilisateurs
  tempData: any[] = []; // Liste temporaire pour les filtres
  selectDepartement: any[] = [];
  selectedPlan: string = '';
  selectedOption: string = '10';  
  previousRoleFilter: string = '';
  previousPlanFilter: string = '';
  previousStatusFilter: string = '';
  searchTerm: string = '';
  selectedRole: string = '';
  searchValue: string = '';
  ColumnMode = ColumnMode;
  private unsubscribe$ = new Subject<void>(); // Pour se désabonner proprement
  public sidebarToggleRef = false;


  constructor(
    private userListService: UserListService,
    private _coreSidebarService: CoreSidebarService

  ) {}

  ngOnInit() {
    // Récupérer les utilisateurs et appliquer les filtres
    this.userListService.getDataTableRows().pipe(
      takeUntil(this.unsubscribe$)  // Prendre en compte le désabonnement
    ).subscribe((data) => {
      this.rows = data;
      this.tempData = [...data]; // Copier les données pour les filtrer
    });
  }

  ngOnDestroy() {
    // Se désabonner proprement pour éviter les fuites de mémoire
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Appliquer les filtres
   */
  applyFilters() {
    this.rows = this.filterRows(
      this.previousRoleFilter,
      this.previousPlanFilter,
      this.previousStatusFilter
    );
  }

  /**
   * Filtrer par rôle
   */
  filterByRole(event) {
    const filter = event ? event.value : '';
    this.previousRoleFilter = filter;
    this.applyFilters();
  }

  /**
   * Filtrer par plan
   */
  filterByPlan(event) {
    const filter = event ? event.value : '';
    this.previousPlanFilter = filter;
    this.applyFilters();
  }

  /**
   * Filtrer par statut
   */
  filterByStatus(event) {
    const filter = event ? event.value : '';
    this.previousStatusFilter = filter;
    this.applyFilters();
  }

  /**
   * Filtrer les lignes en fonction des filtres sélectionnés
   */
  filterRows(roleFilter, planFilter, statusFilter): any[] {
    return this.tempData.filter(row => {
      const isRoleMatch = roleFilter ? row.role.toLowerCase().includes(roleFilter.toLowerCase()) : true;
      const isPlanMatch = planFilter ? row.currentPlan.toLowerCase().includes(planFilter.toLowerCase()) : true;
      const isStatusMatch = statusFilter ? row.status.toLowerCase().includes(statusFilter.toLowerCase()) : true;
      return isRoleMatch && isPlanMatch && isStatusMatch;
    });
  }

  /**
   * Mettre à jour la recherche
   */
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    this.rows = this.tempData.filter(row => 
      row.fullName.toLowerCase().includes(val) ||
      row.email.toLowerCase().includes(val) ||
      row.role.toLowerCase().includes(val)
    );
  }

  /**
   * Basculer la visibilité du sidebar
   */
  // toggleSidebar(sidebarId: string): void {
  //   console.log('Toggle Sidebar: ', sidebarId);
  //   const sidebar = document.getElementById(sidebarId);
  //   if (sidebar) {
  //     sidebar.classList.toggle('open');
  //     console.log('Sidebar toggled successfully');
  //   } else {
  //     console.error('Sidebar not found');
  //   }
  // }

  /**
   * Toggle the sidebar
   *
   * @param name
   */
  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }
  
}
