import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-sujet',
  templateUrl: './sujet.component.html',
  styleUrls: ['./sujet.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'rapport-application' }
})
export class SujetComponent {}
