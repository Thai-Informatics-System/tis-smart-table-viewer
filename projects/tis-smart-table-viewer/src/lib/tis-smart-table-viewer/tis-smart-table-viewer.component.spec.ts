import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TisSmartTableViewerComponent } from './tis-smart-table-viewer.component';

describe('TisSmartTableViewerComponent', () => {
  let component: TisSmartTableViewerComponent;
  let fixture: ComponentFixture<TisSmartTableViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TisSmartTableViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TisSmartTableViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
