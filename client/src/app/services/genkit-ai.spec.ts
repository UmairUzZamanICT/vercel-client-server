import { TestBed } from '@angular/core/testing';

import { GenkitAi } from './genkit-ai';

describe('GenkitAi', () => {
  let service: GenkitAi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenkitAi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
