import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CongeForm } from './conge-form';

describe('CongeForm', () => {
  let component: CongeForm;
  let fixture: ComponentFixture<CongeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CongeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CongeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
