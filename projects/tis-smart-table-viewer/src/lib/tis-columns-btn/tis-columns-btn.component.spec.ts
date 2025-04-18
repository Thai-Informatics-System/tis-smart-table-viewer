import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisColumnsBtnComponent } from './tis-columns-btn.component';

describe('TisColumnsBtnComponent', () => {
  let component: TisColumnsBtnComponent;
  let fixture: ComponentFixture<TisColumnsBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TisColumnsBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TisColumnsBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
