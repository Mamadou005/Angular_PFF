import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SujetListItemComponent } from './sujet-list-item.component';

describe('SujetListItemComponent', () => {
  let component: SujetListItemComponent;
  let fixture: ComponentFixture<SujetListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SujetListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SujetListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
