import { TestBed } from '@angular/core/testing';

import { TodoMgmtService } from './todo-mgmt.service';

describe('TodoMgmtService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TodoMgmtService = TestBed.get(TodoMgmtService);
    expect(service).toBeTruthy();
  });
});
