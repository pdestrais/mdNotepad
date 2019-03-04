import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: [ 'app.component.scss' ]
})
export class AppComponent {
	public appMenuItems = [
		{
			title: 'Home',
			url: '',
			icon: 'home'
		},
		{
			title: 'Tags',
			url: '/tags',
			icon: 'pricetag'
		},
		{
			title: 'Preferences',
			url: '/preferences',
			icon: 'settings'
		},
		{
			title: 'Version',
			url: '/version',
			icon: 'information-circle-outline'
		}
	];

	constructor(private platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar) {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();
		});
	}

	showPreferences() {
		console.log('[AppComponent - showPreferences]');
	}
}
