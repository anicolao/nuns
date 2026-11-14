import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MotionPlayer} from '../src/lib/motion/player.ts';
// Transport tests use controllable browser Animation handles; no alternative renderer.
function handle(){return {currentTime:0 as number|null,playState:'running',playbackRate:1,pause(){this.playState='paused';},play(){this.playState='running';},cancel(){this.playState='idle';this.currentTime=null;},updatePlaybackRate(rate:number){this.playbackRate=rate;}};}
globalThis.requestAnimationFrame=()=>1;
globalThis.cancelAnimationFrame=()=>{};
test('retained playback seeks and replays the actual handles without changing game state',()=>{
 const player=new MotionPlayer(),a=handle(),b=handle();
 player.play([a,b] as unknown as Animation[],640);
 player.seek(320);assert.equal(a.currentTime,320);assert.equal(b.currentTime,320);assert.equal(player.running,false);
 player.seek(900);assert.equal(player.time,640);
 player.seek(-20);assert.equal(player.time,0);
 player.replay();assert.equal(player.running,true);assert.equal(a.currentTime,0);
 player.speed(.25);assert.equal(a.playbackRate,.25);assert.equal(b.playbackRate,.25);
 player.clear();assert.equal(player.duration,0);assert.equal(a.playState,'idle');assert.equal(b.playState,'idle');
});
test('new actions cancel retained transforms and notify render subscribers for die scrubbing',()=>{
 const player=new MotionPlayer(),old=handle(),next=handle();let renders=0;
 player.frames.add(()=>renders++);player.play([old] as unknown as Animation[],640);
 player.play([next] as unknown as Animation[],640);assert.equal(old.playState,'idle');
 const before=renders;player.seek(100);assert.ok(renders>before);assert.equal(next.currentTime,100);
 player.clear();
});
