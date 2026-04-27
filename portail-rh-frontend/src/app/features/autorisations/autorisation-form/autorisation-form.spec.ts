import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorisationForm } from './autorisation-form';

describe('AutorisationForm', () => {
  let component: AutorisationForm;
  let fixture: ComponentFixture<AutorisationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutorisationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutorisationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
