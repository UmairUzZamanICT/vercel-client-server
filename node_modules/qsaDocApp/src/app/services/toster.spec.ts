import { TestBed } from '@angular/core/testing';

import { Toster } from './toster';

describe('Toster', () => {
  let service: Toster;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Toster);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
