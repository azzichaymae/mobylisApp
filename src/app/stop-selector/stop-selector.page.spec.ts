import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StopSelectorPage } from './stop-selector.page';

describe('StopSelectorPage', () => {
  let component: StopSelectorPage;
  let fixture: ComponentFixture<StopSelectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StopSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
