import {Discussion} from "./DIscussion.model";
import {Utilisateur} from "../sujet/sujet.model";

export class Message {
    id?: number;
    contenu?: string;
    dateEnvoie?: string;
    dateModification?: string;
    utilisateur?: Utilisateur;
    discussion?: Discussion;
}