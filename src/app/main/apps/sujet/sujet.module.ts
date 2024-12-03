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

import { SujetListItemComponent } from 'app/main/apps/sujet/sujet-list/sujet-list-item/sujet-list-item.component';
import { SujetListComponent } from 'app/main/apps/sujet/sujet-list/sujet-list.component';
import { SujetMainSidebarComponent } from 'app/main/apps/sujet/sujet-sidebars/sujet-main-sidebar/sujet-main-sidebar.component';
import { SujetRightSidebarComponent } from 'app/main/apps/sujet/sujet-sidebars/sujet-right-sidebar/sujet-right-sidebar.component';

import { SujetComponent } from 'app/main/apps/sujet/sujet.component';
import { SujetService } from 'app/main/apps/sujet/sujet.service';

// routing
const routes: Routes = [
  {
    path: ':filter',
    component: SujetComponent,
    resolve: {
      data: SujetService
    }
  },
  {
    path: 'tag/:tag',
    component: SujetComponent,
    resolve: {
      data: SujetService
    }
  },
  {
    path: '',
    component: SujetComponent,
    data: { animation: 'sujet' }
  },
];

@NgModule({
  declarations: [
    SujetComponent,
    SujetListComponent,
    SujetMainSidebarComponent,
    SujetRightSidebarComponent,
    SujetListItemComponent
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
  providers: [SujetService]
})
export class SujetModule {}
