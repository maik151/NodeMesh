import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ByokSetup } from './byok-setup';

describe('ByokSetup', () => {
  let component: ByokSetup;
  let fixture: ComponentFixture<ByokSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ByokSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(ByokSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
