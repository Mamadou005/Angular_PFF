import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {environment} from "../../../../environments/environment";
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {Discussion} from "./DIscussion.model";
import {Utilisateur} from "../sujet/sujet.model";


@Injectable()
export class ChatService implements Resolve<any> {
  public contacts: Utilisateur[] = [];
  public chats: any[]= [];
  public userProfile;
  public isChatOpen: Boolean;
  public chatUsers: any[]= [];
  public selectedChat;
  public selectedChatUser;

  public onContactsChange: BehaviorSubject<any>;
  public onChatsChange: BehaviorSubject<any>;
  public onSelectedChatChange: BehaviorSubject<any>;
  public onSelectedChatUserChange: BehaviorSubject<any>;
  public onChatUsersChange: BehaviorSubject<any>;
  public onChatChange: BehaviorSubject<any>;
  public onChatOpenChange: BehaviorSubject<Boolean>;
  public onUserProfileChange: BehaviorSubject<any>;

  private apiUrl: string = environment.apiUrl;

  constructor(private _httpClient: HttpClient) {
    this.isChatOpen = false;
    this.onContactsChange = new BehaviorSubject([]);
    this.onChatsChange = new BehaviorSubject([]);
    this.onSelectedChatChange = new BehaviorSubject([]);
    this.onSelectedChatUserChange = new BehaviorSubject([]);
    this.onChatUsersChange = new BehaviorSubject([]);
    this.onChatChange = new BehaviorSubject([]);
    this.onChatOpenChange = new BehaviorSubject(false);
    this.onUserProfileChange = new BehaviorSubject([]);
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        this.getContacts(),
        this.getChats(),
        this.getUserProfile(),
        this.getActiveChats(),
      ]).then(() => {
        resolve();
      }, reject);
    });
  }

  /**
   * Get Contacts
   */
  getContacts(): Promise<any[]> {
    const url = `api/chat-contacts`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.contacts = response;
        this.onContactsChange.next(this.contacts);
        resolve(this.contacts);
      }, reject);
    });
  }

  /**
   * Get Chats
   */
  getChats(): Observable<any> {
     return this._httpClient.get(this.apiUrl+'/api/discussions');
  }

  getUser(): Observable<any> {
    return this._httpClient.get(environment.apiUrl + '/api/user/all');
  }

  /**
   * Get User Profile
   */
  getUserProfile(): Promise<any[]> {
    const url = `api/chat-profileUser`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.userProfile = response;
        this.onUserProfileChange.next(this.userProfile);
        resolve(this.userProfile);
      }, reject);
    });
  }

  /**
   * Get Selected Chat User
   *
   * @param userId
   */
  getSelectedChatUser(userId) {
    const selectUser = this.contacts.find(contact => contact.id === userId);
    this.selectedChatUser = selectUser;

    this.onSelectedChatUserChange.next(this.selectedChatUser);
  }

  /**
   * Get Active Chats
   */
  // getActiveChats() {
  //   const chatArr = this.chats.filter(chat => {
  //     return this.contacts.some(contact => {
  //       return contact.id === chat.userId;
  //     });
  //   });
  // }
  getActiveChats() {
    if (!this.chats) {
      console.error('Chats is undefined or null');
      return [];
    }
    return this.chats;
  }
  /**
   * Get Chat Users
   */
  // getChatUsers() {
  //   console.log("get chat users");
  //   const contactArr = this.contacts.filter(contact => {
  //     return this.chats.some(chat => {
  //       return chat.membres.some(membre => membre.id === contact.id);
  //     });
  //   });
  //
  //   this.chatUsers = contactArr;
  //
  //   this.onChatUsersChange.next(this.chatUsers);
  // }
  /**
   * Selected Chats
   *
   * @param id
   */
  selectedChats(id) {
    console.log('selectedChats', id);
    this._httpClient.get<any>(`${this.apiUrl}/api/discussions/${id}`).subscribe({
      next: (discussion) => {
        console.log(discussion);
        this.onSelectedChatChange.next(discussion.messages);
        this.onSelectedChatUserChange.next(discussion);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des discussions :", err);
      }
    });
  }
  /**
   * Create New Chat
   *
   * @param discussion
   */
  // createNewChat(id, chat) {
  //   const newChat = {
  //     userId: id,
  //     unseenMsgs: 0,
  //     chat: [chat]
  //   };
  //
  //   if (chat.message !== '') {
  //     return new Promise<void>((resolve, reject) => {
  //       this._httpClient.post('api/chat-chats/', { ...newChat }).subscribe(() => {
  //         this.getChats();
  //         //this.getChatUsers();
  //         this.getSelectedChatUser(id);
  //         this.openChat(id);
  //         resolve();
  //       }, reject);
  //     });
  //   }
  // }
  createDiscussion(discussion: Discussion): Observable<any> {
    // Vérifiez que l'objet discussion a les propriétés attendues
    if (!discussion || !discussion.titre || !discussion.description) {
      console.warn('Dans ChatService Titre et description requis pour créer une discussion.');
      return throwError('Dans ChatService Titre et description requis.');
    }
    const newDiscussion = {
      titre: discussion?.titre,
      description: discussion?.description,
      membres: discussion?.membres || [],
      createur: discussion?.createur || {}
    };
    console.log('Données envoyées au backend :', newDiscussion);
    if (newDiscussion.titre !== '' && newDiscussion.description !== '') {
      return this._httpClient.post(this.apiUrl+'/api/discussions', newDiscussion);
    } else {
      console.warn('Titre et description requis pour créer une discussion.');
      return throwError('Titre et description requis.');
    }
  }

  /**
   * Open Chat
   *
   * @param id
   */
  openChat(id) {
    this.isChatOpen = true;
    this.onChatOpenChange.next(this.isChatOpen);
    this.selectedChats(id);
  }

  /**
   * Update Chat
   *
   * @param chats
   */
  updateChat(chats) {
    return new Promise<void>((resolve, reject) => {
      this._httpClient.post(environment.apiUrl + '/api/messages/envoyer', chats).subscribe(() => {
        this.selectedChats(chats.discussionId);
        resolve();
      }, reject);
    });
  }

  /**
   * Update User Profile
   *
   * @param userProfileRef
   */
  updateUserProfile(userProfileRef) {
    this.userProfile = userProfileRef;
    this.onUserProfileChange.next(this.userProfile);
  }

  getAllUsers(): Observable<Utilisateur[]> {
    console.log("Get All User");
    return this._httpClient.get<Utilisateur[]>(this.apiUrl+'/api/user');
  }

  getAllUsersr(): Observable<Utilisateur[]> {
    console.log("Get All User");
    return this._httpClient.get<Utilisateur[]>(`${this.apiUrl}/api/user`);
  }
}
