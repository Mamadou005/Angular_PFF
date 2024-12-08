// src/app/main/apps/echeanche/echeanche.model.ts

export interface Rapport {
    id: number;
    titre: string;
    contenu: string;
}

export interface Echeanche {
    id: number;
    matriculeSecretaire: string;
    dateDebut: string; // Date sous forme de string, ou utilisez Date si nécessaire
    dateFin: string;
    rapports: Rapport[];
    secretaireId: number;
}
