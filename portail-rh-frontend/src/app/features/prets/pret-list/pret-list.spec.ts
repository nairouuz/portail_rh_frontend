import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretList } from './pret-list';

describe('PretList', () => {
  let component: PretList;
  let fixture: ComponentFixture<PretList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PretList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PretList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
