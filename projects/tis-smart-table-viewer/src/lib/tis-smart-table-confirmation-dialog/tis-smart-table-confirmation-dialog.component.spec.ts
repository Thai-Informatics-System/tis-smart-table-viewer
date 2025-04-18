import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisSmartTableConfirmationDialogComponent } from './tis-smart-table-confirmation-dialog.component';

describe('TisSmartTableConfirmationDialogComponent', () => {
  let component: TisSmartTableConfirmationDialogComponent;
  let fixture: ComponentFixture<TisSmartTableConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TisSmartTableConfirmationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TisSmartTableConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
