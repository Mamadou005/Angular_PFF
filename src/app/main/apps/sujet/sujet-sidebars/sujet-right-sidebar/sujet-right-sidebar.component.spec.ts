import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetRightSidebarComponent } from './sujet-right-sidebar.component';

describe('SujetRightSidebarComponent', () => {
  let component: SujetRightSidebarComponent;
  let fixture: ComponentFixture<SujetRightSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetRightSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetRightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
