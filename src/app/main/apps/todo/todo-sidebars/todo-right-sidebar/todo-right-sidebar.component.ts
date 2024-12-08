import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { Todo } from 'app/main/apps/todo/todo.model';
import { TodoService } from 'app/main/apps/todo/todo.service';
import {Echeanche} from "../../../sujet/sujet.model";
import {AuthenticationService} from "../../../../../auth/service";

@Component({
  selector: 'app-todo-right-sidebar',
  templateUrl: './todo-right-sidebar.component.html',
  encapsulation: ViewEncapsulation.None
})
export class TodoRightSidebarComponent implements OnInit {
  // Public
  public isDataEmpty;
  public sujet: any;
  public tags;
  public selectTags;
  public selectEncadreur;
  public selectEtudiant;

  public isEtudiant: boolean = false;

  @ViewChild('dueDateRef') private dueDateRef: any;

  public listeEcheances: any[];

  /**
   * Constructor
   *
   * @param {TodoService} _todoService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _todoService: TodoService, private _coreSidebarService: CoreSidebarService, private authService: AuthenticationService) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Close Sidebar
   */
  closeSidebar() {
    this._coreSidebarService.getSidebarRegistry('todo-sidebar-right').toggleOpen();
  }

  /**
   * Update Todo
   */
  updateTodo() {
    //! Fix: Temp fix till ng2-flatpicker support ng-modal (Getting NG0100: Expression has changed after it was checked error if we use ng-model with ng2-flatpicker)
    /* this.sujet.echeanche = JSON.parse(this.sujet.echeanche);
    *this.sujet.etudiants = this.sujet.etudiants.map(id =>  {
       return {
         id: id,
       }
     })*/
    this._todoService.updateCurrentTodo(this.sujet);
    this.closeSidebar();
  }

  /**
   * Add Todo
   */
  addTodo(todoForm) {
    if (todoForm.valid) {
      //! Fix: Temp fix till ng2-flatpicker support ng-modal
      /* this.sujet.echeanche = JSON.parse(this.sujet.echeanche);
      *this.sujet.etudiants = this.sujet.etudiants.map(id =>  {
         return {
           id: id,
         }
       })*/
      this._todoService.updateCurrentTodo(this.sujet);
      this.closeSidebar();
    }
  }

  /**
   * Delete Todo
   */
  deleteTodo() {
    this.sujet.deleted = !this.sujet.deleted;
    this._todoService.updateCurrentTodo(this.sujet);
    this.closeSidebar();
  }

  /**
   * Toggle Complete
   */
  toggleComplete() {
    this.sujet.completed = !this.sujet.completed;
    this._todoService.updateCurrentTodo(this.sujet);
    this.closeSidebar();
  }

  /**
   * Toggle Important
   */
  toggleImportant() {
    this.sujet.important = !this.sujet.important;
    this._todoService.updateCurrentTodo(this.sujet);
    this.closeSidebar();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.isEtudiant = this.authService.currentUserValue.role.includes("ETUDIANT")
    this._todoService.onCurrentTodoChange.subscribe(response => {
      if (Object.keys(response).length > 0) {
        this.sujet = response;
        this.isDataEmpty = false;
      } else {
        this.sujet = new Todo();

        this.isDataEmpty = true;
      }
    });
    this._todoService.onTagsChange.subscribe(response => {
      this.selectTags = response.map(tagRef => {
        return tagRef.handle;
      });
    });

    this._todoService.onEncadreurChange.subscribe(assigneeRef => {
      this.selectEncadreur = assigneeRef;
    });

    this._todoService.onEtudiantChange.subscribe(assigneeRef => {
      this.selectEtudiant = assigneeRef;
    });


    this._todoService.getAllEcheances().subscribe({
      next: (data: Echeanche[]) => {
        this.listeEcheances = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des échéances :', err);
      }
    });
  }

  convert(echeance: any) {
    return JSON.stringify(echeance);
  }

  getLibelle() {
    return this.isEtudiant ? "Rejoindre un Groupe" : "Gestion de Sujet";
  }

  onRemove($event) {
  }
}
