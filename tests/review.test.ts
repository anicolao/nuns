import test from 'node:test';
import assert from 'node:assert/strict';
import {initialReview,applyReview} from '../src/lib/review.ts';

test('capture fixture changes dependent values without changing the prior snapshot',()=>{
 let state=initialReview();state=applyReview(state,{type:'collect',item:'key'}).state;state=applyReview(state,{type:'collect',item:'medicine'}).state;state=applyReview(state,{type:'speed',speed:'Run'}).state;
 const before=structuredClone(state),caught=applyReview(state,{type:'status'});
 assert.equal(caught.state.caught,true);assert.equal(caught.state.speed,'Walk');assert.equal(caught.state.key,true);assert.equal(caught.state.medicine,false);assert.deepEqual(state,before);
 const invalid=applyReview(caught.state,{type:'speed',speed:'Run'});assert.equal(invalid.accepted,false);assert.equal(invalid.state,caught.state);assert.match(invalid.message,/[Ww]alk.*cell/);
 assert.equal(before.speed,'Run');assert.equal(before.medicine,true);
});
test('medicine rejects before keys, guard movement rejects disconnected nodes',()=>{
 const state=initialReview();const medicine=applyReview(state,{type:'collect',item:'medicine'});assert.equal(medicine.accepted,false);assert.equal(medicine.state,state);
 const move=applyReview(state,{type:'move',dot:40});assert.equal(move.accepted,true);assert.equal(move.state.previousDot,26);assert.equal(move.state.guardDot,40);assert.equal(state.guardDot,26);
 const invalid=applyReview(move.state,{type:'move',dot:91});assert.equal(invalid.accepted,false);assert.equal(invalid.state,move.state);
});
test('reverse belongs to the exact card and does not alter other cards',()=>{
 const initial=initialReview(),wish=applyReview(initial,{type:'reverse',card:'wish'}).state;
 assert.equal(wish.reversed.wish,true);assert.equal(wish.reversed.blessing,undefined);assert.deepEqual(initial.reversed,{});
 const blessing=applyReview(wish,{type:'reverse',card:'blessing'}).state;assert.equal(blessing.reversed.wish,true);assert.equal(blessing.reversed.blessing,true);
 assert.equal(applyReview(blessing,{type:'reverse',card:'wish'}).state.reversed.wish,false);
});
