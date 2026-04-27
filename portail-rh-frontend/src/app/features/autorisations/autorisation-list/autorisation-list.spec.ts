import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorisationList } from './autorisation-list';

describe('AutorisationList', () => {
  let component: AutorisationList;
  let fixture: ComponentFixture<AutorisationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutorisationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutorisationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
