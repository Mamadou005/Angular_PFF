import { Component, OnInit } from '@angular/core';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { ChatService } from 'app/main/apps/chat/chat.service';
import {AuthenticationService} from "../../../../../auth/service";

@Component({
  selector: 'app-chat-user-sidebar',
  templateUrl: './chat-user-sidebar.component.html'
})
export class ChatUserSidebarComponent implements OnInit {
  // Public
  public userProfile;
  public chats: any;
  listUser: any[];

  /**
   * Constructor
   *
   * @param _authenticationService
   * @param {ChatService} _chatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _authenticationService: AuthenticationService ,private _chatService: ChatService, private _coreSidebarService: CoreSidebarService) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Sidebar
   *
   * @param name
   */
  toggleSidebar(name) {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  createDiscussion(): void {
    this._authenticationService.currentUser.subscribe(user => {
      if (user && user.id) {
        const userId: number = user.id;

        // Initialiser `createur` si nécessaire
        if (!this.chats.createur) {
          this.chats.createur = {};  // Crée un objet vide pour 'createur'
        }

        // Affecter l'ID de l'utilisateur au créateur de la discussion
        this.chats.createur.id = userId;

        console.log('Titre:', this.chats.titre);
        console.log('Description:', this.chats.description);
        console.log('Createur:', this.chats.createur);

        // Appel au service pour créer la discussion
        this._chatService.createDiscussion(this.chats).subscribe(
            (response) => {
              console.log('Discussion créée avec succès.', response);
              this._chatService.getChats().subscribe(response => this._chatService.onChatsChange.next(response));
              this._coreSidebarService.getSidebarRegistry("chat-user-sidebar").toggleOpen();
            },
            (error) => {
              console.error('Erreur lors de la création de la discussion :', error);
            }
        );
      } else {
        console.error('Utilisateur non authentifié ou ID utilisateur introuvable.');
      }
    });
  }
  /**
   * Update User Status
   */
  updateUserStatus() {
    this._chatService.updateUserProfile(this.userProfile);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------


  /**
   * On init
   */
  ngOnInit(): void {
    this.userProfile = this._authenticationService.currentUserValue;
    this._chatService.getUser().subscribe(user => {
      this.listUser = user.filter(user => user.id !== this._authenticationService.currentUserValue.id);
    })

    this.chats = {};
  }
}
