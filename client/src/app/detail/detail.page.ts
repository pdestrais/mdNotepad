import { AlertController, ToastController } from '@ionic/angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { DataService } from '../services/data.service';
import { Note } from '../interfaces/note';
import { interval, Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.page.html',
	styleUrls: [ './detail.page.scss' ]
})
export class DetailPage implements OnInit, OnDestroy {
	public note: Note;
	public mode: string = 'editor';
	public searchTerm: string = '';
	public tagList = [];
	public filteredTags = [];
	public showSearchbar = false;
	private savingObs: Subscription;
	private dirty: boolean = false;
	private routeSub: Subscription; // subscription to route observer
	private dbSub: Subscription; // subscription to dataservice observer

	constructor(
		private route: ActivatedRoute,
		private dataService: DataService,
		private router: Router,
		private alertController: AlertController,
		private toastCtrl: ToastController,
		private storage: Storage
	) {
		// Initialise a placeholder note until the actual note can be loaded in
		this.note = {
			_id: '',
			_rev: '',
			_deleted: false,
			title: '',
			content: '',
			tags: [],
			type: 'note'
		};
		this.mode = 'edit';
	}

	ngOnInit() {
		// Get the id of the note from the URL
		console.log('[DetailPage - ngOnInit]entering ');
		/* 
       Register to Angular navigation events to detect navigating away (so we can save changed settings for example)
    */
		this.routeSub = this.router.events.subscribe((event) => {
			if (
				event instanceof NavigationStart &&
				(event.url == '/' ||
					event.url == '/notes' ||
					event.url == '/tags' ||
					event.url == '/preferences' ||
					event.url == '/version')
			) {
				console.log('[DetailPage - ngOnInit]unsubscribing from saving Subscription');
				this.savingObs.unsubscribe();
			}
		});
		// new to observe DB changes because when a note is modify outisde of the Detail page (when a tag is suppressed)
		// the changes are not visible if we immediatly load the same note (with the same id)
		this.dbSub = this.dataService.dataServiceSubject.subscribe((event) => {
			if (event.message == 'document deleted' || event.message == 'document saved') {
				this.dataService.getDoc(noteId).then((doc) => {
					{
						this.note = doc;
						//this.storage.set("temp",doc);
						console.log('[DetailPage - ngOnInit]reloading note : ' + JSON.stringify(this.note));
					}
				});
				this.dataService.getDocsOfType('tag').then((data) => {
					this.tagList = data.map((row) => {
						return row;
					});
				});
				console.log('[DetailPage - ngOnInit - observed event message]' + event.message + ' - loading notes');
			}
		});
		this.storage.get('autoSavingInterval').then(
			(result) => {
				if (result != 0)
					this.savingObs = interval(result * 60 * 1000).subscribe(() => {
						console.log('---- Automatically saving note ----');
						this.saveNote(false);
					});
			},
			(error) => {
				this.savingObs = interval(2 * 60 * 1000).subscribe(() => {
					console.log('---- Automatically saving note ----');
					this.saveNote(false);
				});
			}
		);
		const noteId = this.route.snapshot.params['id'];
		//let noteId = this.route.snapshot.paramMap.get('id');
		// Check that the data is loaded before getting the note
		// This handles the case where the detail page is loaded directly via the URL
		this.dataService.getDoc(noteId).then((doc) => {
			{
				this.note = doc;
				//this.storage.set("temp",doc);
				console.log('[DetailPage - ngOnInit]note affichée : ' + JSON.stringify(this.note));
			}
		});
		this.dataService.getDocsOfType('tag').then((data) => {
			this.tagList = data.map((row) => {
				return row;
			});
		});
	}

	ngOnDestroy() {
		console.log('[DetailPage - ngOnDestroy]unsubcribing from automatic save');
		this.routeSub.unsubscribe();
		this.dbSub.unsubscribe();
	}

