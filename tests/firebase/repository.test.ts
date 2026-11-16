import {after,test} from 'node:test';import {setTimeout as delay} from 'node:timers/promises';import assert from 'node:assert/strict';
import {initializeApp,deleteApp,type FirebaseApp} from 'firebase/app';import {getAuth,connectAuthEmulator,signInAnonymously,signOut} from 'firebase/auth';import {getDatabase,connectDatabaseEmulator,get,ref,goOffline} from 'firebase/database';
import {repository,roomCode} from '../../src/lib/backend/repository.ts';import {replay} from '../../src/lib/game/engine.ts';import type {GameEvent} from '../../src/lib/game/model.ts';
const apps:FirebaseApp[]=[];const closers:(()=>void)[]=[];
after(async()=>{closers.forEach(close=>close());await Promise.all(apps.map(async app=>{goOffline(getDatabase(app));await signOut(getAuth(app));await deleteApp(app);}));});
async function client(){const app=initializeApp({apiKey:'demo-nuns-key',projectId:'demo-nuns',databaseURL:'https://demo-nuns-default-rtdb.firebaseio.com'},crypto.randomUUID());apps.push(app);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9297',{disableWarnings:true});const db=getDatabase(app);connectDatabaseEmulator(db,'127.0.0.1',9197);const credential=await signInAnonymously(auth);return{db,uid:credential.user.uid};}
function storage(){const map=new Map<string,string>();let last='';return {get last(){return last;},get length(){return map.size;},key:(i:number)=>[...map.keys()][i]??null,clear:()=>map.clear(),getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{last=v;map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};}
async function connect(c:Awaited<ReturnType<typeof client>>,code:string,memory=storage()){
 let events:GameEvent[]=[];let resolve!:()=>void;const ready=new Promise<void>(r=>resolve=r);
 const repo=repository(c.db,c.uid,code,{events:e=>{events=e;resolve();},error:e=>{throw e;}},memory);closers.push(()=>repo.close());await ready;return{repo,memory,events:()=>events};
}
test('simultaneous anonymous joins occupy contiguous immutable slots without duplicate choices',async()=>{
 const host=await client(),a=await client(),b=await client(),code=roomCode(),h=await connect(host,code);await h.repo.append({type:'create',capacity:3,mode:'personal'});
 const [x,y]=await Promise.all([connect(a,code),connect(b,code)]);
 await Promise.all([x.repo.append({type:'join',name:'Alice',role:'novice',character:0}),y.repo.append({type:'join',name:'Bora',role:'novice',character:1})]);
 // SDK get() can use an active listener's complete local cache before remote
 // subscriptions receive the other client's acknowledgement. Wait for delivery.
 const deadline=Date.now()+5000;while(h.events().length<3&&Date.now()<deadline)await delay(10);
 const events=h.events();assert.equal(events.length,3);assert.deepEqual(events.map(e=>e.sequence),[1,2,3]);assert.equal(new Set(events.map(e=>e.id)).size,3);assert.equal(replay(events).state!.seats.length,2);
});
test('lost acknowledgement retries the same stored ID exactly once and a new repository reconstructs it',async()=>{
 const c=await client(),code=roomCode(),connection=await connect(c,code);await connection.repo.append({type:'create',capacity:2,mode:'personal'});
 const pending=connection.memory.last;connection.memory.setItem(`nuns:pending:v1:${code}:${c.uid}`,pending);await connection.repo.retry();
 const snap=await get(ref(c.db,`rooms/${code}/events`));assert.equal(snap.size,1);assert.equal(connection.repo.pending(),null);
 const reopened=await connect(c,code);assert.equal(reopened.events().length,1);assert.equal(replay(reopened.events()).state!.host,c.uid);
});
