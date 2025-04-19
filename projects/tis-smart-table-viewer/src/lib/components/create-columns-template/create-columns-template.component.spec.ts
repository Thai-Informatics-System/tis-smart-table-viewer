import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColumnsTemplateComponent } from './create-columns-template.component';

describe('CreateColumnsTemplateComponent', () => {
  let component: CreateColumnsTemplateComponent;
  let fixture: ComponentFixture<CreateColumnsTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateColumnsTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateColumnsTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
