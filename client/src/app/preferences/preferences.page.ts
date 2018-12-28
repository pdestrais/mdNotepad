import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Storage } from '@ionic/storage';
import { DataService } from './../services/data.service';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage implements OnInit {

  public remoteDBURL:string = '';
  public loading = false;
  public valid:boolean=false;

  constructor(private location:Location, private storage:Storage, private dataService:DataService, private alertCtrl:AlertController,private navCtrl:NavController) { }

  async confirmSync() {
    const alert = await this.alertCtrl.create({
      header: 'Synchronization done',
      message: 'Your local database in now synchronized with the remote cloudant database. All changes will now be replicated and available on all your devices.',
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.navCtrl.navigateBack("/notes");
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnInit() {
    console.log("[PreferencesPage - ngOnInit]")
    this.storage.get("remoteDBURL").then(result => {
      this.remoteDBURL = result;
      this.checkURLValidity();
    }, error => this.remoteDBURL='');
    this.dataService.dataServiceSubject.subscribe(event => {
      if (event.message=="ReplicationCompleted") {
        console.log("[PreferencesPage - ngOnInit] loading stop")
        this.loading=false;
        this.confirmSync();
      }
    });
  }

  goBack() {
    this.location.back();
  }

  checkURLValidity() {
    let urlRegExp = new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\:([\da-z\.-]+)\@([\da-z\.-]+)\/([\da-z\.-]+)$/); 
    //([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
    if (this.remoteDBURL)
      this.valid = urlRegExp.test(this.remoteDBURL);
  }

  syncWithRemoteDB() {
    console.log("[PreferencesPage - syncWithRemoteDB] loading starts");
    this.loading = true;
    this.dataService.remote = this.remoteDBURL;
    this.storage.set("remoteDBURL",this.remoteDBURL).then(done => {
      //start sync with remote DB using the Data provider service
      this.dataService.syncLocalwithRemote();
    });  
  }

  replAndSyncWithRemoteDB() {
    console.log("[PreferencesPage - replAndSyncWithRemoteDB] loading starts")
    this.loading = true;
    this.dataService.remote = this.remoteDBURL;
    this.storage.set("remoteDBURL",this.remoteDBURL).then(done => {
      //start sync with remote DB using the Data provider service
      this.dataService.replicateRemoteToLocal();
    });
  }
}
