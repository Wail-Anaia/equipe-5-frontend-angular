import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamListComponent } from './team-list';

describe('TeamList', () => {
  let component: TeamListComponent;
  let fixture: ComponentFixture<TeamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
