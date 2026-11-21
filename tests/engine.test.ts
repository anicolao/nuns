import test from 'node:test';import assert from 'node:assert/strict';
import {applyIntent,applyEvent,replay,availablePatrols,legalGuardSteps,guardCanFinish,isNoviceVisible} from '../src/lib/game/engine.ts';
import {publicGame} from '../src/lib/game/projection.ts';
import type {RoomState,Intent,GameEvent,GuardId} from '../src/lib/game/model.ts';
export function game(count=2,seed=123):RoomState {
 let s=applyIntent(null,'host',{type:'create',capacity:count,mode:'personal'});
 s=applyIntent(s,'host',{type:'join',name:'Guard',role:'guard',character:0});
 for(let i=0;i<count-(count===8?2:1);i++)s=applyIntent(s,`novice${i}`,{type:'join',name:`Novice ${i}`,role:'novice',character:i});
 if(count===8)s=applyIntent(s,'guard2',{type:'join',name:'Prioress',role:'guard',character:0});
 for(const p of s.seats)s=applyIntent(s,p.uid,{type:'ready',ready:true});
 return applyIntent(s,'host',{type:'start',seed});
}
function choosePatrols(s:RoomState){for(const g of s.guards)s=applyIntent(s,g.uid,{type:'patrol',guard:g.id,card:availablePatrols(s,g)[0]});return s;}
test('versioned setup deals unique wishes and all eight blessing cards for 2, 7 and 8 players',()=>{
 for(const count of [2,7,8]){const s=game(count);assert.deepEqual(s,game(count));assert.equal(s.guards.length,2);assert.equal(s.novices.length,count-(count===8?2:1));assert.equal(new Set(s.novices.map(n=>n.wish)).size,s.novices.length);assert.equal(s.guards[1].uid,count===8?'guard2':'host');assert.equal(s.phase,'patrols');}
 assert.throws(()=>applyIntent(game(),'wrong',{type:'patrol',guard:'abbess',card:1}),/belongs/);
});
test('first round has two simultaneous movements with the same selected card',()=>{
 let s=choosePatrols(game(3));s=applyIntent(s,'novice0',{type:'novice-move',speed:'Still',route:[1]});assert.equal(s.phase,'novices');assert.equal(publicGame(s).novices[0].speed,'Still');
 s=applyIntent(s,'novice1',{type:'novice-move',speed:'Still',route:[2]});assert.equal(s.segment,2);assert.equal(s.phase,'novices');
 assert.throws(()=>applyIntent(s,'novice0',{type:'novice-move',speed:'Run',route:[1,21]}),/same movement/);
 for(const n of s.novices)s=applyIntent(s,n.uid,{type:'novice-move',speed:'Still',route:[n.dot]});assert.equal(s.phase,'guards');
});
test('movement rejects disconnected steps and locked doors, enforces speed, and keeps private facts off public views',()=>{
 const s=choosePatrols(game());assert.throws(()=>applyIntent(s,'novice0',{type:'novice-move',speed:'Sneak',route:[1,72]}),/adjacent/);
 assert.throws(()=>applyIntent(s,'novice0',{type:'novice-move',speed:'Walk',route:[1,21]}),/movement card/);
 const n=s.novices[0];n.dot=122;n.key=false;s.round=2;
 assert.throws(()=>applyIntent(s,n.uid,{type:'novice-move',speed:'Sneak',route:[122,121]}),/key/);
 const p=publicGame(s).novices[0];for(const field of ['wish','key','item','log','blessingState'])assert.equal(field in p,false);assert.equal('seed' in publicGame(s),false);
});
test('published hearing example emits only the guard-adjacent direction, and distance/reroll blessings act before resolution',()=>{
 let s=choosePatrols(game());s.round=2;s.phase='novice-hearing';s.guards[0].dot=23;s.guards[0].lastSpeed='Walk';s.guards[1].lastSpeed='Run';s.novices[0].dot=72;s.novices[0].speed='Walk';s.novices[0].blessing={kind:'distance',used:false,revealRound:null};
 s=applyIntent(s,'novice0',{type:'novice-roll',value:6});const heard=applyIntent(s,'novice0',{type:'resolve-roll'});assert.deepEqual(heard.clues.map(c=>[c.at,c.toward]),[[23,43]]);
 s=applyIntent(s,'novice0',{type:'blessing',entity:'novice0'});s=applyIntent(s,'novice0',{type:'resolve-roll'});assert.equal(s.clues.length,0);
 s.phase='guard-hearing';s.guards[0].speed='Walk';s.guards[0].rolled=false;s.guards[0].blessing={kind:'reroll',used:false,revealRound:null};s=applyIntent(s,'host',{type:'guard-roll',guard:'abbess',value:1});s=applyIntent(s,'host',{type:'blessing',entity:'abbess',value:6});assert.equal(s.pending?.value,6);assert.equal(s.guards[0].blessing.used,true);
});
test('False Noise is one ordinary clue and remains unidentified until next hearing phase',()=>{
 let s=choosePatrols(game());s.round=2;s.phase='guard-hearing';s.guards[0].dot=23;s.guards.forEach(g=>g.rolled=true);s.novices[0].blessing={kind:'false-noise',used:false,revealRound:null};
 s=applyIntent(s,'novice0',{type:'blessing',entity:'novice0',guard:'abbess',toward:43});assert.equal(s.clues.length,1);assert.equal(publicGame(s).novices[0].blessing,null);assert.equal(publicGame(s).messages.at(-1),'A noise was heard.');
 assert.throws(()=>applyIntent(s,'novice0',{type:'blessing',entity:'novice0',guard:'abbess',toward:22}),/already/);
 s=applyIntent(s,'host',{type:'advance'});assert.equal(publicGame(s).novices[0].blessing,null);s.phase='guard-hearing';assert.equal(publicGame(s).novices[0].blessing,'false-noise');
});
test('sight, automatic capture, retained keys, lost wish and protected shortest-path recovery',()=>{
 let s=choosePatrols(game());s.phase='guards';s.round=2;s.guards[0].dot=18;s.guards[0].facing='East';s.guards[0].free=true;const n=s.novices[0];n.dot=19;n.character=3;n.key=true;n.item=true;
 assert.equal(isNoviceVisible(s,n),true);s=applyIntent(s,'host',{type:'guard-step',guard:'abbess',dot:19});assert.equal(s.captures,1);assert.equal(s.novices[0].caught,true);assert.equal(s.novices[0].key,true);assert.equal(s.novices[0].item,false);
 s.guards[0].dot=23;s.guards[1].dot=97;s.phase='novices';s.novices[0].submitted=false;s.novices[0].dot=18;
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Walk',route:[18,4]});assert.equal(s.novices[0].dot,4);assert.equal(s.novices[0].caught,false);assert.equal(s.novices[0].immuneRound,2);
});
test('novice victory is resolved at the simultaneous barrier with capture-count tie break',()=>{
 let s=choosePatrols(game(3));s.round=3;s.segment=1;s.guards.forEach(g=>g.dot=147);
 s.novices.forEach(n=>{n.key=true;n.item=true;n.dot=n.character===0?21:20;});s.novices[0].captures=1;
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Sneak',route:[21,1]});assert.equal(s.phase,'novices');s=applyIntent(s,'novice1',{type:'novice-move',speed:'Sneak',route:[20,2]});assert.equal(s.phase,'ended');assert.deepEqual(s.winners,['novice1']);
});
for(const count of [2,7,8])test(`complete ${count}-player game reaches round 15 and can rematch`,()=>{
 let s=choosePatrols(game(count));let safety=0;
 while(s.phase!=='ended'&&safety++<2000){
  if(s.phase==='novices'){for(const n of s.novices.filter(n=>!n.submitted))s=applyIntent(s,n.uid,{type:'novice-move',speed:'Still',route:[n.dot]});}
  else if(s.phase==='novice-hearing'){if(s.pending)s=applyIntent(s,s.pending.roller,{type:'resolve-roll'});else{const n=s.novices.find(n=>!n.rolled)!;s=applyIntent(s,n.uid,{type:'novice-roll',value:1});}}
  else if(s.phase==='guards'){
   const g=s.guards.find(g=>!g.finished)!;
   if(guardCanFinish(g)){s=applyIntent(s,g.uid,{type:'guard-finish',guard:g.id});continue;}
   const options=legalGuardSteps(s,g);if(options.length)s=applyIntent(s,g.uid,{type:'guard-step',guard:g.id,dot:options[0]});else s=applyIntent(s,g.uid,{type:'patrol',guard:g.id,card:availablePatrols(s,g)[0]});
  }else if(s.phase==='guard-hearing'){
   if(s.pending){const g=s.guards.find(g=>g.id===s.pending!.roller)!;s=applyIntent(s,g.uid,{type:'resolve-roll'});}else{const g=s.guards.find(g=>!g.rolled);s=g?applyIntent(s,g.uid,{type:'guard-roll',guard:g.id,value:1}):applyIntent(s,'host',{type:'advance'});}
  }else throw Error(s.phase);
 }
 assert.ok(safety<2000);assert.equal(s.round,15);assert.equal(s.winnerTeam,'guards');const rematch=applyIntent(s,'host',{type:'rematch',seed:567});assert.equal(rematch.phase,'patrols');assert.equal(rematch.epoch,2);assert.equal(rematch.captures,0);
});
test('replay is immutable, detects holes/versions, and diagnoses illegal attributed inputs without partial changes',()=>{
 const events:GameEvent[]=[{version:1,id:'create-0001',actor:'host',sequence:1,intent:{type:'create',capacity:2,mode:'personal'}},{version:1,id:'join-00001',actor:'alice',sequence:2,intent:{type:'join',name:'Alice',role:'novice',character:0}},{version:1,id:'bad-start1',actor:'alice',sequence:3,intent:{type:'start',seed:1}}];
 const original=structuredClone(events),result=replay(events);assert.deepEqual(events,original);assert.equal(result.state?.phase,'lobby');assert.equal(result.state?.revision,3);assert.equal(result.diagnostics.length,1);
 assert.throws(()=>replay([events[0],{...events[1],sequence:3}]),/gap/);assert.throws(()=>replay([{...events[0],version:3} as unknown as GameEvent]),/version/);
});
test('first-turn undo preserves history and can repeat both moves across a simultaneous barrier',()=>{
 let s=choosePatrols(game(3));s=applyIntent(s,'novice0',{type:'novice-move',speed:'Sneak',route:[1,21]});
 s=applyIntent(s,'novice0',{type:'novice-undo'});assert.equal(s.novices[0].dot,1);assert.equal(s.novices[0].firstSpeed,null);
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Still',route:[1]});s=applyIntent(s,'novice1',{type:'novice-move',speed:'Still',route:[2]});assert.equal(s.segment,2);
 s=applyIntent(s,'novice0',{type:'novice-undo'});s=applyIntent(s,'novice1',{type:'novice-move',speed:'Still',route:[2]});
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Sneak',route:[1,21]});assert.equal(s.novices[0].submitted,false);assert.equal(s.phase,'novices');
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Sneak',route:[21,20]});assert.equal(s.phase,'guards');
 s=applyIntent(s,'novice0',{type:'novice-undo'});assert.equal(s.novices[0].dot,1);assert.equal(s.novices[1].log.length,2);
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Still',route:[1]});s=applyIntent(s,'novice0',{type:'novice-move',speed:'Still',route:[1]});
 s=applyIntent(s,'host',{type:'guard-speed',guard:'abbess',speed:'Walk'});assert.throws(()=>applyIntent(s,'novice0',{type:'novice-undo'}),/first turn/);
 s.round=2;assert.throws(()=>applyIntent(s,'novice0',{type:'novice-undo'}),/first turn/);
});
test('unseen recovery keeps the novice at the end of her walk, and legacy events keep their original replay',()=>{
 let s=choosePatrols(game());s.round=2;s.novices[0].dot=43;s.novices[0].caught=true;s.novices[0].character=3;s.guards.forEach(g=>{g.dot=147;g.facing='North';});
 const intent:Intent={type:'novice-move',speed:'Walk',route:[43,23,22,21]};
 const now=applyIntent(s,'novice0',intent);assert.equal(now.novices[0].dot,21);assert.equal(now.novices[0].caught,false);assert.equal(now.novices[0].immuneRound,2);
 const old=applyEvent(s,{version:1,id:'legacy-recovery',sequence:s.revision+1,actor:'novice0',intent});assert.equal(old.novices[0].dot,4);
 const modern=applyEvent(s,{version:2,id:'modern-recovery',sequence:s.revision+1,actor:'novice0',intent});assert.equal(modern.novices[0].dot,21);
});
test('patrol paths and committed speeds are public without exposing novice paths',()=>{
 let s=choosePatrols(game(3));const projected=publicGame(s);assert.deepEqual(projected.guards[0].path,s.guards[0].patrol!.path);assert.match(projected.messages.join('\n'),/chose .* patrol: .*→/);
 s=applyIntent(s,'novice0',{type:'novice-move',speed:'Still',route:[1]});assert.equal(publicGame(s).novices[0].speed,'Still');assert.match(s.messages.at(-1)!,/Anne Marie chose Still/);assert.equal('log' in publicGame(s).novices[0],false);
});
test('recovery allows the remaining walking steps to turn freely immediately after losing sight',()=>{
 let s=choosePatrols(game());s.round=2;s.novices[0].dot=43;s.novices[0].caught=true;s.novices[0].character=3;s.guards.forEach(g=>{g.dot=147;g.facing='North';});
 const next=applyIntent(s,'novice0',{type:'novice-move',speed:'Walk',route:[43,23,43,42]});assert.equal(next.novices[0].dot,42);assert.equal(next.novices[0].caught,false);
});
