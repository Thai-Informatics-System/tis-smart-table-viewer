import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisSmartTableErrorDialogComponent } from './tis-smart-table-error-dialog.component';

describe('TisSmartTableErrorDialogComponent', () => {
  let component: TisSmartTableErrorDialogComponent;
  let fixture: ComponentFixture<TisSmartTableErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TisSmartTableErrorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TisSmartTableErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
