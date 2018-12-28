import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, ToastController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { NgZone } from '@angular/core'

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
})
export class TagsPage implements OnInit {

  public tagList:Array<any> = [];
  public filteredTags = [];
  public searchTerm: string = '';
  public tagView = true;
  public selectedTag : any;
  public newTagName : string;

  constructor(private route: ActivatedRoute, 
              private dataService: DataService, 
              private router: Router,
              private alertCtrl: AlertController, 
              private menuCtrl: MenuController,
              private toastCtrl: ToastController,
              private zone:NgZone,
              private nav:NavController){
  }

  ngOnInit(){
    console.log("[TagPage - ngOnInit] entering method");
    const tagID = this.route.snapshot.params['id'];
    if (tagID) {
      this.tagView = false;
      this.dataService.getDoc(tagID).then(tag => {
        this.selectedTag = tag;
        this.newTagName = tag.name;
      })
    } else {     
      this.getTags();
      this.tagView = true;
    }
  }

  getTags() {
    this.dataService.getDocsOfType("tag").then(data => {
      let tagList = data;
      this.zone.run(() => {
        this.tagList = tagList;
        this.filteredTags = tagList.map(value => value);
      }); 
    });   
  }

  renameTag(){
    // change tag and when it's done, change in all notes where tag is used
    let originalTagName = this.selectedTag.name;
    this.selectedTag.name = this.newTagName;
    this.dataService.saveDoc(this.selectedTag).then (() => {
      this.dataService.getDocsOfType("note").then(result =>
        result.map(note => {
          let i = note.tags.indexOf(originalTagName)
          if (i != -1) {
            note.tags[i]= this.selectedTag.name;
            this.dataService.saveDoc(note).then(() => console.log("[TagPage - renameTag] note saved with new tag : "+JSON.stringify(note)))
          }
        })); 
        this.nav.navigateBack('/tags'); 
        //this.router.navigateByUrl('/tags'); doesn't work well with ionic 4 back-button
        this.showMessage("The tag is renamed (including in the notes where it was used)", "middle", "light")
    }).catch(error =>  this.showMessage("Tag rename failed ... try again", "middle", "danger"))
  }

  deleteTag(){
    // delete tag and when it's done, suppress it in all the notes where it is used
    this.dataService.deleteDoc(this.selectedTag).then(() => {
      this.dataService.getDocsOfType("note").then(result =>
        result.map(note => {
          if (note.tags.includes(this.selectedTag.name)) {
            let modifiedTagList = note.tags.filter(tag => tag != this.selectedTag.name);
            note.tags = modifiedTagList;
            this.dataService.saveDoc(note)
          }
        }));  
      this.showMessage("The tag is deteled (including in the notes where it was used)", "middle", "light")
      this.router.navigate(['/tags'], { replaceUrl: true }); 
    }).catch(error =>  this.showMessage("Tag delete failed ... try again", "middle", "danger"));
  }

  changeTagName(event) {
    //console.log(JSON.stringify(event));
    this.newTagName = event.detail.value;
  }

  setFilteredItems() {
    //console.log("[Home Page - setFilteredItems]searchTerm : "+this.searchTerm+" - filteredTags : "+JSON.stringify(this.filteredTags));
    if (this.searchTerm!='') {
      this.filteredTags = this.tagList.filter(tag => {
        return tag.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
      });    
    } else 
      this.filteredTags = [];
  }


  ngOnChanges() {
    console.log("[HomePage - ngOnChanges] entering method");
  }

  addTag(){
    this.alertCtrl.create({
      header: 'New tag',
      message: 'What is the tag name ?',
      inputs: [
        {
          type: 'text',
          name: 'name'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            let tag:any = {name: data.name, type:'tag'};
            this.dataService.saveDoc(tag,"tag")
            .then(() => this.getTags());
          }
        }
      ]
    }).then((alert) => {
      alert.present();
    });
 
  }

  async showMessage(text, position, color) {
    const toastElement = await this.toastCtrl.create({
      message: text,
      position: position,
      color: color,
      duration: 2000
    });
    return await toastElement.present();
  }

  showMenu() {
    this.menuCtrl.open("mainMenu")
    .then(() => {console.log("[HomePage - showMenu]Menu open")});
  }
}
