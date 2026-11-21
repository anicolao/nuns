import {board} from './board.ts';
import {isNoviceVisible} from './engine.ts';
import {noviceNames,type RoomState,type GuardId,type BlessingKind,type Clue,type Phase} from './model.ts';
import type {Speed} from '../review.ts';
export type PublicGame={revision:number;epoch:number;round:number;segment:number;phase:Phase;captures:number;target:number;guards:{id:GuardId;dot:number;facing:'North'|'East'|'South'|'West';speed:'Walk'|'Run';steps:number;finished:boolean;patrol:number|null;path:number[];blessing:BlessingKind|null}[];novices:{uid:string;character:number;name:string;dot:number|null;caught:boolean;captures:number;speed:Speed|null;blessing:BlessingKind|null}[];clues:Clue[];messages:string[];winnerTeam:'novices'|'guards'|null;winners:string[]};
export function publicGame(s:RoomState):PublicGame {
 const revealed=(b:{used:boolean;revealRound:number|null;kind:BlessingKind})=>b.used&&b.revealRound!==null&&(b.revealRound<s.round||(b.revealRound===s.round&&s.phase==='guard-hearing')||b.revealRound===s.round&&b.kind!=='false-noise')?b.kind:null;
 const revealSpeed=s.phase!=='novices'||s.novices.every(n=>n.submitted);
 return {revision:s.revision,epoch:s.epoch,round:s.round,segment:s.segment,phase:s.phase,captures:s.captures,target:s.seats.length,
  guards:s.guards.map(g=>({id:g.id,dot:g.dot,facing:g.facing,speed:g.speed,steps:g.steps,finished:g.finished,patrol:g.patrol?.card??null,path:[...(g.patrol?.path??[])],blessing:revealed(g.blessing)})),
  novices:s.novices.map(n=>({uid:n.uid,character:n.character,name:noviceNames[n.character],dot:isNoviceVisible(s,n)?n.dot:null,caught:n.caught,captures:n.captures,speed:revealSpeed||n.submitted?n.speed:s.round===1&&s.segment===2?n.firstSpeed:null,blessing:revealed(n.blessing)})),
  clues:s.clues.map(c=>({...c})),messages:[...s.messages],winnerTeam:s.winnerTeam,winners:[...s.winners]};
}
export function privateWish(s:RoomState,uid:string){const n=s.novices.find(n=>n.uid===uid);if(!n)return null;return {novice:n,wish:board.keys.find(k=>k.id===n.wish)!};}
