import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdtohtmlComponent } from './mdtohtml.component';

describe('MdtohtmlPage', () => {
  let component: MdtohtmlComponent;
  let fixture: ComponentFixture<MdtohtmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdtohtmlComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdtohtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
