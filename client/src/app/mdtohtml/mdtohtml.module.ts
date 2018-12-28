import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MdtohtmlComponent } from './mdtohtml.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [MdtohtmlComponent],
  exports: [
    MdtohtmlComponent
  ]
})
export class MdtohtmlPageModule {}
