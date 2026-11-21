import {test} from 'node:test';import assert from 'node:assert/strict';
import {fitCamera,focusCamera,zoomCamera,worldPoint,clampCamera} from '../src/lib/game/board-camera.ts';
import {nodes,BOARD_WIDTH,BOARD_HEIGHT,nodeById} from '../src/lib/game/board.ts';
test('whole-board fit retains every original space inside each device viewport without scrolling',()=>{
 for(const [width,height] of [[390,844],[844,390],[820,1180],[1440,900],[1920,1080]]){
  const c=fitCamera(width,height);
  assert.ok(c.x>=0&&c.y>=0);assert.ok(c.x+BOARD_WIDTH*c.scale<=width+.00001);assert.ok(c.y+BOARD_HEIGHT*c.scale<=height+.00001);
  for(const n of nodes){const x=c.x+n.x*c.scale,y=c.y+n.y*c.scale;assert.ok(x>=0&&x<=width&&y>=0&&y<=height);}
 }
});
test('phone focus keeps the guard visible and camera conversion preserves drop positions',()=>{
 for(const [width,height] of [[390,844],[844,390]])for(const n of nodes){
  const c=focusCamera(width,height,n),screen={x:c.x+n.x*c.scale,y:c.y+n.y*c.scale};
  assert.ok(screen.x>=0&&screen.x<=width&&screen.y>=0&&screen.y<=height);
  const p=worldPoint(c,screen);assert.ok(Math.abs(p.x-n.x)<1e-8&&Math.abs(p.y-n.y)<1e-8);
 }
});
test('zoom anchors stay fixed away from board bounds, and extreme pans cannot lose the board',()=>{
 const c=focusCamera(390,844,nodeById.get(26)!);const anchor={x:195,y:422};
 const before=worldPoint(c,anchor),after=worldPoint(zoomCamera(c,390,844,c.scale*1.2,anchor),anchor);
 assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<1e-8);
 const clamped=clampCamera({...c,x:99999,y:-99999},390,844);
 assert.ok(clamped.x<=0&&clamped.x+1000*c.scale>=390);assert.ok(clamped.y<=0&&clamped.y+1038*c.scale>=844);
});
