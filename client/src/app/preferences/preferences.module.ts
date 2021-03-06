import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PreferencesPage, SupportPage } from './preferences.page';

const routes: Routes = [
	{
		path: '',
		component: PreferencesPage
	}
];

@NgModule({
	imports: [ CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes) ],
	entryComponents: [ SupportPage ],
	declarations: [ PreferencesPage, SupportPage ]
})
export class PreferencesPageModule {}
