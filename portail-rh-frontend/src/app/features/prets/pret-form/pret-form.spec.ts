import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretForm } from './pret-form';

describe('PretForm', () => {
  let component: PretForm;
  let fixture: ComponentFixture<PretForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PretForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PretForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
