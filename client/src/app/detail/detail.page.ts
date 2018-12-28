import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { Note } from '../interfaces/note';
 
@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
 
  public note: Note;
  public mode: string;
  public searchTerm: string = '';
  public tagList = [];
  public filteredTags = [];
  public showSearchbar = false;
 
  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router) {
 
    // Initialise a placeholder note until the actual note can be loaded in
    this.note = {
      _id: '',
      _rev: '',
      _deleted: false,
      title: '',
      content: '',
      tags: [],
      type:'note'
    };
    this.mode='edit';
  }
 
  ngOnInit() {
    // Get the id of the note from the URL
    console.log('[DetailPage - ngOnInit]entering ');
    const noteId = this.route.snapshot.params['id'];
    //let noteId = this.route.snapshot.paramMap.get('id');
    // Check that the data is loaded before getting the note
    // This handles the case where the detail page is loaded directly via the URL
    this.dataService.getDoc(noteId).then(doc => {
      { this.note = doc; 
        //this.storage.set("temp",doc);
        console.log("[DetailPage - deleteNote]note affichée : "+JSON.stringify(this.note));
      }
    }); 
    this.dataService.getDocsOfType("tag").then(data => {
      this.tagList = data.map(row => {
        return row;
      });
    })
  }

  setFilteredItems() {
    console.log("[Detail Page - setFilteredItems]searchTerm : "+this.searchTerm+" - filteredTags : "+JSON.stringify(this.filteredTags));
    if (this.searchTerm!='') {
      this.filteredTags = this.tagList.filter(tag => {
        return tag.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
      });    
    } else 
      this.filteredTags = [];
  }

  test() {
    console.log("clicked !!");
  }

  addTagToNote(tagName) {
    // first check that tagName already exists in the list of reference tags
    // if not, add 'tagName' to the reference tag list
    // then add tag to note
    if (!this.tagList.find(tag => tag.name == tagName)) {
      this.dataService.saveDoc({name:tagName},"tag");
    }
    this.note.tags.push(tagName);
    this.saveNote(true);
    this.toggleSearchbar();    
    this.filteredTags = [];
  }

  removeTagFromNote(tagName){
    this.note.tags = this.note.tags.filter(value => value != tagName);
  }
 
  toggleSearchbar() {
    this.showSearchbar = !this.showSearchbar;
    this.searchTerm='';
  }

  cancelSearchTag() {
    this.toggleSearchbar(); 
    this.filteredTags=[];
  }

  noteChanged($event){
/*     this.storage.get("test").then(done => 
      console.log("[DetailPage - noteChanged]test : "+JSON.stringify(done))
    );
    console.log("[DetailPage - noteChanged]note changée : "+JSON.stringify(this.note));
     this.storage.set("infly",this.note);
*/      console.log("[DetailPage - noteChanged]event : "+$event);
  }

  saveNote(backToNotes?:boolean) {
//    this.storage.get("infly").then(note => {
      console.log("[DetailPage - saveNote]note à sauver : "+JSON.stringify(this.note));
      this.dataService.saveDoc(this.note,'note')
      .then(response => {
        console.log("[DetailPage - saveNote]note sauvée : "+JSON.stringify(response)); 
        if (!backToNotes)
          this.router.navigate(['/notes']);})
      .catch(error => console.log(error.message));    
//    })
  }

  deleteNote(){
    console.log('[DetailPage - deleteNote]note à effacer : '+JSON.stringify(this.note));
    this.dataService.deleteDoc(this.note)
    .then(response => {
      console.log("note effacée - réponse : "+JSON.stringify(response));
      this.router.navigate(['/notes']);
    })
/*     .catch(error => 
      console.log("error deleting note - error : "+JSON.stringify(error))
    );
 *///    this.navCtrl.navigateBack('/notes');
  }

  noteSave() {
    console.log('[DetailPage - deleteNote]note a sauver : ')
  }

  enterMarkdownViewMode() {
    this.mode='view';
  }
 
  quitMarkdownViewMode() {
    this.mode='edit';
  }

}
