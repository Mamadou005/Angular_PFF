import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragulaModule } from 'ng2-dragula';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { QuillModule } from 'ngx-quill';

import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule } from '@core/components';

import { RapportListItemComponent } from 'app/main/apps/rapport/rapport-list/rapport-list-item/rapport-list-item.component';
import { RapportListComponent } from 'app/main/apps/rapport/rapport-list/rapport-list.component';
import { RapportMainSidebarComponent } from 'app/main/apps/rapport/rapport-sidebars/rapport-main-sidebar/rapport-main-sidebar.component';
import { RapportRightSidebarComponent } from 'app/main/apps/rapport/rapport-sidebars/rapport-right-sidebar/rapport-right-sidebar.component';

import { RapportComponent } from 'app/main/apps/rapport/rapport.component';
import { RapportService } from 'app/main/apps/rapport/rapport.service';

// routing
const routes: Routes = [
  {
    path: ':filter',
    component: RapportComponent,
    resolve: {
      data: RapportService
    }
  },
  {
    path: 'tag/:tag',
    component: RapportComponent,
    resolve: {
      data: RapportService
    }
  },
  {
    path: '',
    component: RapportComponent,
    data: { animation: 'rapport' }
  },
  
  
];

@NgModule({
  declarations: [
    RapportComponent,
    RapportListComponent,
    RapportMainSidebarComponent,
    RapportRightSidebarComponent,
    RapportListItemComponent

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    CoreSidebarModule,
    QuillModule.forRoot(),
    NgSelectModule,
    DragulaModule.forRoot(),
    NgbModule,
    Ng2FlatpickrModule,
    PerfectScrollbarModule,
    RouterModule
  ],
  providers: [RapportService]
})
export class RapportModule {}
