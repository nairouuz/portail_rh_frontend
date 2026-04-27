import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesList } from './demandes-list';

describe('DemandesList', () => {
  let component: DemandesList;
  let fixture: ComponentFixture<DemandesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
