import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilForm } from './profil-form';

describe('ProfilForm', () => {
  let component: ProfilForm;
  let fixture: ComponentFixture<ProfilForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
