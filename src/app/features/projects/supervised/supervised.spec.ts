import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Supervised } from './supervised';

describe('Supervised', () => {
  let component: Supervised;
  let fixture: ComponentFixture<Supervised>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Supervised]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Supervised);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
