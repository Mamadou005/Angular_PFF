import {Message} from "./message.model";
import {Utilisateur} from "../sujet/sujet.model";

export interface Discussion {
    id?: number;
    titre?: string;
    description?: string;
    createur?: Utilisateur;
    membres?: Utilisateur[];
    messages?: Message[];
    dateCreation?: string | null;
    dateModification?: string | null;
}
