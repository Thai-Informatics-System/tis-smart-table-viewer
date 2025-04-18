import { TestBed } from '@angular/core/testing';

import { TisSmartTableViewerService } from './tis-smart-table-viewer.service';

describe('TisSmartTableViewerService', () => {
  let service: TisSmartTableViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TisSmartTableViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
