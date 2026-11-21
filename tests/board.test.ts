import test from 'node:test';import assert from 'node:assert/strict';
import{board,nodes,connections,nodeById,neighbors,patrols,doors,distance,shortestPath,clearSight,hasLineOfSight,isVisible,isHeard,soundDirections,tables,roomAt,edgeId,pathPoints}from'../src/lib/game/board.ts';

test('all 155 source dots and 199 undirected edges are retained without invented nodes',()=>{
 assert.deepEqual(nodes.map(n=>n.id),Array.from({length:155},(_,i)=>i+1));assert.equal(connections.length,199);
 for(const n of nodes){for(const next of n.connections)assert.ok(neighbors(n.id).includes(next));for(const next of neighbors(n.id))assert.ok(neighbors(next).includes(n.id));assert.ok(Number.isFinite(distance(26,n.id)));}
 assert.deepEqual(neighbors(26).sort((a,b)=>a-b),[19,25,40]);assert.deepEqual(neighbors(67),[68]);
 assert.equal(nodeById.get(130)?.x,378);assert.equal(nodeById.get(130)?.y,250);assert.equal(roomAt(130),'Chapel');assert.equal(roomAt(121),'Pharmacy');assert.equal(roomAt(4),'Celeste’s cell');
});
test('every colored patrol step, lock and key objective references an original connection',()=>{
 assert.equal(patrols.length,14);assert.equal(board.locks.length,10);assert.equal(board.keys.length,8);assert.equal(new Set(board.keys.map(k=>k.goalnode)).size,7);
 for(const route of patrols){assert.equal(route.path[0],route.a);assert.equal(route.path.at(-1),route.b);for(let i=1;i<route.path.length;i++)assert.ok(neighbors(route.path[i-1]).includes(route.path[i]));}
 for(const lock of board.locks)assert.ok(neighbors(lock.from).includes(lock.to));
 assert.deepEqual(board.keys.map(k=>k.node),[10,36,82,107,130,149,67,72]);assert.ok(!shortestPath(26,121,false).length);assert.ok(shortestPath(26,121,true).length);
 assert.deepEqual(board.keys.filter(k=>k.goalnode===121).map(k=>k.colour),['red','red']);
});
test('all 897 printed visibility pairs and group statements are exact before facing/range',()=>{
 assert.equal(tables.pairs.length,897);for(const p of tables.pairs){assert.equal(clearSight(p.a,p.b),p.visible,`${p.a}–${p.b}`);assert.equal(clearSight(p.b,p.a),p.visible,`symmetric ${p.b}–${p.a}`);}
 assert.equal(clearSight(35,84),true);assert.ok(distance(35,84)>6);assert.equal(hasLineOfSight(35,84),false);
});
test('tree, confessionals, altar and cloister exceptions are preserved',()=>{
 for(const hidden of [82,103,107]){assert.equal(hasLineOfSight(hidden,hidden),true);for(const n of nodes)if(n.id!==hidden)assert.equal(hasLineOfSight(n.id,hidden),false);}
 assert.equal(hasLineOfSight(134,150),true);assert.equal(hasLineOfSight(135,150),true);assert.equal(hasLineOfSight(114,150),false);assert.equal(hasLineOfSight(114,134),false);
 assert.equal(hasLineOfSight(68,67),true);for(const target of [46,67,68])assert.equal(hasLineOfSight(91,target),false);
 assert.equal(hasLineOfSight(12,33),false);assert.equal(hasLineOfSight(110,154),false);
});
test('doors block sight but transmit sound; open passages stay open',()=>{
 assert.equal(distance(4,30),5);assert.equal(distance(30,88),5);assert.equal(distance(88,130),3);
 assert.equal(distance(23,72),5);assert.equal(isHeard(23,72,6,-1),true);assert.equal(isHeard(23,72,6,-2),false);assert.equal(isHeard(23,72,6,0,false),false);
 assert.deepEqual(soundDirections(23,72),[43]);
 for(const [a,b]of [[10,11],[7,8],[8,9],[118,119]])assert.equal(clearSight(a,b),true,`open passage ${a}–${b}`);
 assert.equal(clearSight(1,21),false);assert.equal(distance(1,21),1);assert.equal(isHeard(1,21,1,0),true);
 assert.equal(isVisible(18,19,'East'),true);assert.equal(isVisible(18,19,'West'),false);
});
test('curved connections keep their intermediate geometry without extra movement costs',()=>{
 assert.equal(board.crookedConnections.length,10);const points=pathPoints([63,65]);assert.ok(points.length>2);assert.equal(distance(63,65),1);
 assert.ok(doors.some(d=>edgeId(d.a,d.b)==='1-21'));
});
