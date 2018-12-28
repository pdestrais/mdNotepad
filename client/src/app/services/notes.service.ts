import { Injectable, NgZone } from '@angular/core';

import { Note } from '../interfaces/note';
import { DataService } from './data.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
 
  noteSubject: any = new Subject();  

  constructor(public dataService: DataService, public zone: NgZone) {
      this.dataService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
          console.log('[NotesService - constructor]db change : '+JSON.stringify(change));
          if(change.doc.type === 'note'){
              this.emitNotes();
          }
      });
  }
;
  getNote(id:string) : any {
   return this.dataService.db.get(id);
  }

  getNotes(){
      this.emitNotes();
      return this.noteSubject;
  }

  createNote(note:Note): void {
      this.dataService.db.post({title:note.title,type:'note',content:'',tags:[]});
  }

  saveNote(note:Note) {
    console.log('[NotesService - saveNote]note : '+JSON.stringify(note));
    return this.dataService.db.put({_id:note._id,_rev:note._rev,title:note.title,content:note.content});
  }

  deleteNote(note:Note) {
    note._deleted = true;
    console.log('[NotesService - deleteNote with id :'+note._id+' - rev :'+note._rev+" - deleted :"+note._deleted);
    return this.saveNote(note);
  }

  emitNotes(): void {
      this.zone.run(() => {
          this.dataService.db.allDocs({include_docs:true}).then((data) => {
              let notes = data.rows.map(row => {
                  return row.doc;
              });
              this.noteSubject.next(notes);
          });
      });
  }

}

// notes cloudant DB credentials
// Key:osessysearzandelasimerst
// Password:fcea299f5f85d15ba2db779ddd35a832092c24bb