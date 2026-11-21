import {applyIntent,availablePatrols,legalGuardSteps,guardCanFinish} from '../game/engine.ts';
import {board} from '../game/board.ts';
import type {RoomState,Intent} from '../game/model.ts';
export type FixtureMode='novice'|'hearing'|'sight'|'capture'|'false-noise';
/** Explicit positions for component review. Every action after seeding uses the production reducer. */
export function seedGameFixture(mode:FixtureMode):RoomState {
 let s=applyIntent(null,'guard',{type:'create',capacity:2,mode:'personal'});
 s=applyIntent(s,'guard',{type:'join',name:'Guard',role:'guard',character:0});s=applyIntent(s,'novice',{type:'join',name:'Celeste',role:'novice',character:3});
 for(const actor of ['guard','novice'])s=applyIntent(s,actor,{type:'ready',ready:true});
 s=applyIntent(s,'guard',{type:'start',seed:123});for(const g of s.guards)s=applyIntent(s,'guard',{type:'patrol',guard:g.id,card:availablePatrols(s,g)[0]});
 s.round=2;s.segment=1;s.revision=0;s.messages=[];
 s.novices[0].dot=mode==='novice'?4:mode==='hearing'||mode==='false-noise'?72:mode==='sight'?20:19;
 s.novices[0].speed=mode==='hearing'?'Walk':'Sneak';s.novices[0].blessing={kind:'false-noise',used:false,revealRound:null};
 s.guards[1].dot=147;s.guards[1].facing='South';s.guards[1].lastSpeed='Run';s.guards[1].rolled=true;
 const g=s.guards[0];g.dot=mode==='novice'||mode==='hearing'||mode==='false-noise'?23:18;g.lastSpeed='Run';
 if(mode==='hearing'||mode==='false-noise'){s.phase='guard-hearing';g.speed='Walk';g.rolled=mode==='false-noise';g.finished=true;s.guards[1].speed='Run';s.guards[1].finished=true;}
 if(mode==='capture'||mode==='sight'){s.phase='guards';g.finished=false;g.free=mode==='capture';g.facing=mode==='sight'?'West':'East';g.patrol={card:2,path:[...board.guardRoutes[2].path],index:(board.guardRoutes[2].path as number[]).indexOf(18)};}
 if(mode==='capture'){s.novices[0].key=true;s.novices[0].item=true;}
 if(mode==='novice'){s.phase='novices';s.novices[0].wish=8;}
 return s;
}
export function advanceFixtureHearing(start:RoomState){
 let s=start;const goal=s.round+1;let safety=0;
 function act(actor:string,intent:Intent){s=applyIntent(s,actor,intent);s.revision++;}
 while((s.round<goal||s.phase!=='guard-hearing')&&s.phase!=='ended'&&safety++<100){
  if(s.pending){const owner=s.guards.find(g=>g.id===s.pending!.roller)?.uid??s.pending.roller;act(owner,{type:'resolve-roll'});}
  else if(s.phase==='guard-hearing'){const g=s.guards.find(g=>!g.rolled);if(g)act(g.uid,{type:'guard-roll',guard:g.id,value:1});else act(s.guards[0].uid,{type:'advance'});}
  else if(s.phase==='novices'){const n=s.novices.find(n=>!n.submitted)!;act(n.uid,{type:'novice-move',speed:'Still',route:[n.dot]});}
  else if(s.phase==='novice-hearing'){const n=s.novices.find(n=>!n.rolled)!;act(n.uid,{type:'novice-roll',value:1});}
  else if(s.phase==='guards'){const g=s.guards.find(g=>!g.finished)!;if(guardCanFinish(g))act(g.uid,{type:'guard-finish',guard:g.id});else {const dots=legalGuardSteps(s,g);if(dots.length)act(g.uid,{type:'guard-step',guard:g.id,dot:dots[0]});else act(g.uid,{type:'patrol',guard:g.id,card:availablePatrols(s,g)[0]});}}
  else throw Error('Unsupported fixture phase.');
 }
 return s;
}
