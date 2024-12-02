import { Role } from './role';

export class User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  nom?: string;
  lastName: string;
  prenom?: string;
  avatar: string;
  role: Role;
  token?: string;
}
