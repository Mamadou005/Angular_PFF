import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { ChatService } from 'app/main/apps/chat/chat.service';
import {Discussion} from "../../DIscussion.model";

import { AuthenticationService} from "../../../../../auth/service";
import {DiscussionDTO} from "../../discussionDTO";

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html'
})
export class ChatSidebarComponent implements OnInit {
  discussion: DiscussionDTO = {
    titre: '',
    description: '',
    membres: [],
    createur: { id: 0 }
  };
  // Public
  public contacts;
  public chatUsers;
  public searchText;
  public chats: Discussion;
  public selectedIndex = null;
  public userProfile;

  /**
   * Constructor
   *
   * @param {ChatService} _chatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _authenticationService: AuthenticationService ,private _chatService: ChatService, private _coreSidebarService: CoreSidebarService) {
  }

  // Public Methods

  /**
   * Open Chat
   *
   * @param id
   * @param newChat
   */
  openChat(id) {
    this._chatService.openChat(id);

    // Reset unread Message to zero
    this.chatUsers.map(user => {
      if (user.id === id) {
        user.unseenMsgs = 0;
      }
    });
  }

  // createDiscussion(): void {
  //   console.log('Titre:', this.chats.titre);
  //   console.log('Description:', this.chats.description);
  //   console.log('Createur:', this.chats.createur);
  //   this._chatService.createDiscussion(this.chats).subscribe(
  //       (response) => {
  //         console.log('Discussion créée avec succès.', response);
  //       },
  //       (error) => {
  //         console.error('Erreur lors de la création de la discussion :', error);
  //         alert('Une erreur est survenue lors de la création de la discussion: ' + error);
  //       }
  //   );
  // }

  // createDiscussion(): void {
  //   this._authenticationService.currentUser.subscribe(user => {
  //     if (user && user.id) {
  //       const userId: number = user.id;
  //
  //       // Affecter l'ID de l'utilisateur au créateur de la discussion
  //       this.chats.createur.id = userId;
  //
  //       console.log('Titre:', this.chats.titre);
  //       console.log('Description:', this.chats.description);
  //       console.log('Createur:', this.chats.createur);
  //
  //       // Appel au service pour créer la discussion
  //       this._chatService.createDiscussion(this.chats).subscribe(
  //           (response) => {
  //             console.log('Discussion créée avec succès.', response);
  //           },
  //           (error) => {
  //             console.error('Erreur lors de la création de la discussion :', error);
  //             alert('Une erreur est survenue lors de la création de la discussion: ' + error);
  //           }
  //       );
  //     } else {
  //       console.error('Utilisateur non authentifié ou ID utilisateur introuvable.');
  //     }
  //   });
  // }

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
            },
            (error) => {
              console.error('Erreur lors de la création de la discussion :', error);
              alert('Une erreur est survenue lors de la création de la discussion: ' + error);
            }
        );
      } else {
        console.error('Utilisateur non authentifié ou ID utilisateur introuvable.');
      }
    });
  }


  /**
   * Toggle Sidebar
   *
   * @param name
   */
  toggleSidebar(name) {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  /**
   * Set Index
   *
   * @param index
   */
  setIndex(index: number) {
    this.selectedIndex = index;
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to contacts
    this._chatService.onContactsChange.subscribe(res => {
      this.contacts = res;

      // Obtenez l'ID de l'utilisateur authentifié
      this._authenticationService.currentUser.subscribe(user => {
        if (user && user.id) {
          const userId: number = user.id;
          this.discussion.createur.id = userId;
        } else {
          console.error('Utilisateur non authentifié ou ID utilisateur introuvable.');
          // Gérer l'erreur ici
        }
      });
    });

    let skipFirst = 0;

    // Subscribe to chat users
    this._chatService.getChats().subscribe(res => {
      this.chatUsers = res;
      console.log("Mangui boug diombi");
      console.log(res);
      // Skip setIndex first time when initialized
      if (skipFirst >= 1) {
        this.setIndex(this.chatUsers.length - 1);
      }
      skipFirst++;
    });

    // Subscribe to selected Chats
    this._chatService.onSelectedChatChange.subscribe(res => {
      this.chats = res;
    });

    // Add Unseen Message To Chat User
    this._chatService.onChatsChange.pipe(first()).subscribe(chats => {
      chats.map(chat => {
        this.chatUsers.map(user => {
          if (user.id === chat.userId) {
            user.unseenMsgs = chat.unseenMsgs;
          }
        });
      });
    });

    // Subscribe to User Profile
    this._chatService.onUserProfileChange.subscribe(response => {
      this.userProfile = response;
    });
  }
}
