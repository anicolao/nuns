import {ref,onValue,runTransaction,get,type Database,type Unsubscribe} from 'firebase/database';
import {replay,applyEvent} from '../game/engine.ts';
import type {GameEvent,Intent} from '../game/model.ts';
export const validCode=(code:string)=>/^[A-HJ-NP-Z2-9]{6}$/.test(code);
export function roomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=crypto.getRandomValues(new Uint8Array(6));return [...bytes].map(n=>chars[n%32]).join('');}
export type Pending={event:GameEvent};
function read(storage:Storage|undefined,key:string){try{return JSON.parse(storage?.getItem(key)??'null') as Pending|null;}catch{return null;}}
export function repository(db:Database,uid:string,code:string,callbacks:{events:(events:GameEvent[])=>void;error:(error:Error)=>void;connection?:(online:boolean)=>void},storage:Storage|undefined=globalThis.localStorage){
 if(!validCode(code))throw Error('Enter the six-character invitation code.');
 const path=`rooms/${code}/events`,key=`nuns:pending:v1:${code}:${uid}`;
 let events:GameEvent[]=[],online=false,queue:Promise<unknown>=Promise.resolve();
 const stopConnection=onValue(ref(db,'.info/connected'),snapshot=>{online=snapshot.val()===true;callbacks.connection?.(online);});
 const stopEvents=onValue(ref(db,path),snapshot=>{
  try{const next=Object.values(snapshot.val()??{}).filter(Boolean) as GameEvent[];next.sort((a,b)=>a.sequence-b.sequence);replay(next);if(next.length>=events.length){events=next;callbacks.events(next);}}catch(e){callbacks.error(e instanceof Error?e:Error(String(e)));}
 },e=>callbacks.error(e));
 const clear=()=>{try{storage?.removeItem(key);}catch{/* Memory pending is retained by send. */}};
 let memory:Pending|null=read(storage,key);
 function retain(pending:Pending){memory=pending;try{storage?.setItem(key,JSON.stringify(pending));}catch{/* The current tab still retains the retry ID. */}}
 async function send(pending:Pending){
  if(!online)throw Error('You are offline. Reconnect and retry this choice.');
  for(let attempt=0;attempt<12;attempt++){
   const event=pending.event,slot=ref(db,`${path}/${event.sequence}`);
   const result=await runTransaction(slot,current=>current===null?event:undefined,{applyLocally:false});
   const saved=result.snapshot.val() as GameEvent|null;
   const same=saved&&saved.id===event.id&&saved.actor===event.actor&&saved.version===event.version&&saved.sequence===event.sequence&&canonical(saved.intent)===canonical(event.intent);
   if(same){
    if(events.length<event.sequence){events=[...events,event].sort((a,b)=>a.sequence-b.sequence);callbacks.events(events);}
    memory=null;clear();return;
   }
   if(saved?.id===event.id){memory=null;clear();throw Error('This choice ID belongs to a different input.');}
   // Another simultaneous choice won this slot. Replay the fresh prefix and
   // revalidate the unchanged intent before reserving a new slot with the same ID.
   const snapshot=await get(ref(db,path));
   const fresh=(Object.values(snapshot.val()??{}).filter(Boolean) as GameEvent[]).sort((a,b)=>a.sequence-b.sequence);
   const prior=fresh.find(e=>e.id===event.id);
   if(prior){if(prior.actor!==event.actor||canonical(prior.intent)!==canonical(event.intent)){memory=null;clear();throw Error('This choice ID belongs to a different input.');}events=fresh;callbacks.events(events);memory=null;clear();return;}
   events=fresh;callbacks.events(events);
   const next={...event,sequence:events.length+1};
   try{applyEvent(replay(events).state,next);}catch{memory=null;clear();throw Error('The position changed and this choice is no longer legal. Review it and choose again.');}
   pending={event:next};retain(pending);
  }
  throw Error('The room is busy. Retry the retained choice.');
 }
 function serialized<T>(fn:()=>Promise<T>):Promise<T>{const next=queue.catch(()=>{}).then(async()=>{const locks=globalThis.navigator?.locks;return locks?locks.request(`nuns:${code}:${uid}`,fn):fn();});queue=next;return next;}
 return {
  append(intent:Intent){return serialized(async()=>{
   const existing=memory??read(storage,key);if(existing)throw Error('Retry the pending choice before sending another.');
   const event:GameEvent={version:1,id:crypto.randomUUID(),actor:uid,sequence:events.length+1,intent:JSON.parse(JSON.stringify(intent))};
   applyEvent(replay(events).state,event);const pending={event};retain(pending);await send(pending);
  });},
  retry(){return serialized(async()=>{const pending=memory??read(storage,key);if(pending)await send(pending);});},
  pending:()=>memory??read(storage,key),
  async refresh(){const snap=await get(ref(db,path));const next=Object.values(snap.val()??{}).filter(Boolean) as GameEvent[];next.sort((a,b)=>a.sequence-b.sequence);replay(next);events=next;callbacks.events(next);},
  close(){stopEvents();stopConnection();}
 };
}
export function canonical(value:unknown):string{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';}
export type RoomRepository=ReturnType<typeof repository>;
