import { Component, OnInit, OnDestroy } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController, NavController, MenuController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { Observable, of, Subscription } from 'rxjs';
import { Note } from '../interfaces/note';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: [ 'home.page.scss' ]
})
export class HomePage implements OnInit, OnDestroy {
	public notes: any;
	public filteredNotes = [];
	public searchTerm: string = '';
	public tagList = [];
	public filteredTags = [];
	public selectedTags = [];
	private dbSub: Subscription;

	constructor(
		private dataService: DataService,
		private alertCtrl: AlertController,
		private menuCtrl: MenuController,
		private navCtrl: NavController,
		private storage: Storage,
		private zone: NgZone,
		private router: Router
	) {
		this.router.routeReuseStrategy.shouldReuseRoute = function() {
			return false;
		};
	}

	async alertNoRemoteDB() {
		const alert = await this.alertCtrl.create({
			header: 'Alert',
			subHeader: 'No Cloudant DB defined',
			message:
				'No Cloudant remote DB is defined to store your notes. Only the local storage will be used and no synchronization between devices will be possible.',
			buttons: [
				{
					text: 'Ok',
					handler: () => {
						// store temporary in session that the use wants to work with a local DB
						window.localStorage.setItem('localUse', 'true');
						console.log('Confirm Ok');
					}
				},
				{
					text: 'Configure Cloudant DB',
					handler: () => {
						this.navCtrl.navigateForward('/preferences');
						console.log('Confirm Cancel');
					}
				}
			]
		});

		await alert.present();
	}

	ngOnInit() {
		console.log('[HomePage - ngOnInit] entering method');
		// Most of the time, we just have to load the notes data
		this.getAllNotes();
		this.getAllTags();
		// but sometime we have to load the notes data after the synchronization with a remote db is finished
		this.dbSub = this.dataService.dataServiceSubject.subscribe((event) => {
			if (
				event.message == 'ReplicationCompleted' ||
				event.message == 'document deleted' ||
				event.message == 'document saved'
			) {
				this.getAllNotes();
				this.getAllTags();
				console.log('[HomePage - ngOnInit - observed event message]' + event.message + ' - loading notes');
			}
		});
		// and sometime, there is no synchronization defined
		this.storage.get('remoteDBURL').then((result) => {
			if (!result || !result.startsWith('http')) {
				console.log('[HomePage - ngOnInit] no remote db initialized, using local database');
				// check if this choice hasn't been done already in the past (in a previous session on this browser). If not, ask to choose.
				if (!window.localStorage.getItem('localUse')) this.alertNoRemoteDB();
			}
		});
	}

	ngOnDestroy() {
		console.log('[HomePage - ngOnDestroy] entering method');
		this.dbSub.unsubscribe();
	}

	getAllNotes() {
		this.dataService.getDocsOfType('note').then((data) => {
			let notes = data;
			this.zone.run(() => {
				this.notes = notes;
				this.filteredNotes = notes.map((note) => note);
			});
			//console.log("[HomePage - getAllNotes] all notes loaded into component "+JSON.stringify(this.notes));
		});
	}

	getAllTags() {
		this.dataService.getDocsOfType('tag').then((data) => {
			let tags = data;
			this.zone.run(() => {
				this.tagList = tags;
			});
			//console.log("[HomePage - getAllNotes] all notes loaded into component "+JSON.stringify(this.notes));
		});
	}

	setFilteredItems() {
		//console.log("[Home Page - setFilteredItems]searchTerm : "+this.searchTerm+" - filteredTags : "+JSON.stringify(this.filteredTags));
		if (this.searchTerm != '') {
			this.filteredTags = this.tagList.filter((tag) => {
				return tag.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
			});
		} else this.filteredTags = [];
	}

	addTagToSelection(tagName: string) {
		this.selectedTags.push(tagName);
		this.searchTerm = '';
		this.filteredNotes = this.notes.filter((value) => this.selectedTags.some((tag) => value.tags.includes(tag)));
	}

	fullTextSearch(searchTerm) {
		this.filteredNotes = this.notes.filter((value) =>
			value.content.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}

	removeTagFromSelection(tagName: string) {
		this.selectedTags = this.selectedTags.filter((value) => value != tagName);
		this.filteredNotes = this.notes.filter((value) => this.selectedTags.some((tag) => value.tags.includes(tag)));
	}

	cancelSearchTag() {
		this.filteredNotes = this.notes.map((value) => value);
	}

	ngOnChanges() {
		console.log('[HomePage - ngOnChanges] entering method');
	}

	renameNote(note: Note) {
		this.alertCtrl
			.create({
				header: 'Rename Note',
				message: 'What is the new name of this note ?',
				inputs: [
					{
						type: 'text',
						name: 'title'
					}
				],
				buttons: [
					{
						text: 'Cancel'
					},
					{
						text: 'Save',
						handler: (data) => {
							note.title = data.title;
							this.dataService.saveDoc(note, 'note');
						}
					}
				]
			})
			.then((alert) => {
				alert.present();
			});
	}

	deleteNote(note) {
		this.alertCtrl
			.create({
				header: 'Delete Note',
				message: 'Are you usure ?',
				buttons: [
					{
						text: 'Yes',
						handler: () => {
							this.dataService.deleteDoc(note);
						}
					},
					{
						text: 'No'
					}
				]
			})
			.then((alert) => {
				alert.present();
			});
	}

	addNote() {
		this.alertCtrl
			.create({
				header: 'New Note',
				message: 'What should the title of this note be?',
				inputs: [
					{
						type: 'text',
						name: 'title'
					}
				],
				buttons: [
					{
						text: 'Cancel'
					},
					{
						text: 'Save',
						handler: (data) => {
							let note: any = { title: data.title, content: '', tags: [], type: 'note' };
							this.dataService.saveDoc(note, 'note');
						}
					}
				]
			})
			.then((alert) => {
				alert.present();
			});
	}

	showMenu() {
		this.menuCtrl.open('mainMenu').then(() => {
			console.log('[HomePage - showMenu]Menu open');
		});
	}
}
