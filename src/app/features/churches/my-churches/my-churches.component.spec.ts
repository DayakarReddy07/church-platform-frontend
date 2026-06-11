import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyChurchesComponent } from './my-churches.component';

describe('MyChurchesComponent', () => {
  let component: MyChurchesComponent;
  let fixture: ComponentFixture<MyChurchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyChurchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyChurchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
