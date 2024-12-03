import { Component, Input, OnInit } from '@angular/core';
import { Sujet } from 'app/main/apps/sujet/sujet.model';
import { SujetService } from 'app/main/apps/sujet/sujet.service';

@Component({
  selector: 'app-sujet-list-item',
  templateUrl: './sujet-list-item.component.html'
})
export class SujetListItemComponent implements OnInit {
  @Input() sujet: Sujet; // Propriété d'entrée pour recevoir l'objet sujet
  public selected: boolean = false; // Initialisation de l'état sélectionné

  constructor(private _sujetService: SujetService) {}

  checkboxStateChange(stateRef: boolean): void {
    // Mise à jour de l'état de soumission du sujet en fonction de l'état de la case à cocher
    this.sujet.rapport.etatSoumission = stateRef ? 'APPROVED' : 'PENDING';

    this._sujetService.updateCurrentSujet(this.sujet);
  }

  ngOnInit(): void {}

  public onDeleteSujet() {
    this._sujetService.deleteSujet(this.sujet.id).subscribe(
      () => {
        // Suppression du sujet dans la liste des sujets
        this._sujetService.sujets = this._sujetService.sujets.filter((s) => s.id!== this.sujet.id);
      },
      (error) => console.error('Erreur lors de la suppression:', error)
    );
  }

  public onEditSujet() {
    this._sujetService.setCurrentSujet(this.sujet.id);
  }
}
