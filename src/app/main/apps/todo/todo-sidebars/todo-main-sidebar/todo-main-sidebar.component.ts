import { Component, OnInit } from '@angular/core';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { TodoService } from 'app/main/apps/todo/todo.service';
import {Echeanche} from "../../../sujet/sujet.model";
import {AuthenticationService} from "../../../../../auth/service";

@Component({
  selector: 'app-todo-main-sidebar',
  templateUrl: './todo-main-sidebar.component.html'
})
export class TodoMainSidebarComponent implements OnInit {
  // Public
  public filters: Array<{}>;
  public tags: Array<{}>;
  public listeEcheances: any[];
  public isEtudiant: boolean = false;

  /**
   * Constructor
   *
   * @param {TodoService} _todoService
   * @param {CoreSidebarService} _coreSidebarService
   * @param authService
   */
  constructor(private _coreSidebarService: CoreSidebarService, private _todoService: TodoService,private authService: AuthenticationService,) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Sidebar
   *
   * @param nameRef
   */
  createNewTodo(nameRef, closeNameRef): void {
    this._coreSidebarService.getSidebarRegistry(nameRef).toggleOpen();
    this._coreSidebarService.getSidebarRegistry(closeNameRef).toggleOpen();
    this._todoService.createNewTodo();
  }



  /**
   * Toggle Sidebar
   *
   * @param nameRef
   */
  toggleSidebar(nameRef): void {
    this._coreSidebarService.getSidebarRegistry(nameRef).toggleOpen();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    this.isEtudiant = this.authService.currentUserValue.role.includes("ETUDIANT")
  this.filters = [
      {
        id: 0,
        handle: 'all',
        title: 'Mes sujets',
        icon: 'mail'
      },
      {
        id: 1,
        handle: 'important',
        title: 'Important',
        icon: 'star'
      },
      {
        id: 2,
        handle: 'completed',
        title: 'Completer',
        icon: 'check'
      },
      {
        id: 3,
        handle: 'deleted',
        title: 'supprimer',
        icon: 'trash'
      }
    ];

    this.tags = [
      {
        id: 0,
        handle: 'theorie',
        title: 'Théorie',
        color: 'bullet-info'
      },
      {
        id: 1,
        handle: 'pratique',
        title: 'Pratique',
        color: 'bullet-success'
      },
      {
        id: 2,
        handle: 'challenge',
        title: 'Challenge',
        color: 'bullet-warning'
      },
      {
        id: 3,
        handle: 'collaboratif',
        title: 'Collaboratif',
        color: 'bullet-primary'
      },
      {
        id: 4,
        handle: 'innovation',
        title: 'Innovation',
        color: 'bullet-secondary'
      }
    ];





  }
}
