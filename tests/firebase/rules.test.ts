import {after,before,test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds,type RulesTestEnvironment} from '@firebase/rules-unit-testing';
let env:RulesTestEnvironment;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-nuns',database:{host:'127.0.0.1',port:9197,rules:await readFile('database.rules.json','utf8')}});await env.clearDatabase();});
after(async()=>{await env.cleanup();});
const event=(actor:string,sequence=1)=>({version:1,id:`choice-${actor}-${sequence}`,actor,sequence,intent:sequence===1?{type:'create',capacity:2,mode:'personal'}:{type:'join',name:actor,role:'novice',character:0}});
test('Realtime Database requires authentication and denies collection browsing',async()=>{
 await assertFails(env.unauthenticatedContext().database().ref('rooms/RULEAA/events/1').set(event('alice')));
 await assertFails(env.unauthenticatedContext().database().ref('rooms/RULEAA').get());
 await assertFails(env.authenticatedContext('alice').database().ref('rooms').get());
});
test('attributed contiguous immutable events are the only writable application data',async()=>{
 const alice=env.authenticatedContext('alice').database(),bob=env.authenticatedContext('bob').database();
 await assertSucceeds(alice.ref('rooms/RULEBB/events/1').set(event('alice')));
 await assertSucceeds(bob.ref('rooms/RULEBB/events/2').set(event('bob',2)));
 await assertFails(bob.ref('rooms/RULEBB/events/3').set(event('alice',3)));
 await assertFails(bob.ref('rooms/RULEBB/events/4').set(event('bob',4)));
 await assertFails(alice.ref('rooms/RULEBB/events/1').set({...event('alice'),id:'replace-old'}));
 await assertFails(alice.ref('rooms/RULEBB/events/1').remove());
 await assertFails(alice.ref('rooms/RULEBB').remove());
 await assertFails(alice.ref('rooms/RULEBB/currentState').set({round:2}));
 await assertFails(alice.ref('rooms/RULEBB/events/3').set({...event('alice',3),computedState:{round:10}}));
 await assertFails(alice.ref('rooms/RULEBB/events/3').set({...event('alice',3),version:3}));
 const snapshot=await assertSucceeds(alice.ref('rooms/RULEBB/events').get());assert.equal(snapshot.numChildren(),2);
});
test('the first event must create a room and slot keys must match sequence',async()=>{
 const db=env.authenticatedContext('alice').database();
 await assertFails(db.ref('rooms/RULECC/events/1').set({...event('alice'),intent:{type:'start',seed:1}}));
 await assertFails(db.ref('rooms/RULECC/events/2').set(event('alice')));
});
test('current version can append undo after a legacy event without mutating it',async()=>{
 const db=env.authenticatedContext('alice').database();await assertSucceeds(db.ref('rooms/RULEDD/events/1').set(event('alice')));
 await assertSucceeds(db.ref('rooms/RULEDD/events/2').set({...event('alice',2),version:2,intent:{type:'novice-undo'}}));
 const snapshot=await db.ref('rooms/RULEDD/events/1').get();assert.equal(snapshot.val().version,1);
});
