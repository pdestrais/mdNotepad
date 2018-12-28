import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { Subject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class DataService {
 
    db: any;
    remote: string = 'http://127.0.0.1:5984/notes';
    dataServiceSubject:Subject<any> = new Subject();
    syncOptions = {
      live: true,
      retry: true
    };

    constructor(private storage:Storage) {
        this.db = new PouchDB('notes'/* ,{revs_limit: 1, auto_compaction: true} */);
        this.storage.get("remoteDBURL").then(
          result => {
            this.remote = result;
            console.log("[DataService constructor]calling syncLocalWithRemote")
            this.syncLocalwithRemote();
          }
        );
    }

    syncLocalwithRemote(){
      if (this.remote && this.remote.startsWith("http")) {
        this.db.sync(this.remote, this.syncOptions)
        .on('changed', info => console.log("[syncLocalwithRemote]sync changed - info :"+JSON.stringify(info)))
        .on('paused', info => { this.dataServiceSubject.next({message:"ReplicationCompleted"});
                                  console.log("[syncLocalwithRemote]sync paused - replication completed - info :"+JSON.stringify(info));
        })
        .on('failed', error => { 
                                  console.log("[syncLocalwithRemote]replication failed with error : "+error);
        });
        this.dataServiceSubject.next({message:"ReplicationStarted"});
        console.log("[syncLocalwithRemote]replication started");
        return this.dataServiceSubject;
      }          
    }

    replicateRemoteToLocal() {
      this.db.destroy().then( response => {
          console.info("database destroyed");
          this.db = new PouchDB('notes'/* ,{revs_limit: 1, auto_compaction: true} */);
          // replicate remote DB to local
          this.dataServiceSubject.next({message:'ReplicationStarts'}); 
          console.log("[replicateRemoteToLocal]replication started");
          // do one way, one-off sync from the server until completion
          this.db.replicate.from(this.remote)
          .on('complete', info => {
            // then two-way, continuous, retriable sync
            this.dataServiceSubject.next({message:"ReplicationCompleted"});
            console.log("[replicateRemoteToLocal]replication completed");
            this.db.sync(this.remote, this.syncOptions);
          })
          .on('error', () => { this.dataServiceSubject.next({message:"ReplicationFailed"});
                                console.log("[replicateRemoteToLocal]replication failed");
          });      
        }
      )
      return this.dataServiceSubject;
    }

    public put(id: string, document: any) { 
      document._id = id;
      return this.getDoc(id).then(result => {
          document._rev = result._rev;
          return this.db.put(document);
        }, error => {
          if(error.status == "404") {
              return this.db.put(document);
          } else {
              return new Promise((resolve, reject) => {
                  reject(error);
              });
          }
        });
    }

    // saveDoc will use a post command if the doc has no _id attribute, otherwize use the put to update the document
    // if a docClass is given and if the _id doesn't exist (this is a new document), the doc _id will be formed using the docClass
    // This will allow quick and easy retrival of doc types using only the doc's primary key (_id) 
    // returns a promise or an the error object.
    public saveDoc(doc,docClass?) {
      let _self = this;
      if (doc._id) {
        return this.db.get(doc._id).then(resultDoc => {
          doc._rev = resultDoc._rev;
          return _self.db.put(doc);
        }).then(response => {
          this.dataServiceSubject.next({message:"document saved"});
          return response;
        }).catch(err => {
          if (err.status == 404) {
            return this.db.put(doc)
            .then(response => {
              this.dataServiceSubject.next({message:"document saved"});
              return response 
            })
            .catch(err => {
                  console.error(err);
                  return err;
            });
          } else {
            console.error(err);
            return err;
          }
        });
      } else {
        if (docClass) {
          doc._id = docClass+'|'+this.guid();
          return this.saveDoc(doc);
        } else return this.db.post(doc)
                .then(response => { 
                  this.dataServiceSubject.next({message:"document saved"});
                  return response }
                ).catch(err => {
                  console.error(err);
                  return err;
                });
      }		
    }

    public getDoc( id:string ) {
      return this.db.get(id).then( result => {
        return result;
      }).catch( error => {
        console.error( error );
        return error;
      });
    }

    public deleteDoc( doc ) {
      return this.db.remove(doc._id, doc._rev).then( result => {
        this.dataServiceSubject.next({message:"document deleted"});
        return result;
      }).catch( error => {
        console.error( error );
        return error;
      });
    }

    public fetch(startKey?:string,endKey?:string) {
      if (startKey && endKey)
        return this.db.allDocs({include_docs: true, startkey: startKey, endkey: endKey, inclusive_end: true});
      else
        return this.db.allDocs({include_docs: true});
     }

     public getDocsOfType(type:string) {
      return this.db.allDocs({include_docs: true,startkey: type+'|', endkey: type+'|\ufff0'})
      .then( result => {
        if (result && result.rows)
          return result.rows.map(res => res.doc);
        else 
          return [];
      }).
      catch((error) => {console.log("result error : "+JSON.stringify(error)); return error});      
    }


     /**
     * Generates a GUID string.
     * @returns {String} The generated GUID.
     * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
     * @author Slavik Meltser (slavik@meltser.info).
     * @link http://slavik.meltser.info/?p=142
     */
    private guid() {
      function _p8(s) {
        let p = (Math.random().toString(16)+"000000000").substr(2,8);
    //        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    // modified version to return 32 characters as a cloudant id
        return s ? p.substr(0,4) + p.substr(4,4) : p ;
      }
      return _p8(false) + _p8(true) + _p8(true) + _p8(false);
    }

}