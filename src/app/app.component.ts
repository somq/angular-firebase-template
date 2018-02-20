import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from './database.service';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-root',
  template: `
    <div>
      {{ (item | async)?.name }}
    </div>
  `
})
export class AppComponent implements OnInit {
  itemDoc: AngularFirestoreDocument<any>;
  item: any;

  constructor(private afs: AngularFirestore, private db: DatabaseService, public afAuth: AngularFireAuth) {
    this.itemDoc = afs.doc('items/1');
    this.item = this.itemDoc.valueChanges();
  }
  update(item) {
    this.itemDoc.update(item);
  }

  ngOnInit() {
    this.afAuth.auth.signInWithEmailAndPassword('test@test.com', 'test@test.com').then(res => {
      console.log('res: ', res);

      this.db.testRx()
      // this.db.colWithIds$('users')
      //   .map(res => {
      //     return res.map(res => {
      //       return flat.flatten(res);
      //     })
      //   })
        // .subscribe(usersList => {
        //   console.log('usersList: ', usersList);
        //   // this.usersList = new FixedLocalDataSource(usersList);
        // })
    })

  }
}
