import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {environment} from "../../../../environments/environment";
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Discussion} from "./DIscussion.model";
import {Utilisateur} from "../sujet/sujet.model";
import {catchError, tap} from "rxjs/operators";

@Injectable()
export class ChatService {
  public contacts: Utilisateur[] = [];
  public chats: Discussion[] = [];
  public userProfile;
  public isChatOpen: Boolean;
  public chatUsers: any[];
  public selectedChat;
  public selectedChatUser;

  public onContactsChange: BehaviorSubject<any>;
  public onChatsChange: BehaviorSubject<any>;
  public onSelectedChatChange: BehaviorSubject<any>;
  public onSelectedChatUserChange: BehaviorSubject<any>;
  public onChatUsersChange: BehaviorSubject<any>;
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
    this.onChatOpenChange = new BehaviorSubject(false);
    this.onUserProfileChange = new BehaviorSubject([]);
  }
  loadContacts(): void {
    console.log('Contacts loaded:');
    this.getAllUsers().subscribe({
      next: (utilisateurs) => {
        this.contacts = utilisateurs;
        console.log('Contacts loaded:', this.contacts);
      },
      error: (err) => {
        console.error('Error loading contacts', err);
      },
    });
  }
  loadDiscussions(): void {
    console.log('Discussions loaded:');
    this.getChats().subscribe({
      next: (discussions) => {
        this.chats = discussions;
        console.log('Discussions loaded:', this.chats);
      },
      error: (err) => {
        console.error('Error loading discussions', err);
      },
    });
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
        this.getChatUsers()
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
  getChats(): Observable<Discussion[]> {
    return this._httpClient.get<Discussion[]>(this.apiUrl + '/api/discussions').pipe(
        tap((data) => {
          this.chats = data;
        }),
        catchError((error) => {
          console.error('Erreur lors de la récupération des discussions:', error);
          return of([]);
        })
    );
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
  getChatUsers() {
    console.log("get chat users");
    const contactArr = this.contacts.filter(contact => {
      return this.chats.some(chat => {
        return chat.membres.some(membre => membre.id === contact.id);
      });
    });

    this.chatUsers = contactArr;

    this.onChatUsersChange.next(this.chatUsers);
  }
  /**
   * Selected Chats
   *
   * @param id
   */
  selectedChats(id) {
    this._httpClient.get<Discussion[]>(`${this.apiUrl}api/discussions/utilisateur/${id}`).subscribe({
      next: (discussions) => {
        if (discussions.length > 0) {
          this.selectedChat = discussions[0];
        } else {
          const newChat = {
            titre: "Nouvelle discussion",
            description: `Discussion pour l'utilisateur ${id}`
          };
          this._httpClient.post<Discussion>(`${this.apiUrl}api/discussions`, newChat).subscribe({
            next: (createdChat) => {
              this.selectedChat = createdChat;
            },
            error: (err) => {
              console.error("Erreur lors de la création de la discussion :", err);
            }
          });
        }
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des discussions :", err);
      }
    });
  }
  /**
   * Create New Chat
   *
   * @param id
   * @param chat
   */
  createNewChat(id, chat) {
    const newChat = {
      userId: id,
      unseenMsgs: 0,
      chat: [chat]
    };

    if (chat.message !== '') {
      return new Promise<void>((resolve, reject) => {
        this._httpClient.post('api/chat-chats/', { ...newChat }).subscribe(() => {
          this.getChats();
          this.getChatUsers();
          this.getSelectedChatUser(id);
          this.openChat(id);
          resolve();
        }, reject);
      });
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
      this._httpClient.post('api/chat-chats/' + chats.id, { ...chats }).subscribe(() => {
        this.getChats();
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
