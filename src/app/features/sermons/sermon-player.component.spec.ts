import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SermonPlayerComponent } from './sermon-player.component';

describe('SermonPlayerComponent', () => {
  let component: SermonPlayerComponent;
  let fixture: ComponentFixture<SermonPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SermonPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SermonPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
