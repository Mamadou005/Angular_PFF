import { Component, Input, OnInit } from '@angular/core';
import { Rapport } from 'app/main/apps/rapport/rapport.model';
import { RapportService } from 'app/main/apps/rapport/rapport.service';

@Component({
  selector: 'app-rapport-list-item',
  templateUrl: './rapport-list-item.component.html'
})
export class RapportListItemComponent implements OnInit {
  @Input() rapport: Rapport;  // Input property to receive the rapport object
  public selected: boolean = false;  // Initialize selected state

  constructor(private _rapportService: RapportService) {}

  checkboxStateChange(stateRef: boolean): void {
    // Update the rapport's submission state based on checkbox state
    this.rapport.etatSoumission = stateRef ? 'APPROVED' : 'PENDING';

    this._rapportService.updateCurrentRapport(this.rapport).subscribe({
      next: (updatedRapport) => {
        console.log('Rapport updated successfully', updatedRapport);
      },
      error: (error) => {
        console.error('Error updating rapport:', error);
      }
    });
  }

  ngOnInit(): void {
  }
}
