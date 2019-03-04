import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Storage } from '@ionic/storage';
import { DataService } from './../services/data.service';
import { ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.page.html',
	styleUrls: [ './preferences.page.scss' ]
})
export class PreferencesPage implements OnInit {
	public remoteDBURL: string = '';
	public loading = false;
	public valid: boolean = false;
	public savingInterval: number = 2;

	constructor(
		private location: Location,
		private storage: Storage,
		private dataService: DataService,
		private toastCtrl: ToastController,
		private router: Router,
		private modalCtrl: ModalController
	) {}

	async presentToast(message: string, type: string, nextPageUrl: string) {
		const toast = await this.toastCtrl.create({
			color: type == 'success' ? 'secondary' : 'danger',
			message: message,
			duration: 2000
		});
		toast.present();
		if (nextPageUrl) this.router.navigate([ nextPageUrl ]);
	}

	ngOnInit() {
		console.log('[PreferencesPage - ngOnInit]');
		this.storage.get('autoSavingInterval').then(
			(result) => {
				this.savingInterval = result;
			},
			(error) => this.storage.set('autoSavingInterval', 2)
		);
		this.storage.get('remoteDBURL').then((result) => {
			this.remoteDBURL = result;
			this.checkURLValidity();
		}, (error) => (this.remoteDBURL = ''));
		this.dataService.dataServiceSubject.subscribe((event) => {
			if (event.message == 'ReplicationCompleted') {
				console.log('[PreferencesPage - ngOnInit] loading stop');
				this.loading = false;
				this.presentToast('Synchronization done', 'success', '/notes');
			}
		});
	}

	persistSavingInterval($event: CustomEvent) {
		console.log('[setSavingInterval]saving interval changed to ' + $event.detail.value);
		this.storage.set('autoSavingInterval', $event.detail.value);
	}

	goBack() {
		this.location.back();
	}

	checkURLValidity() {
		let urlRegExp = new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\:([\da-z\.-]+)\@([\da-z\.-]+)\/([\da-z\.-]+)$/);
		//([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
		if (this.remoteDBURL) this.valid = urlRegExp.test(this.remoteDBURL);
	}

	syncWithRemoteDB() {
		console.log('[PreferencesPage - syncWithRemoteDB] loading starts');
		this.loading = true;
		this.dataService.remote = this.remoteDBURL;
		this.storage.set('remoteDBURL', this.remoteDBURL).then((done) => {
			//start sync with remote DB using the Data provider service
			this.dataService.syncLocalwithRemote();
		});
	}

	replAndSyncWithRemoteDB() {
		console.log('[PreferencesPage - replAndSyncWithRemoteDB] loading starts');
		this.loading = true;
		this.dataService.remote = this.remoteDBURL;
		this.storage.set('remoteDBURL', this.remoteDBURL).then((done) => {
			//start sync with remote DB using the Data provider service
			this.dataService.replicateRemoteToLocal();
		});
	}

	async showSupportText() {
		const modal = await this.modalCtrl.create({
			component: SupportPage,
			backdropDismiss: true,
			showBackdrop: true
		});
		return await modal.present();
	}
}

@Component({
	template: `
			<ion-card>
				<ion-card-content>
					<p>You can synchronize your cellar data with a remote database (can be Apache CouchDB, IBM Cloudant or PouchDB server).</p>
					<p>2 modes are possible : </p>
					<ol>
						<li>keep local content you currently have and synchronize with an existing remote database. Instructions : Supply the URL, including credentials and database name and hit 'Start Sync'.</li>
						<li>copy content from an existing remote database and synchronize. This will overwrite any local content you currently have. Instructions : Supply the URL, including credentials and database name and hit 'Overwrite and Sync</li>
					</ol>
				</ion-card-content>
			</ion-card>
			<ion-button expand="full" (click)="dismiss()">Close</ion-button>
			`
})
export class SupportPage {
	constructor(private modalCtrl: ModalController) {}

	dismiss() {
		this.modalCtrl.dismiss();
	}
}
