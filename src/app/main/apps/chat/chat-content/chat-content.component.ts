import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { ChatService } from 'app/main/apps/chat/chat.service';
import {Utilisateur} from "../../sujet/sujet.model";
import {Discussion} from "../DIscussion.model";
import {AuthenticationService} from "../../../../auth/service";

@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html'
})
export class ChatContentComponent implements OnInit {
  // Decorator
  @ViewChild('scrollMe') scrollMe: ElementRef;
  scrolltop: number = null;

  // Public
  public activeChat: Boolean;
  public chats;
  public chatUser;
  public userProfile;
  public chatMessage = '';
  public newChat;

  /**
   * Constructor
   *
   * @param {ChatService} _chatService
   * @param {CoreSidebarService} _coreSidebarService
   * @param authService
   */
  constructor(private _chatService: ChatService, private _coreSidebarService: CoreSidebarService, private authService: AuthenticationService) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update Chat
   */
  updateChat() {
    this.newChat = {
      contenu: this.chatMessage,
      dateEnvoie: new Date(),
      dateModification: new Date(),
      utilisateurId: this.authService.currentUserValue.id,
      discussionId: this.chatUser.id
    };

    // If chat data is available (update chat)
      if (this.newChat.contenu !== '' && this.newChat.contenu !== undefined) {
        this._chatService.updateChat(this.newChat);
        this.chatMessage = '';
        setTimeout(() => {
          this.scrolltop = this.scrollMe?.nativeElement.scrollHeight;
        }, 0);
      }

  }

  /**
   * Toggle Sidebar
   *
   * @param name
   */
  toggleSidebar(name) {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.userProfile = this.authService.currentUserValue;
    // Subscribe to Chat Change
    this._chatService.onChatOpenChange.subscribe(res => {
      this.chatMessage = '';
      this.activeChat = res;
      setTimeout(() => {
        this.scrolltop = this.scrollMe?.nativeElement.scrollHeight;
      }, 0);
    });

    // Subscribe to Selected Chat Change
    this._chatService.onSelectedChatChange.subscribe(res => {
      console.log(res);
      this.chats = res;
    });

    // Subscribe to Selected Chat User Change
    this._chatService.onSelectedChatUserChange.subscribe(res => {
      this.chatUser = res;
    });

    this.userProfile = this._chatService.userProfile;
  }

  getBoll(chatRef: any) {
    return chatRef?.utilisateur?.id == this.authService.currentUserValue.id
  }
}
