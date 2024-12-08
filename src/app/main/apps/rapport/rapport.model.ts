export class Rapport {
  id?: number;
  titre: string = '';
  dateSoumission: Date;
  contenuUrl: string = '';
  etatSoumission: string = '';
  // groupeEtudiant: { id?: number; nom: string } = { id: undefined, nom: '' };
  // echeance: { id?: number; description: string } = { id: undefined, description: '' };
}