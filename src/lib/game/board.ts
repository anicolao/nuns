import data from './board-manifest.json' with {type:'json'};
import tables from './sight-tables.json' with {type:'json'};
export const BOARD_WIDTH=1000,BOARD_HEIGHT=1038;
export const board=data;
export const nodes=board.locations;
export const nodeById=new Map(nodes.map(n=>[n.id,n]));
export type Point={x:number;y:number};
export const edgeId=(a:number,b:number)=>[a,b].sort((x,y)=>x-y).join('-');
// The reference application symmetrizes connections. In particular 67 -> 68 is
// only listed on node 67 in its source data; preserve that undirected edge.
export const connections=Array.from(new Set(nodes.flatMap(n=>n.connections.map(id=>edgeId(n.id,id))))).map(id=>{
 const [a,b]=id.split('-').map(Number);const bend=board.crookedConnections.find(c=>edgeId(c.from,c.to)===id);
 const via=bend?(bend.from===a?bend.via:[...bend.via].reverse()):[];
 return {id,a,b,points:[nodeById.get(a)!,...via,nodeById.get(b)!]};
});
export const neighbors=(id:number)=>connections.filter(e=>e.a===id||e.b===id).map(e=>e.a===id?e.b:e.a);
export function isLocked(a:number,b:number){return board.locks.some(l=>edgeId(l.from,l.to)===edgeId(a,b));}
export function shortestPath(from:number,to:number,hasKey=true):number[]{
 if(!nodeById.has(from)||!nodeById.has(to))return[];
 const queue=[[from]],seen=new Set([from]);for(let i=0;i<queue.length;i++){
  const path=queue[i],last=path.at(-1)!;if(last===to)return path;
  for(const next of neighbors(last)){if(seen.has(next)||(!hasKey&&isLocked(last,next)))continue;seen.add(next);queue.push([...path,next]);}
 }return[];
}
export const distance=(a:number,b:number)=>{const p=shortestPath(a,b);return p.length?p.length-1:Infinity;};
export function soundDirections(guard:number,source:number){const d=distance(guard,source);return neighbors(guard).filter(n=>distance(n,source)===d-1);}
export function isHeard(guard:number,source:number,roll:number,modifier:number,walking=true){return walking&&distance(guard,source)<=Math.max(0,roll+modifier);}
function cross(a:Point,b:Point,c:Point){return(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
export function intersects(a:Point,b:Point,c:Point,d:Point){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0;}
const authoritative=new Map(tables.pairs.map(p=>[edgeId(p.a,p.b),p.visible]));
export function geometricSight(a:number,b:number){
 if(a===b)return true;const from=nodeById.get(a),to=nodeById.get(b);if(!from||!to)return false;
 if(from.invisible||to.invisible)return false;
 return !board.walls.some(w=>intersects(from,to,{x:w.x1,y:w.y1},{x:w.x2,y:w.y2}));
}
export function clearSight(a:number,b:number){
 if(!nodeById.has(a)||!nodeById.has(b))return false;if(a===b)return true;
 if(nodeById.get(a)?.invisible||nodeById.get(b)?.invisible)return false;
 return authoritative.get(edgeId(a,b))??geometricSight(a,b);
}
export function hasLineOfSight(a:number,b:number){return distance(a,b)<=6&&clearSight(a,b);}
export type Facing='North'|'East'|'South'|'West';
export function isVisible(guard:number,target:number,facing:Facing){
 if(!hasLineOfSight(guard,target))return false;const a=nodeById.get(guard)!,b=nodeById.get(target)!;
 return facing==='North'?b.y<=a.y:facing==='South'?b.y>=a.y:facing==='East'?b.x>=a.x:b.x<=a.x;
}
export function roomAt(id:number){const n=nodeById.get(id);if(!n)return 'Unknown';const{x,y}=n;
 if(id<=6)return ['Anne Marie','Margaret','Theresa','Celeste','Angelica','Bernadette'][id-1]+'’s cell';
 if([82,107,130,149,67,72,10,36].includes(id))return ({82:'Outer Garden · tree',107:'Chapel · confessional',130:'Chapel',149:'Chapel side passage',67:'Cloister · walled niche',72:'Parlour',10:'Main Store',36:'Toilet'} as Record<number,string>)[id];
 if(id===103)return 'Chapel · confessional';
 if(id===109)return 'Garden-side room · letter from Mom';
 if(id===110)return 'Outside path · letter from Lover';
 if(id===84)return 'Outer Garden · Garden Gate';
 if(id===122)return 'Entry Hall · Pharmacy door';
 if([134,135,150].includes(id))return 'Chapel · altar';
 if(x<150&&y>760)return 'Main Store';if(y>908&&x<388)return x>240?'Lavatorium':'Laundry';
 if(y>760&&y<861&&x>637&&x<759)return 'Abbess’s cell';if(y>752&&y<861&&x>759&&x<879)return 'Prioress’s cell';
 if(x>463&&x<590&&y>752&&y<861)return 'Chapter Room';if(x>398&&x<463&&y>700&&y<861)return 'Toilet';
 if(x>600&&x<692&&y<212)return 'Kitchen';if(x>542&&x<600&&y<159)return 'Pantry';if(x>692&&y<212)return 'Refectory';
 if(x>604&&x<765&&y>254&&y<326)return 'Library';if(x>604&&x<765&&y>326&&y<408)return 'Scriptorium';
 if(x>815&&x<881&&y>254&&y<326)return 'Pharmacy';if(x>815&&x<881&&y>326&&y<408)return 'Pharmacy side room';
 if(x>815&&x<881&&y>458&&y<545)return 'Parlour';
 if(x>463&&x<815&&y>408&&y<752)return 'Cloister';
 if(x>297&&x<463&&y>408&&y<649)return 'Chapel';
 if(x>214&&x<542&&y>89&&y<408)return 'Chapel';
 if(x>150&&x<214&&y>260&&y<413)return 'Garden Entry';if(x<398&&y>649&&y<908)return 'Inner Garden';if(x<297&&y>413&&y<649)return 'Outer Garden';
 if(x>881&&y>212)return 'Entry Hall';if(y<230&&x<542)return 'Outside path';return 'Connecting corridor';
}
export const patrols=board.guardRoutes.filter(r=>r.path.length>0);
export const patrolColors=['blue','green','purple','red','orange'] as const;
export const colors:Record<string,string>={...board.colours,blue:'#35a4ed',green:'#55bd63',purple:'#ba7de0',red:'#ef5555',orange:'#ffa447',yellow:'#f1d64f',white:'#f8efd7'};
export const endpoints=[26,84,101,122,147];
export function edgeColors(a:number,b:number){return patrolColors.filter(c=>patrols.some(r=>r.colour===c&&r.path.some((n,i)=>i>0&&edgeId(n,r.path[i-1])===edgeId(a,b))));}
export function polyline(points:Point[]){return points.map(p=>`${p.x},${p.y}`).join(' ');}
export function offsetPoints(points:Point[],offset:number){const first=points[0],last=points.at(-1)!,dx=last.x-first.x,dy=last.y-first.y,d=Math.hypot(dx,dy)||1;return points.map(p=>({x:p.x-dy/d*offset,y:p.y+dx/d*offset}));}
export const doors=connections.flatMap(e=>{
 const hits:Point[]=[];for(let i=1;i<e.points.length;i++){const a=e.points[i-1],b=e.points[i];for(const w of board.walls){const c={x:w.x1,y:w.y1},d={x:w.x2,y:w.y2};if(!intersects(a,b,c,d))continue;const den=(a.x-b.x)*(c.y-d.y)-(a.y-b.y)*(c.x-d.x);if(!den)continue;const t=((a.x-c.x)*(c.y-d.y)-(a.y-c.y)*(c.x-d.x))/den;hits.push({x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)});}}
 return hits.map(p=>({...p,a:e.a,b:e.b,locked:isLocked(e.a,e.b)}));
});
export {tables};

export function pathPoints(path:number[]){return path.flatMap((id,i)=>{if(!i)return[nodeById.get(id)!];const prev=path[i-1],edge=connections.find(e=>e.id===edgeId(prev,id));if(!edge)return[];const points=edge.a===prev?edge.points:[...edge.points].reverse();return points.slice(1);});}
