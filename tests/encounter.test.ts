import test from 'node:test';
import assert from 'node:assert/strict';
import {seedEncounter,applyEncounter,publicEncounter,canCommit,routeOptions} from '../src/lib/game/encounter.ts';

test('novice plans a bounded adjacent route, edits before commit, and only reveals speed',()=>{
 const start=seedEncounter('novice');
 assert.deepEqual(routeOptions(start),[18]);assert.equal(canCommit(start),false);
 const invalid=applyEncounter(start,{type:'step',dot:72});assert.equal(invalid.accepted,false);assert.deepEqual(start.route,[4]);
 let s=applyEncounter(start,{type:'step',dot:18}).state;
 s=applyEncounter(s,{type:'step',dot:19}).state;assert.deepEqual(s.route,[4,18,19]);assert.deepEqual(routeOptions(s),[]);
 assert.equal(applyEncounter(s,{type:'step',dot:20}).accepted,false);
 s=applyEncounter(s,{type:'undo-step'}).state;assert.deepEqual(s.route,[4,18]);
 s=applyEncounter(s,{type:'commit'}).state;
 assert.equal(s.noviceDot,18);assert.equal(publicEncounter(s).speed,'Sneak');assert.equal(publicEncounter(s).novice,null);
 assert.ok(!('route' in publicEncounter(s)));assert.ok(!('noviceDot' in publicEncounter(s)));
 assert.equal(applyEncounter(s,{type:'undo-step'}).accepted,false);assert.equal(applyEncounter(s,{type:'step',dot:19}).accepted,false);
});
test('hearing publishes a direction beside the guard, never the hidden source',()=>{
 const seed=seedEncounter('hearing');assert.equal(seed.noviceDot,72);
 const s=applyEncounter(seed,{type:'listen',roll:6}).state,p=publicEncounter(s);
 assert.deepEqual(p.clues,[{guard:23,toward:43,kind:'noise'}]);assert.equal(p.novice,null);
 assert.equal(JSON.stringify(p).includes('72'),false);assert.equal(applyEncounter(s,{type:'listen',roll:6}).accepted,false);
 assert.deepEqual(applyEncounter(seed,{type:'listen',roll:1}).state.clues,[]);
 assert.equal(applyEncounter(seed,{type:'listen',roll:7}).accepted,false);
});
test('facing reveals a novice; reaching her dot captures automatically exactly once',()=>{
 const sight=seedEncounter('sight');assert.equal(publicEncounter(sight).novice,null);
 const spotted=applyEncounter(sight,{type:'face',facing:'East'}).state;
 assert.equal(publicEncounter(spotted).novice,19);
 assert.equal(publicEncounter(applyEncounter(spotted,{type:'face',facing:'West'}).state).novice,null);
 const seed=seedEncounter('capture'),caught=applyEncounter(seed,{type:'move-guard',dot:19}).state;
 assert.equal(caught.caught,true);assert.equal(caught.captures,1);assert.equal(caught.speed,'Walk');assert.equal(caught.key,true);assert.equal(caught.medicine,false);
 assert.equal(applyEncounter(caught,{type:'move-guard',dot:20}).accepted,false);
 assert.equal(seed.caught,false);assert.equal(seed.medicine,true);
 const visible=publicEncounter(caught);assert.ok(!('key' in visible));assert.ok(!('medicine' in visible));assert.equal(JSON.stringify(visible).includes('medicine'),false);
});
test('False Noise targets and cancels privately, publishes an ordinary clue, and reveals next phase',()=>{
 let s=seedEncounter('false-noise');
 assert.equal(applyEncounter(s,{type:'place-noise'}).accepted,false);
 s=applyEncounter(s,{type:'blessing'}).state;
 assert.equal(applyEncounter(s,{type:'target',dot:72}).accepted,false);
 s=applyEncounter(s,{type:'target',dot:43}).state;
 assert.deepEqual(publicEncounter(s).clues,[]);assert.equal(publicEncounter(s).blessingRevealed,false);assert.ok(!('target' in publicEncounter(s)));
 const cancelled=applyEncounter(s,{type:'cancel-blessing'}).state;assert.equal(cancelled.blessing,'ready');assert.equal(cancelled.target,null);
 s=applyEncounter(s,{type:'place-noise'}).state;
 const p=publicEncounter(s);assert.deepEqual(p.clues,[{guard:23,toward:43,kind:'noise'}]);assert.equal(p.novice,null);assert.equal(p.blessingRevealed,false);assert.equal(JSON.stringify(p).includes('false-noise'),false);
 assert.equal(applyEncounter(s,{type:'blessing'}).accepted,false);
 s=applyEncounter(s,{type:'next-hearing'}).state;assert.equal(publicEncounter(s).blessingRevealed,true);assert.equal(s.blessing,'revealed');
});
