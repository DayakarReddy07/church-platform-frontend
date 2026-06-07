import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChurchProfileComponent } from './church-profile.component';

describe('ChurchProfileComponent', () => {
  let component: ChurchProfileComponent;
  let fixture: ComponentFixture<ChurchProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChurchProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChurchProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
