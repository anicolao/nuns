import {neighbors,nodeById,isLocked,isVisible,isHeard,soundDirections,type Facing} from './board.ts';
import {applyCapture,type Speed} from '../review.ts';
/** Shared interaction slice. Scenario seeds are explicit; this is not a full turn engine. */
export type EncounterMode='novice'|'hearing'|'sight'|'capture'|'false-noise';
export type Clue={guard:number;toward:number;kind:'noise'|'vanished'};
export type PublicEncounter={guardDot:number;facing:Facing;novice:number|null;clues:Clue[];captures:number;speed:Speed|null;caught:boolean;blessingRevealed:boolean;message:string};
export type Encounter={mode:EncounterMode;guardDot:number;facing:Facing;noviceDot:number;route:number[];speed:Speed;committed:boolean;key:boolean;medicine:boolean;caught:boolean;captures:number;clues:Clue[];listened:boolean;blessing:'ready'|'targeting'|'placed'|'revealed';target:number|null;message:string};
export type EncounterAction={type:'step';dot:number}|{type:'speed';speed:Speed}|{type:'undo-step'}|{type:'commit'}|{type:'move-guard';dot:number}|{type:'face';facing:Facing}|{type:'listen';roll:number}|{type:'blessing'}|{type:'target';dot:number}|{type:'cancel-blessing'}|{type:'place-noise'}|{type:'next-hearing'};
export const movement:Record<Speed,{min:number;max:number;noise:number}>={Still:{min:0,max:0,noise:-3},Sneak:{min:1,max:2,noise:-2},Walk:{min:3,max:4,noise:-1},Run:{min:1,max:5,noise:0}};
export function seedEncounter(mode:EncounterMode):Encounter {
 const noviceDot=mode==='novice'?4:mode==='hearing'||mode==='false-noise'?72:19;
 return {mode,guardDot:mode==='hearing'||mode==='false-noise'||mode==='novice'?23:18,facing:mode==='sight'?'West':'East',noviceDot,route:[noviceDot],speed:mode==='hearing'?'Walk':'Sneak',committed:false,key:mode==='capture',medicine:mode==='capture',caught:false,captures:0,clues:[],listened:false,blessing:'ready',target:null,message:mode==='novice'?'Plan your route on the lit spaces.':mode==='hearing'?'Walk complete. Roll to listen for footsteps.':mode==='sight'?'Tap the Abbess to turn east and look down the corridor.':mode==='capture'?'Move onto Celeste’s space to catch her.':'Your blessing can create a noise beside a guard.'};
}
export function publicEncounter(s:Encounter):PublicEncounter {
 const visible=isVisible(s.guardDot,s.noviceDot,s.facing);
 const message=s.caught?'Celeste caught · 1 capture.':visible?'Celeste is in sight.':s.blessing==='revealed'?'False Noise blessing revealed.':s.clues.length?'A noise was heard.':s.committed?`${s.speed} revealed. Route stays private.`:'The abbey is quiet.';
 return {guardDot:s.guardDot,facing:s.facing,novice:visible?s.noviceDot:null,clues:s.clues.map(c=>({...c})),captures:s.captures,speed:s.committed?s.speed:null,caught:s.caught,blessingRevealed:s.blessing==='revealed',message};
}
export function seedPublicEncounter(mode:EncounterMode):PublicEncounter {return publicEncounter(seedEncounter(mode));}
export function routeOptions(s:Encounter) {
 if(s.mode!=='novice'||s.committed||s.route.length-1>=movement[s.speed].max)return [];
 return neighbors(s.route.at(-1)!).filter(dot=>s.key||!isLocked(s.route.at(-1)!,dot));
}
export function canCommit(s:Encounter){const steps=s.route.length-1;return s.mode==='novice'&&!s.committed&&steps>=movement[s.speed].min&&steps<=movement[s.speed].max;}
export function applyEncounter(state:Encounter,action:EncounterAction):{state:Encounter;accepted:boolean} {
 const s:Encounter={...state,route:[...state.route],clues:[...state.clues]};
 const reject=(message:string)=>({state:{...state,message},accepted:false});
 switch(action.type){
 case 'speed':
  if(s.mode!=='novice'||s.committed)return reject('Movement has already been committed.');
  s.speed=action.speed;s.route=[s.noviceDot];s.message=`${s.speed}: choose ${movement[s.speed].min}–${movement[s.speed].max} steps.`;break;
 case 'step':
  if(!routeOptions(s).includes(action.dot))return reject('Choose a lit adjacent space within your movement allowance.');
  s.route.push(action.dot);s.message=`Private route: ${s.route.join(' → ')}.`;break;
 case 'undo-step':
  if(s.committed||s.route.length<=1)return reject('No uncommitted step to undo.');
  s.route.pop();s.message='Last planned step removed.';break;
 case 'commit':
  if(!canCommit(s))return reject('Complete the required number of steps first.');
  s.noviceDot=s.route.at(-1)!;s.committed=true;s.message=`${s.speed} committed. Only your speed and any sightings are public.`;break;
 case 'move-guard':
  if(!['hearing','sight','capture'].includes(s.mode)||!neighbors(s.guardDot).includes(action.dot))return reject('Move the guard to an adjacent lit space.');
  if(s.caught)return reject('This encounter is resolved.');
  const a=nodeById.get(s.guardDot)!,b=nodeById.get(action.dot)!;
  s.facing=Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?(b.x>a.x?'East':'West'):(b.y>a.y?'South':'North');
  s.guardDot=action.dot;
  if(s.guardDot===s.noviceDot){Object.assign(s,applyCapture(s).state);s.captures++;s.message='Celeste caught. She must walk toward her cell; keys are retained and any wish item is returned.';}
  else s.message=isVisible(s.guardDot,s.noviceDot,s.facing)?'Celeste spotted. Her piece is now on the public board.':'No novice is in sight.';
  break;
 case 'face':
  if(!['hearing','sight','capture'].includes(s.mode))return reject('Only a guard can change facing.');
  s.facing=action.facing;s.message=isVisible(s.guardDot,s.noviceDot,s.facing)?'Celeste spotted. Her piece is now on the public board.':'No novice is in sight.';break;
 case 'listen':
  if(s.mode!=='hearing'||s.listened||!Number.isInteger(action.roll)||action.roll<1||action.roll>6)return reject('This listening check has already resolved or the roll is invalid.');
  s.listened=true;
  s.clues=isHeard(s.guardDot,s.noviceDot,action.roll,movement[s.speed].noise)?soundDirections(s.guardDot,s.noviceDot).map(toward=>({guard:s.guardDot,toward,kind:'noise' as const})):[];
  s.message=s.clues.length?`Roll ${action.roll}: footsteps heard. Follow the bell’s direction; the source stays hidden.`:`Roll ${action.roll}: no footsteps heard.`;break;
 case 'blessing':
  if(s.mode!=='false-noise'||s.blessing!=='ready')return reject('This blessing is not available.');
  s.blessing='targeting';s.message='Tap a lit direction beside the Abbess.';break;
 case 'target':
  if(s.blessing!=='targeting'||!neighbors(s.guardDot).includes(action.dot))return reject('Choose a lit direction beside the guard.');
  s.target=action.dot;s.message=`Noise direction ${action.dot} selected. Confirm to place it.`;break;
 case 'cancel-blessing':
  if(s.blessing!=='targeting')return reject('There is no uncommitted blessing to cancel.');
  s.blessing='ready';s.target=null;s.message='Blessing kept. Nothing was revealed.';break;
 case 'place-noise':
  if(s.blessing!=='targeting'||s.target===null)return reject('Choose a direction on the board first.');
  s.clues.push({guard:s.guardDot,toward:s.target,kind:'noise'});s.blessing='placed';s.message='Noise placed. Keep the blessing hidden until the next hearing phase.';s.target=null;break;
 case 'next-hearing':
  if(s.blessing!=='placed')return reject('Place the noise before advancing to its reveal phase.');
  s.blessing='revealed';s.message='Next hearing phase: False Noise is revealed and discarded.';break;
 }
 return {state:s,accepted:true};
}
