import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SermonsPageComponent } from './sermons-page.component';

describe('SermonsPageComponent', () => {
  let component: SermonsPageComponent;
  let fixture: ComponentFixture<SermonsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SermonsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SermonsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
