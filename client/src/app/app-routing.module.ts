import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'notes', pathMatch: 'full' },
  { path: 'notes', loadChildren: './home/home.module#HomePageModule' },
  { path: 'notes/:id', loadChildren: './detail/detail.module#DetailPageModule' },
  { path: 'preferences', loadChildren: './preferences/preferences.module#PreferencesPageModule' },
  { path: 'ngx-wig', loadChildren: './ngx-wig/ngx-wig.module#NgxWigModule' },
  { path: 'tags', loadChildren: './tags/tags.module#TagsPageModule' },
  { path: 'tags/:id', loadChildren: './tags/tags.module#TagsPageModule' },
  { path: 'version', loadChildren: './version/version.module#VersionPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
