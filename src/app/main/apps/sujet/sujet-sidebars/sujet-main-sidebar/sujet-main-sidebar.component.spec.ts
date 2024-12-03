import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetMainSidebarComponent } from './sujet-main-sidebar.component';

describe('SujetMainSidebarComponent', () => {
  let component: SujetMainSidebarComponent;
  let fixture: ComponentFixture<SujetMainSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetMainSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetMainSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
