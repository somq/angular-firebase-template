
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
// import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/operator/take';
import { map } from 'rxjs/operators/map';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import { switchMap } from 'rxjs/operators/switchMap';
import 'rxjs/operators/switchMapTo';
import 'rxjs/add/observable/throw';
import 'rxjs/rx';
import * as firebase from 'firebase/app';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

import { firebaseConfig } from '../environments/firebase.config';

import * as flat from 'flat'; // https://github.com/hughsk/flat

// Custom Types
type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

/**
 * @todo
 *    catch errors for view
 *
 * @export
 * @class DatabaseService
 */
@Injectable()
export class DatabaseService {

  authFirebaseApp: firebase.auth.Auth;
  firebase: any;
  emailSuffix: string = '@ocp.com';

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
  }

  // get usersList$() {
  //   return this.db.collection('users').snapshotChanges().map(actions => {
  //     return actions.map(a => {
  //       const data = a.payload.doc.data();
  //       const id = a.payload.doc.id;
  //       return { id, ...data };
  //     });
  //   });
  // }


  addUser(user, userProfile?, location?): Promise<any> {
    if(typeof user.username !== 'string' || typeof user.password !== 'string') {
      throw new Error('Wrong username or password type! Can\'t create user');
    }
    console.info(`adding user (${user.username + this.emailSuffix} - ${user.password})`)
    return this.createFakeFirebaseApp().createUserWithEmailAndPassword(user.username + this.emailSuffix, user.password)
      .then(createAuthResult => {
        console.log('auth id: ', createAuthResult.uid);
        // Our user has been successfully created in auth db, we go on by filling the values in firestore

        // keep pass safe
        delete user.password;
        delete user.passwordConfirm;

        user.id = createAuthResult.uid;
        location.owner = createAuthResult.uid;

        return this.add('locations', location)
          .then(locationResult => {
            console.log('Location insert id: ', locationResult.id);

            userProfile.locationId = locationResult.id;
            return this.add('userProfiles', userProfile)
          })
          .then(userProfileResult => {
            console.log('UsersProfile insert id: ', userProfileResult.id);

            user.profileId = userProfileResult.id;
            return this.add('users', user)
          })

      })
  }
  getFlatUsersWithProfiles() {
    console.log('test');


    return this.colWithIds$('users')

    // Force the source obs to complete to let .toArray() do its job.
    // .take(1)

    // // At this point, the obs emits a SINGLE array of ALL users.
    .do(userList => {
      console.log(userList);
      return userList
    })

    // // This "flattens" the array of users and emits each user individually.
    // .mergeMap(val => val)
    .switchMap(userData => {
      console.log('userData: ', userData, userData.profileId);
      // return this.db.collection('userProfiles', ref => {
      //   return ref.where('owner', '==', userData.id)
      // }).valueChanges().subscribe(res => {
      //   console.log('aaaa', res)
      // })
      // return Observable.of(`userProfiles/${userData.profileId}`)
      // return Observable.of(this.doc$(`userProfiles/${userData.profileId}`))
      if(typeof userData.profileId === 'undefined') {
        return Observable.of(null)
      }
      // return this.doc$(`userProfiles/Hp0o6SyylGvjA2v1VWim`)
      Observable.of(`userProfiles/Hp0o6SyylGvjA2v1VWim`)
      // return this.doc$(`userProfiles/${userData.profileId}`)
    })

    // // At this point, the obs emits ONE loaded user at a time.
    .do(userData => console.log('aaaaaa', userData))

    // // Transform the raw user data into a User object.

    // // Store all user objects into a SINGLE, final array.
    .toArray()
    .map(val =>  {
      console.log('val: ', val);
      return val;
    })






    // return Observable.combineLatest(
    //   Observable.of('adad'),
    //   Observable.of('zzzz')
    // )
    // return Observable.combineLatest(
    //   this.colWithIds$('users')
    //     .map(res => {
    //       return res.map(res => {
    //         console.log('usersres2: ', res);
    //           return this.db.collection('userProfiles', ref => {
    //             return ref.where('owner', '==', res.id)
    //           }).valueChanges()
    //         // return flat.flatten(res);
    //       })
    //     })
    // )

  }

  testRx() {
    // return this.colWithIds$('users')
      // // At this point, the obs emits a SINGLE array of items
      // .do(items => console.log(items))
      // // I flatten the array so that the obs emits each item INDIVIDUALLY
      // .mergeMap(val => val)
      // // At this point, the obs emits each item individually
      // .do(item => console.log(item))
      // // I can keep transforming each item using RxJS operators.
      // // Most likely, I will project the item into another obs with mergeMap()
      // .toArray()

      // .map(item => {
      //   console.log('ad', item)
      //   return item
      // })


      // Observable.of([{"id":"3bCzfj9BqheXm3xJPnsVq3vbaEv2","createdAt":"2018-02-20T17:03:41.463Z","isDisabled":null,"language":null,"profileId":"Hp0o6SyylGvjA2v1VWim","updatedAt":null,"username":"Fidelitasos"},{"id":"NP4g2frgcLf8aw5RTOrtgR94LUf2","roles":{"superadmin":true}},{"id":"NP4g2frgcLf8aw5RTOrtgR94LUf2","companyName":"","null":"","phones":"","roles":{"admin":true,"superadmin":true,"user":true},"updatedAt":"2018-02-20T17:06:22.505Z","userProfile":""}])
      // this.colWithIds$('users')
      this.db.collection('users').valueChanges()
        .do(items => console.log('i', items))
        // I flatten the array so that the obs emits each item INDIVIDUALLY
        .mergeMap(val => val)
        // At this point, the obs emits each item individually
        .do(item => console.log('i2', item))
        // I can keep transforming each item using RxJS operators.
        // Most likely, I will project the item into another obs with mergeMap()
        .map(item => {
          return item.id || null
        })
        // When I'm done transforming the items, I gather them in a single array again
        .toArray()
        .do(item => console.log('i3', item))
        .subscribe({ res =>
            console.log('res', res);
          });

  }
  /**
   * @description
   *    this trick is used to bypass the default firebase behaviour which automatically logs in the user when created
   *    So we use a fake app to create a new user to avoid being logging in.
   */
  createFakeFirebaseApp() {
    if(typeof this.authFirebaseApp === 'undefined') {
      this.authFirebaseApp = firebase.initializeApp(firebaseConfig, 'secondary').auth();
    }
    return this.authFirebaseApp;
  }
  // Return a reference
  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.db.collection<T>(ref, queryFn) : ref;
  }
  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.db.doc<T>(ref) : ref;
  }


  // Return an Observable
  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref)
      .snapshotChanges()
      .map(doc => {
        return doc.payload.data() as T;
      });
  }

  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .map(docs => {
        return docs.map(a => a.payload.doc.data()) as T[];
      });
  }

  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<any[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });
  }
  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  // CRUD
  update<T>(ref: DocPredicate<T>, data: any) {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    });
  }
  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp;
    return this.doc(ref).set({
      ...data,
      createdAt: timestamp,
    });
  }
  add<T>(ref: CollectionPredicate<T>, data: any) {
    const timestamp = this.timestamp;
    return this.col(ref).add({
      ...data,
      createdAt: timestamp
    });
  }
  delete<T>(ref: DocPredicate<T>) {
    return this.doc(ref).delete().then(
      res => {
        // console.info(`Successfully deleted`)
      },
      err => {
        console.error('Error while deleting:', err)
    }).catch(e => console.log('errrrr', e))
  }
  upsert<T>(ref: DocPredicate<T>, data: any) {
    const doc = this.doc(ref)
      .snapshotChanges()
      .take(1)
      .toPromise();
    return doc.then(snap => {
      return snap.payload.exists ? this.update(ref, data) : this.set(ref, data);
    });
  }
}