	setFilteredItems() {
		console.log(
			'[Detail Page - setFilteredItems]searchTerm : ' +
				this.searchTerm +
				' - filteredTags : ' +
				JSON.stringify(this.filteredTags)
		);
		if (this.searchTerm != '') {
			this.filteredTags = this.tagList.filter((tag) => {
				return tag.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
			});
		} else this.filteredTags = [];
	}

	goBackHome() {
		if (this.dirty) {
			// Show save confirmation screen and go back home
			this.alertController
				.create({
					header: 'Saving note',
					message: 'Do you want to save your current note ?',
					buttons: [
						{
							text: 'No',
							handler: () => this.router.navigate([ 'notes' ])
						},
						{
							text: 'Yes',
							handler: () => {
								this.saveNote(true);
							}
						}
					]
				})
				.then((alert) => {
					alert.present();
				});
		}
	}

	setDirty() {
		this.dirty = true;
	}

	addTagToNote(tagName) {
		// first check that tagName already exists in the list of reference tags
		// if not, add 'tagName' to the reference tag list
		// then add tag to note
		if (!this.tagList.find((tag) => tag.name == tagName)) {
			this.dataService.saveDoc({ name: tagName }, 'tag');
		}
		this.note.tags.push(tagName);
		this.saveNote(false);
		this.toggleSearchbar();
		this.filteredTags = [];
	}

	removeTagFromNote(tagName) {
		this.note.tags = this.note.tags.filter((value) => value != tagName);
	}

	toggleSearchbar() {
		this.showSearchbar = !this.showSearchbar;
		this.searchTerm = '';
	}

	cancelSearchTag() {
		this.toggleSearchbar();
		this.filteredTags = [];
	}

	noteChanged($event) {
		/*     this.storage.get("test").then(done => 
      console.log("[DetailPage - noteChanged]test : "+JSON.stringify(done))
    );
    console.log("[DetailPage - noteChanged]note changée : "+JSON.stringify(this.note));
     this.storage.set("infly",this.note);
*/ console.log(
			'[DetailPage - noteChanged]event : ' + $event
		);
	}

	saveNote(backToNotes?: boolean) {
		console.log('[DetailPage - saveNote]note à sauver : ' + JSON.stringify(this.note));
		this.dataService
			.saveDoc(this.note, 'note')
			.then((response) => {
				console.log('note saved - response : ' + JSON.stringify(response));
				if (response.ok) {
					if (backToNotes) this.presentToast('note saved', 'success', '/notes');
					else this.presentToast('note saved', 'success', undefined);
				} else {
					this.presentToast('note not saved', 'error', undefined);
				}
			})
			.catch((error) => this.presentToast('note not saved', error.message, undefined));
	}

	deleteNote() {
		console.log('[DetailPage - deleteNote]note à effacer : ' + JSON.stringify(this.note));
		this.alertController
			.create({
				header: 'Confirm note deletion',
				message: 'Are you sure ?',
				buttons: [
					{
						text: 'Cancel'
					},
					{
						text: 'ok',
						handler: () => {
							this.dataService.deleteDoc(this.note).then((response) => {
								console.log('note effacée - réponse : ' + JSON.stringify(response));
								if (response.ok) {
									this.presentToast('note deleted', 'success', '/notes');
								} else {
									this.presentToast('note not deleted', 'error', undefined);
								}
							});
						}
					}
				]
			})
			.then((alert) => {
				alert.present();
			});
	}

	noteSave() {
		console.log('[DetailPage - deleteNote]note a sauver : ');
	}

	enterMarkdownViewMode() {
		this.mode = 'view';
	}

	quitMarkdownViewMode() {
		this.mode = 'edit';
	}

	async presentToast(message: string, type: string, nextPageUrl: string) {
		const toast = await this.toastCtrl.create({
			color: type == 'success' ? 'secondary' : 'danger',
			message: message,
			duration: 2000
		});
		toast.present();
		if (nextPageUrl) this.router.navigate([ nextPageUrl ]);
	}
}
