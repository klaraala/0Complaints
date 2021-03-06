import {Injectable} from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {AngularFireDatabase} from '@angular/fire/database';
import {Task} from '../../model/task';

import {ChallengesArray} from '../../model/challengesArray';

import {map} from 'rxjs/operators';
import {merge, of} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {

    constructor(private fireDatabase: AngularFireDatabase) {
    }

    /**
     * Creates a new task in firebase from an activity objects
     *
     * @param task an existing task object
     */
    createTask(task: Task) {
        return new Promise<any>((resolve, reject) => {
            const id = firebase.database().ref().child('tasks').push().key;
            task.id = id;

            this.fireDatabase.database.ref('/tasks/').child(id)
                .set(task.toFirebaseObject()).then(
                // Returns the information with the new id
                () => resolve(task),
                err => reject(err)
            );
        });
    }

    setParticipants(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/tasks/' + task.id).child('participants')
                .child(firebase.auth().currentUser.uid).set(firebase.auth().currentUser.uid).then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    editTask(task: Task) {
        console.log(task);
        return firebase.database().ref('/tasks/' + task.id).set(task.toFirebaseObject());
    }

    /**
     * this is needed to initially get all available tasks
     */
    getAllAvailableTasks() {
        const ref = this.fireDatabase.list<any>('/tasks/');
        return ref.snapshotChanges().pipe(map(task => task.map(
            taskSnapshot => Task.fromFirebaseObject(taskSnapshot.key, taskSnapshot.payload.val()))));
    }

    // return this.fireDatabase.list<Challenge>('tasks').valueChanges();


    /**
     * this is necessary in order to get all own active tasks to sort it in the frontend then
     */
    getAllUserActiveTasks() {
        const ref = this.fireDatabase.list<string>('/users/' + firebase.auth().currentUser.uid + '/tasksActive');
        // Retrieve an array, but with its metadata. This is necesary to have the key available
        // An array of Goals is reconstructed using the fromFirebaseObject method
        return merge(of([]), ref.snapshotChanges().pipe(
            map(tasks => tasks.map(goalPayload => goalPayload.key))));
    }


    /**
     * this methods returns the participants node as a object which is then converted to an array in order to determine it length
     * @param task identify a specific task and its participants
     */
    getListOfParticipants(task: Task) {
        return new Promise<any>((resolve, reject) => {

            this.fireDatabase.database.ref('/tasks/' + task.id).child('participants').once('value')
                .then(
                    res => resolve(res),
                    err => reject(err)
                );
        });
    }


    getAllTasks() {
        const ref = this.fireDatabase.list<any>('/tasks/');
        // Retrieve an array, but with its metadata. This is necesary to have the key available
        // An array of Goals is reconstructed using the fromFirebaseObject method
        return ref.snapshotChanges().pipe(
            map(tasks => tasks.map(goalPayload => (Task.fromFirebaseObject(goalPayload.key, goalPayload.payload.val())))));

    }

    getListOfAllUserAndTheirWonTasks() {
        const ref = this.fireDatabase.list<ChallengesArray>('/tasksStatus/');
        // Retrieve an array, but with its metadata. This is necesary to have the key available
        // An array of Goals is reconstructed using the fromFirebaseObject method
        return ref.snapshotChanges().pipe(
            map(user => user.map(
                taskpayload => (ChallengesArray.fromFirebaseObject(taskpayload.key, taskpayload.payload.val())))));
    }


    /**
     * this method adds the task to the users array which is necessary to determine the participated tasks
     * @param task identify the specific task which the user wants to participate
     */

    /*addChallengeToActive(task: Array<Challenge>) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/users/' + firebase.auth().currentUser.uid).child('tasksActive')
                .set(task).then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }*/


    addTaskToActive(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/users/' + firebase.auth().currentUser.uid).child('tasksActive')
                .child(task.id).set('true').then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    removeTaskFromActive(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/users/' + firebase.auth().currentUser.uid).child('tasksActive')
                .child(task.id).remove().then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    /**
     * increment the participants array in order to show it to the others
     * @param task identify task
     */
    registerOnTask(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/tasks/' + task.id).child('participants')
                .child(firebase.auth().currentUser.uid).set(firebase.auth().currentUser.uid).then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    /**
     * decrement the participants array in order to show it to the others
     * @param task identify task
     */
    deRegisterOnTask(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/tasks/' + task.id).child('participants')
                .child(firebase.auth().currentUser.uid).remove().then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    /**
     * finish the task, this method is called from the admin dashboard in order to disable further registration
     * @param task identify the task
     */
    finishTask(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/tasks/' + task.id).child('finished')
                .set('true').then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    /**
     * finish the task, this method is called from the admin dashboard in order to disable further registration
     * @param task identify the task
     */
    completeTask(task: Task) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/tasks/' + task.id).child('done')
                .set('true').then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }

    /**
     * after the finish, the researcher needs to manually determine the task winner
     * @param task the task to identify
     * @param uid the uid who wins this task
     */
    setAssignee(task: Task, uid: string) {
        return new Promise<any>((resolve, reject) => {
            this.fireDatabase.database.ref('/tasks/' + task.id).child('assignee')
                .set(uid).then(
                res => resolve(res),
                err => reject(err)
            );
        });
    }


}
