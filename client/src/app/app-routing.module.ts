import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{ path: '', redirectTo: 'notes', pathMatch: 'full' },
	{ path: 'notes', loadChildren: './home/home.module#HomePageModule' /*, data: { reuse: false } */ },
	{ path: 'notes/:id', loadChildren: './detail/detail.module#DetailPageModule' /*, data: { reuse: false } */ }, // reuse is to try to modify the RouteReuseStrategy with a Custom one but this deosn't work
	{ path: 'preferences', loadChildren: './preferences/preferences.module#PreferencesPageModule' },
	{ path: 'ngx-wig', loadChildren: './ngx-wig/ngx-wig.module#NgxWigModule' },
	{ path: 'tags', loadChildren: './tags/tags.module#TagsPageModule' },
	{ path: 'tags/:id', loadChildren: './tags/tags.module#TagsPageModule' },
	{ path: 'version', loadChildren: './version/version.module#VersionPageModule' }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
