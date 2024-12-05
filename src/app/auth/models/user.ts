// src/app/models/utilisateur.model.ts

import { Role } from './role';

export class Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: Role;
  matricule: string;
  //messagesEnvoyes: Message[] = [];
  //messagesRecus: Message[] = [];
}

