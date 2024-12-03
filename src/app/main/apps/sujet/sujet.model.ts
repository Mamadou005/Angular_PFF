import { Rapport } from "../rapport/rapport.model";
export class Sujet {
  id?: number;
  titre?: string ;
  description?: string ;
  groupeEtudiant?: GroupeEtudiant;
  echeance ?: Echeanche ;
  encadreur?: Utilisateur ;
  rapport?: Rapport;
  
}

export class Utilisateur {
  id?: number;
  nom?: string ;
  prenom?: string ;
  email?: string ;
  role?: String ;
}

export class Echeanche {
  id?: number;
  matriculeSecretaire?: string ;
  dateDebut?: string ;
  dateFin?: string;
  description?: string ; 
  rapport? : Rapport ;
}


export class GroupeEtudiant {
  id?: number ;
  nom?: string ;
}