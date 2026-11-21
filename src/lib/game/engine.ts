import {board,nodes,nodeById,neighbors,isLocked,distance,shortestPath,isVisible,hasLineOfSight,soundDirections,type Facing} from './board.ts';
import {EDITION,ENGINE_VERSION,speeds,noviceNames,type RoomState,type Seat,type Novice,type Guard,type GuardId,type Blessing,type Intent,type GameEvent,type Clue} from './model.ts';
export class IllegalChoice extends Error {}
function need(condition:unknown,message:string):asserts condition {if(!condition)throw new IllegalChoice(message);}
const ended=(s:RoomState)=>s.phase==='ended';
const revisionOf=(s:RoomState|null)=>s?.revision??0;
const say=(s:RoomState,message:string)=>{s.messages.push(message);s.messages=s.messages.slice(-100);};
export function facingBetween(a:number,b:number):Facing{const x=nodeById.get(a)!,y=nodeById.get(b)!;return Math.abs(y.x-x.x)>Math.abs(y.y-x.y)?(y.x>x.x?'East':'West'):(y.y>x.y?'South':'North');}
function shuffle<T>(items:T[],random:()=>number){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function random(seed:number){let x=seed>>>0||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
export function validSeed(seed:number){return Number.isSafeInteger(seed)&&seed>0&&seed<=0xffffffff;}
export function controlsGuard(s:RoomState,actor:string,g:Guard){return g.uid===actor||(s.mode==='tabletop'&&s.host===actor);}
export function seenBy(s:RoomState,n:Novice){return s.guards.filter(g=>isVisible(g.dot,n.dot,g.facing));}
export function isNoviceVisible(s:RoomState,n:Novice){return seenBy(s,n).length>0;}
function activeNovices(s:RoomState){return s.novices.filter(n=>n.immuneRound!==s.round&&!n.caught);}
function guard(s:RoomState,id:GuardId,actor:string){const g=s.guards.find(g=>g.id===id);need(g,'Unknown guard.');need(controlsGuard(s,actor,g),'This guard belongs to another player.');return g;}
function novice(s:RoomState,actor:string){const n=s.novices.find(n=>n.uid===actor);need(n,'Only a novice can choose this action.');return n;}
function addClue(s:RoomState,kind:Clue['kind'],at:number,toward:number,g:GuardId|null){s.clues.push({id:`${s.revision+1}:${s.clues.length}`,kind,at,toward,guard:g});}
function evidence(s:RoomState,g:Guard){return s.novices.some(n=>!n.caught&&isVisible(g.dot,n.dot,g.facing))||s.clues.some(c=>c.kind==='noise'?c.guard===g.id:isVisible(g.dot,c.at,g.facing));}
function capture(s:RoomState,g:Guard){
 for(const n of s.novices)if(n.dot===g.dot&&!n.caught&&n.immuneRound!==s.round&&n.dot!==n.character+1){n.caught=true;n.item=false;n.speed='Walk';n.captures++;s.captures++;say(s,`${noviceNames[n.character]} was caught by the ${g.id==='abbess'?'Abbess':'Prioress'}.`);}
 if(s.captures>=s.seats.length){s.phase='ended';s.winnerTeam='guards';s.winners=[...new Set(s.guards.map(g=>g.uid))];say(s,'The guards win by captures.');}
}
function checkSight(s:RoomState,legacy=false){for(const g of s.guards){if(evidence(s,g))g.free=true;}if(!legacy)for(const n of s.novices)if(n.caught&&!isNoviceVisible(s,n)){n.caught=false;n.immuneRound=s.round;}}
function beginGuards(s:RoomState){s.phase='guards';for(const g of s.guards){g.steps=0;g.finished=false;g.extra=false;g.speed='Walk';g.free=evidence(s,g);prepareFacing(s,g);}say(s,'The guards move.');}
function beginNovices(s:RoomState){s.phase='novices';for(const n of s.novices){n.submitted=false;n.rolled=n.caught||n.immuneRound===s.round;n.extra=false;}say(s,`Round ${s.round}${s.round===1?` · movement ${s.segment}/2`:''}: novices plan privately.`);}
function afterNovices(s:RoomState){
 const finished=s.novices.filter(n=>n.key&&n.item&&n.dot===n.character+1&&!n.caught);
 if(finished.length){const least=Math.min(...finished.map(n=>n.captures));s.winners=finished.filter(n=>n.captures===least).map(n=>n.uid);s.winnerTeam='novices';s.phase='ended';say(s,'The novice winners are home with their secret wishes.');return;}
 if(s.guards.some(g=>g.lastSpeed==='Walk')&&activeNovices(s).length){s.phase='novice-hearing';for(const n of s.novices)n.rolled=n.caught||n.immuneRound===s.round;say(s,'Novices check for noise.');}
 else afterNoviceHearing(s);
}
function afterNoviceHearing(s:RoomState){if(s.round===1&&s.segment===1){s.segment=2;beginNovices(s);}else beginGuards(s);}
function setup(s:RoomState,seed:number){
 need(validSeed(seed),'Choose a valid setup seed.');const guards=s.seats.filter(p=>p.role==='guard'),ns=s.seats.filter(p=>p.role==='novice');
 need(s.seats.length>=2&&s.seats.length<=8,'Two to eight players are required.');need(ns.length>=1&&ns.length<=6,'One to six novices are required.');need(guards.length===(s.seats.length===8?2:1),'Use one guard player, or two guard players in an eight-player game.');
 const rng=random(seed),wishes=shuffle(board.keys.map(k=>k.id),rng),deck=shuffle(['extra-move','distance','reroll','false-noise','extra-move','distance','reroll','false-noise'] as Blessing['kind'][],rng);
 const deal=():Blessing=>({kind:deck.pop()!,used:false,revealRound:null});
 s.firstTurnUndoClosed=false;s.seed=seed;s.epoch++;s.round=1;s.segment=1;s.captures=0;s.clues=[];s.pending=null;s.winners=[];s.winnerTeam=null;s.availablePatrols=Array.from({length:16},(_,i)=>i);
 s.novices=ns.map(p=>({uid:p.uid,character:p.character,dot:p.character+1,wish:wishes.pop()!,key:false,item:false,caught:false,captures:0,speed:'Sneak',firstSpeed:null,submitted:false,rolled:false,immuneRound:0,extra:false,blessing:deal(),log:[]}));
 s.guards=(['abbess','prioress'] as GuardId[]).map((id,i)=>({id,uid:guards[i%guards.length].uid,dot:26,facing:'South',speed:'Walk',lastSpeed:null,steps:0,finished:false,rolled:false,free:false,extra:false,patrol:null,blessing:deal()}));s.phase='patrols';say(s,'Choose each guard’s first patrol.');
}
export function availablePatrols(s:RoomState,g:Guard){return s.availablePatrols.filter(card=>card>=14?!!g.patrol&&g.patrol.path.includes(g.dot):(!g.patrol||g.patrol.index===g.patrol.path.length-1)&&(board.guardRoutes[card].a===g.dot||board.guardRoutes[card].b===g.dot));}
function returnSteps(g:Guard){
 const route=g.patrol;if(!route)return[];
 const points=route.path.slice(route.index);const d=Math.min(...points.map(p=>distance(g.dot,p)));
 if(d===0){const i=route.path.indexOf(g.dot,route.index);return i>=0&&i<route.path.length-1?[route.path[i+1]]:[];}
 return neighbors(g.dot).filter(next=>points.some(p=>distance(next,p)===d-1));
}
function prepareFacing(s:RoomState,g:Guard){
 if(g.free)return;const options=returnSteps(g);
 if(options.length===1){g.facing=facingBetween(g.dot,options[0]);if(evidence(s,g))g.free=true;}
}
export function legalGuardSteps(s:RoomState,g:Guard){if(s.phase!=='guards'||g.finished||g.steps>=(g.speed==='Run'?6:4)+(g.extra?1:0))return[];return g.free||evidence(s,g)?neighbors(g.dot):returnSteps(g);}
export function guardCanFinish(g:Guard){return !g.finished&&g.steps>=(g.speed==='Run'?5:3)+(g.extra?1:0)&&g.steps<=(g.speed==='Run'?6:4)+(g.extra?1:0);}
export function noviceBounds(n:Novice,speed=n.speed){const normal=speeds[speed];return{min:normal.min+(n.extra&&(speed==='Sneak'||speed==='Walk')?1:0),max:normal.max+(n.extra&&speed!=='Still'?1:0)};}
export function noviceOptions(s:RoomState,n:Novice,route:number[],speed=n.speed){
 const end=route.at(-1)??n.dot;if(s.phase!=='novices'||n.submitted||route.length-1>=noviceBounds(n,speed).max)return[];
 if(n.caught&&!route.slice(1).some(dot=>!s.guards.some(g=>isVisible(g.dot,dot,g.facing)))){const home=n.character+1,d=shortestPath(end,home,n.key).length-1;return neighbors(end).filter(next=>(n.key||!isLocked(end,next))&&shortestPath(next,home,n.key).length-1===d-1);}
 const wish=board.keys.find(k=>k.id===n.wish)!;if(n.key&&end===wish.goalnode&&route.length>1)return[];
 return neighbors(end).filter(next=>n.key||!isLocked(end,next));
}
function resolve(s:RoomState){
 const p=s.pending;need(p,'There is no pending roll.');
 const rollGuards=p.roller==='abbess'||p.roller==='prioress'?s.guards.filter(g=>g.id===p.roller):s.guards.filter(g=>g.lastSpeed==='Walk');
 const ns=p.roller==='abbess'||p.roller==='prioress'?activeNovices(s):s.novices.filter(n=>n.uid===p.roller&&!n.caught&&n.immuneRound!==s.round);
 for(const g of rollGuards)for(const n of ns){const range=Math.max(0,p.value+speeds[n.speed].noise+(p.adjustments[g.id]??0)+(p.adjustments[n.uid]??0));if(distance(g.dot,n.dot)<=range){for(const toward of soundDirections(g.dot,n.dot))addClue(s,'noise',g.dot,toward,g.id);say(s,`The ${g.id==='abbess'?'Abbess':'Prioress'} hears a noise.`);}}
 if(p.roller==='abbess'||p.roller==='prioress')s.guards.find(g=>g.id===p.roller)!.rolled=true;else s.novices.find(n=>n.uid===p.roller)!.rolled=true;
 s.pending=null;if(s.phase==='novice-hearing'&&s.novices.every(n=>n.rolled))afterNoviceHearing(s);
}
export function canUndoFirstTurn(s:RoomState,n:Novice){return s.round===1&&!s.firstTurnUndoClosed&&['novices','guards'].includes(s.phase)&&n.captures===0&&n.log.some(e=>e.round===1)&&s.guards.every(g=>g.steps===0&&!g.finished&&!g.extra);}
export function applyIntent(previous:RoomState|null,actor:string,intent:Intent,legacy=false):RoomState {
 need(typeof actor==='string'&&actor.length>0,'An authenticated actor is required.');need(intent&&typeof intent.type==='string','Malformed choice.');
 if(intent.type==='create'){
  need(!previous,'This room already exists.');need(Number.isInteger(intent.capacity)&&intent.capacity>=2&&intent.capacity<=8,'Capacity must be two to eight.');need(['personal','tabletop'].includes(intent.mode),'Unknown room mode.');
  return {version:legacy?1:2,edition:legacy?'mayfair-2010-v1':EDITION,revision:0,host:actor,mode:intent.mode,capacity:intent.capacity,seats:[],phase:'lobby',round:0,segment:0,seed:0,epoch:0,novices:[],guards:[],availablePatrols:[],clues:[],captures:0,pending:null,winners:[],winnerTeam:null,messages:['The abbey is open. Join a side.']};
 }
 need(previous,'Create the room first.');const s=structuredClone(previous);
 if(s.round===1&&s.phase==='guards'&&['patrol','guard-speed','guard-step','guard-finish'].includes(intent.type))s.firstTurnUndoClosed=true;
 switch(intent.type){
 case 'join':{
  need(s.phase==='lobby','The game has already begun.');need(!s.seats.some(p=>p.uid===actor),'You already have a seat.');need(s.seats.length<s.capacity,'This room is full.');
  need(typeof intent.name==='string','Enter a name.');const name=intent.name.trim();need(name.length>=1&&name.length<=30,'Use a name of 1–30 characters.');need(intent.role==='novice'||intent.role==='guard','Choose novice or guard.');
  need(Number.isInteger(intent.character)&&intent.character>=0&&intent.character<6,'Choose a novice character.');
  if(intent.role==='novice'){need(s.seats.filter(p=>p.role==='novice').length<6,'All novices are taken.');need(!s.seats.some(p=>p.role==='novice'&&p.character===intent.character),'That novice is already taken.');}
  else need(s.seats.filter(p=>p.role==='guard').length<(s.capacity===8?2:1),'All guard seats are taken.');
  s.seats.push({uid:actor,name,role:intent.role,character:intent.character,ready:false});say(s,`${name} joined the abbey.`);break;
 }
 case 'ready':{need(s.phase==='lobby','The game has already begun.');const p=s.seats.find(p=>p.uid===actor);need(p,'Join a seat first.');need(typeof intent.ready==='boolean','Invalid readiness.');p.ready=intent.ready;break;}
 case 'start':need(actor===s.host,'Only the host can start.');need(s.phase==='lobby','Already started.');need(s.seats.every(p=>p.ready),'Wait for every player to be ready.');setup(s,intent.seed);break;
 case 'rematch':need(actor===s.host&&s.phase==='ended','Only the host can rematch a finished game.');setup(s,intent.seed);say(s,'A new game begins with the same players.');break;
 case 'patrol':{
  need(s.phase==='patrols'||s.phase==='guards','Choose patrols before or during guard movement.');const g=guard(s,intent.guard,actor);need(!g.finished,'This guard has finished moving.');need(availablePatrols(s,g).includes(intent.card),'Choose an available patrol at this endpoint, or an About Turn card.');
  if(intent.card>=14){const path=[...g.patrol!.path].reverse();g.patrol={card:g.patrol!.card,path,index:path.indexOf(g.dot)};}
  else {const route=board.guardRoutes[intent.card];const path=route.a===g.dot?[...route.path]:[...route.path].reverse();g.patrol={card:intent.card,path,index:0};}
  s.availablePatrols=s.availablePatrols.filter(card=>card!==intent.card);prepareFacing(s,g);say(s,`${g.id==='abbess'?'Abbess':'Prioress'} chose ${intent.card>=14?'About Turn':board.guardRoutes[intent.card].colour+' patrol'}: ${g.patrol.path.join(' → ')}.`);
  if(s.phase==='patrols'&&s.guards.every(g=>g.patrol))beginNovices(s);break;
 }
 case 'novice-move':{
  need(s.phase==='novices','It is not novice movement.');const n=novice(s,actor);need(!n.submitted,'Your movement is already committed.');need(Object.hasOwn(speeds,intent.speed),'Unknown speed.');
  need(Array.isArray(intent.route)&&intent.route.length>=1&&intent.route.length<=7&&intent.route.every(dot=>Number.isInteger(dot)&&nodeById.has(dot)),'Invalid route.');need(intent.route[0]===n.dot,'Start at your current position.');
  if(n.caught)need(intent.speed==='Walk','A caught novice must walk home.');
  if(s.round===1&&s.segment===2&&n.firstSpeed!==null&&!n.caught)need(intent.speed===n.firstSpeed,'Use the same movement card for both first-round moves.');
  const steps=intent.route.length-1,bounds=noviceBounds(n,intent.speed);need(steps<=bounds.max&&(steps>=bounds.min||(n.caught&&intent.route.at(-1)===n.character+1)),'This route does not match your movement card.');
  for(let i=1;i<intent.route.length;i++){
   const from=intent.route[i-1],to=intent.route[i];need(neighbors(from).includes(to),'Every step must be adjacent.');need(n.key||!isLocked(from,to),'You need your key to open this door.');
   if(n.caught)need(shortestPath(to,n.character+1,n.key).length===shortestPath(from,n.character+1,n.key).length-1,'Walk toward your cell by a shortest legal route.');
   const clueCount=s.clues.length;const before=seenBy(s,n);n.dot=to;const after=seenBy(s,n);
   if(!n.caught&&before.length&&!after.length)addClue(s,'vanished',from,to,null);
   if(s.round===1)n.firstTurnClueIds=[...(n.firstTurnClueIds??[]),...s.clues.slice(clueCount).map(c=>c.id)];
   checkSight(s,legacy);
   if(s.guards.some(g=>g.dot===n.dot)){need(i===intent.route.length-1,'Movement ends when a guard catches you.');for(const g of s.guards)capture(s,g);}
   const wish=board.keys.find(k=>k.id===n.wish)!;
   if(!n.caught&&n.key&&to===wish.goalnode){need(i===intent.route.length-1,'Stop when you reach your wish.');n.item=true;}
  }
  n.speed=n.caught?'Walk':intent.speed;n.submitted=true;if(s.round===1&&n.firstSpeed===null)n.firstSpeed=n.speed;
  const wish=board.keys.find(k=>k.id===n.wish)!;if(!n.caught&&n.dot===wish.node)n.key=true;
  if(n.caught&&(!isNoviceVisible(s,n)||n.dot===n.character+1)){if(legacy)n.dot=n.character+1;n.caught=false;n.immuneRound=s.round;}
  n.log.push({round:s.round,segment:s.round===1?n.log.filter(e=>e.round===1).length+1:s.segment,route:[...intent.route],speed:n.speed,key:n.key,item:n.item});say(s,`${noviceNames[n.character]} chose ${n.speed}${s.round===1?' · movement '+(n.log.filter(e=>e.round===1).length)+'/2':''}.`);
  if(s.round===1&&s.segment===2&&n.log.filter(e=>e.round===1).length<2)n.submitted=false;
  if(!ended(s)&&s.novices.every(n=>n.submitted))afterNovices(s);break;
 }
 case 'novice-undo':{
  const n=novice(s,actor);need(!legacy&&canUndoFirstTurn(s,n),'Only your first turn can be undone, before a guard acts.');
  s.clues=s.clues.filter(c=>!n.firstTurnClueIds?.includes(c.id));n.firstTurnClueIds=[];n.dot=n.character+1;n.key=false;n.item=false;n.caught=false;n.immuneRound=0;n.speed='Sneak';n.firstSpeed=null;n.submitted=false;n.log=n.log.filter(e=>e.round!==1);s.phase='novices';say(s,`${noviceNames[n.character]} undid her first turn.`);break;
 }
 case 'novice-roll':{
  need(s.phase==='novice-hearing'&&!s.pending,'Wait for the current noise roll.');const n=novice(s,actor);need(!n.rolled&&!n.caught,'No noise roll is due for you.');need(Number.isInteger(intent.value)&&intent.value>=1&&intent.value<=6,'A die result must be 1–6.');s.pending={roller:n.uid,value:intent.value,adjustments:{}};say(s,`${noviceNames[n.character]} rolled ${intent.value} for noise.`);break;
 }
 case 'guard-speed':{need(s.phase==='guards','It is not guard movement.');const g=guard(s,intent.guard,actor);need(g.steps===0&&!g.finished,'Choose speed before moving.');need(intent.speed==='Walk'||intent.speed==='Run','Guards walk or run.');g.speed=intent.speed;break;}
 case 'guard-step':{
  need(s.phase==='guards','It is not guard movement.');const g=guard(s,intent.guard,actor);need(legalGuardSteps(s,g).includes(intent.dot),'Choose a lit legal step on the patrol, or follow qualifying evidence.');
  g.facing=facingBetween(g.dot,intent.dot);checkSight(s,legacy);g.dot=intent.dot;g.steps++;
  if(g.patrol){const i=g.patrol.path.indexOf(g.dot,g.patrol.index);if(i>=0)g.patrol.index=i;}
  checkSight(s,legacy);capture(s,g);if(!ended(s))prepareFacing(s,g);break;
 }
 case 'guard-finish':{
  need(s.phase==='guards','It is not guard movement.');const g=guard(s,intent.guard,actor);need(guardCanFinish(g),'Walk 3–4 spaces or run 5–6 before finishing.');g.finished=true;g.lastSpeed=g.speed;say(s,`${g.id==='abbess'?'Abbess':'Prioress'} ${g.speed==='Walk'?'walked':'ran'} ${g.steps} spaces.`);
  if(s.guards.every(g=>g.finished)){s.phase='guard-hearing';s.clues=[];for(const x of s.guards)x.rolled=x.speed==='Run';for(const n of s.novices)if(n.blessing.used&&n.blessing.revealRound===s.round)say(s,`${noviceNames[n.character]} reveals False Noise.`);say(s,'Old clues cleared. Walking guards listen.');}break;
 }
 case 'guard-roll':{need(s.phase==='guard-hearing'&&!s.pending,'Wait for the current hearing roll.');const g=guard(s,intent.guard,actor);need(!g.rolled&&g.speed==='Walk','A running guard cannot listen.');need(Number.isInteger(intent.value)&&intent.value>=1&&intent.value<=6,'A die result must be 1–6.');s.pending={roller:g.id,value:intent.value,adjustments:{}};say(s,`${g.id==='abbess'?'Abbess':'Prioress'} rolled ${intent.value} to listen.`);break;}
 case 'resolve-roll':{need(s.pending,'There is no pending roll.');const roller=s.guards.find(g=>g.id===s.pending!.roller);need(roller?controlsGuard(s,actor,roller):s.pending.roller===actor,'Only the roller can resolve this hearing check.');resolve(s);break;}
 case 'blessing':{
  const n=s.novices.find(n=>n.uid===intent.entity),g=s.guards.find(g=>g.id===intent.entity);need(n||g,'Choose your novice or assigned guard.');need((n?.uid??g?.uid)===actor,'This blessing belongs to another player.');const b=(n??g)!.blessing;need(!b.used,'This blessing has already been used.');
  if(b.kind==='extra-move'){
   need(n?(s.phase==='novices'&&!n.submitted&&!n.caught):(s.phase==='guards'&&!g!.finished),'Use Extra Move during your movement.');(n??g)!.extra=true;b.used=true;b.revealRound=s.round;say(s,`${n?noviceNames[n.character]:g!.id} used Extra Move.`);
  }else if(b.kind==='false-noise'){
   need(s.phase==='guard-hearing','Use False Noise during guard hearing.');const target=s.guards.find(g=>g.id===intent.guard);need(target&&neighbors(target.dot).includes(intent.toward!), 'Choose a direction beside a guard.');addClue(s,'noise',target.dot,intent.toward!,target.id);b.used=true;b.revealRound=n?s.round+1:s.round;say(s,n?'A noise was heard.':`${g!.id==='abbess'?'Abbess':'Prioress'} used False Noise.`);
  }else {
   need(s.pending,'Play this blessing after a die roll, before it resolves.');
   if(b.kind==='reroll'){need(Number.isInteger(intent.value)&&intent.value!>=1&&intent.value!<=6,'A replacement die result must be 1–6.');s.pending.value=intent.value!;say(s,`The die was rerolled: ${intent.value}.`);}
   else{if(g)need(s.pending.roller===g.id||(s.phase==='novice-hearing'&&g.lastSpeed==='Walk'),'This guard is not listening to that roll.');if(n)need(s.pending.roller===n.uid||s.pending.roller==='abbess'||s.pending.roller==='prioress','Only your novice’s noise can be modified.');s.pending.adjustments[intent.entity]=g?1:-1;say(s,'A blessing changed the hearing distance.');}
   b.used=true;b.revealRound=s.round;
  }break;
 }
 case 'advance':{
  need(s.phase==='guard-hearing'&&!s.pending&&s.guards.every(g=>g.rolled),'Finish the hearing checks first.');need(s.guards.some(g=>controlsGuard(s,actor,g)),'Only the guard team can advance the round.');
  if(s.round===15){s.phase='ended';s.winnerTeam='guards';s.winners=[...new Set(s.guards.map(g=>g.uid))];say(s,'Round 15 is over. The guards win.');}
  else{s.round++;s.segment=1;beginNovices(s);}break;
 }
 default:throw new IllegalChoice('Unknown choice type.');
 }
 return s;
}
export function applyEvent(s:RoomState|null,e:GameEvent){need(e.version===1||e.version===ENGINE_VERSION,'This room needs a different engine version.');need(e.sequence===(s?.revision??0)+1,'Event sequence gap.');need(typeof e.id==='string'&&e.id.length>=8,'Invalid choice ID.');const next=applyIntent(s,e.actor,e.intent,e.version===1);next.version=e.version;next.edition=e.version===1?'mayfair-2010-v1':EDITION;next.revision=e.sequence;return next;}
export function replay(events:GameEvent[]){let state:RoomState|null=null;const diagnostics:{sequence:number;reason:string}[]=[];const ids=new Set<string>();for(const e of [...events].sort((a,b)=>a.sequence-b.sequence)){need(e.version===1||e.version===ENGINE_VERSION,'This room needs a different engine version.');need(e.sequence===revisionOf(state)+1,'The event log has a gap.');try{need(!ids.has(e.id),'Duplicate choice ID.');state=applyEvent(state,e);ids.add(e.id);}catch(error){if(!state)throw error;diagnostics.push({sequence:e.sequence,reason:error instanceof Error?error.message:String(error)});state={...state,revision:e.sequence};}}return{state,diagnostics};}
