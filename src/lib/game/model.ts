import type {Facing} from './board.ts';
import type {Speed} from '../review.ts';
export const ENGINE_VERSION=1;
export const EDITION='mayfair-2010-v1';
export type GuardId='abbess'|'prioress';
export type BlessingKind='extra-move'|'distance'|'reroll'|'false-noise';
export type Blessing={kind:BlessingKind;used:boolean;revealRound:number|null};
export type Seat={uid:string;name:string;role:'novice'|'guard';character:number;ready:boolean};
export type Novice={uid:string;character:number;dot:number;wish:number;key:boolean;item:boolean;caught:boolean;captures:number;speed:Speed;firstSpeed:Speed|null;submitted:boolean;rolled:boolean;immuneRound:number;extra:boolean;blessing:Blessing;log:{round:number;segment:number;route:number[];speed:Speed;key:boolean;item:boolean}[]};
export type Patrol={card:number;path:number[];index:number};
export type Guard={id:GuardId;uid:string;dot:number;facing:Facing;speed:'Walk'|'Run';lastSpeed:'Walk'|'Run'|null;steps:number;finished:boolean;rolled:boolean;free:boolean;extra:boolean;patrol:Patrol|null;blessing:Blessing};
export type Clue={id:string;kind:'noise'|'vanished';at:number;toward:number;guard:GuardId|null};
export type PendingRoll={roller:string;value:number;adjustments:Record<string,number>};
export type Phase='lobby'|'patrols'|'novices'|'novice-hearing'|'guards'|'guard-hearing'|'ended';
export type RoomState={version:1;edition:typeof EDITION;revision:number;host:string;mode:'personal'|'tabletop';capacity:number;seats:Seat[];phase:Phase;round:number;segment:number;seed:number;epoch:number;novices:Novice[];guards:Guard[];availablePatrols:number[];clues:Clue[];captures:number;pending:PendingRoll|null;winners:string[];winnerTeam:'novices'|'guards'|null;messages:string[]};
export type Intent=
 |{type:'create';capacity:number;mode:'personal'|'tabletop'}
 |{type:'join';name:string;role:'novice'|'guard';character:number}
 |{type:'ready';ready:boolean}
 |{type:'start';seed:number}
 |{type:'patrol';guard:GuardId;card:number}
 |{type:'novice-move';route:number[];speed:Speed}
 |{type:'novice-roll';value:number}
 |{type:'guard-speed';guard:GuardId;speed:'Walk'|'Run'}
 |{type:'guard-step';guard:GuardId;dot:number}
 |{type:'guard-finish';guard:GuardId}
 |{type:'guard-roll';guard:GuardId;value:number}
 |{type:'resolve-roll'}
 |{type:'blessing';entity:string;guard?:GuardId;toward?:number;value?:number}
 |{type:'advance'}
 |{type:'rematch';seed:number};
export type GameEvent={version:1;sequence:number;id:string;actor:string;intent:Intent};
export const noviceNames=['Anne Marie','Margaret','Theresa','Celeste','Angelica','Bernadette'];
export const blessingNames:Record<BlessingKind,string>={'extra-move':'Extra Move',distance:'A Little Providence',reroll:'Try Again','false-noise':'False Noise'};
export const blessingCopy:Record<BlessingKind,string>={'extra-move':'Move one additional space. Sneak 2–3; Walk 4–5; Run up to 6.',distance:'After a roll: guard hearing +1, or your novice’s noise −1.',reroll:'After a roll: discard the result and roll again.','false-noise':'Place a noise beside a guard. A novice reveals this card in the next hearing phase.'};
export const speeds:Record<Speed,{min:number;max:number;noise:number}>={Still:{min:0,max:0,noise:-3},Sneak:{min:1,max:2,noise:-2},Walk:{min:3,max:4,noise:-1},Run:{min:1,max:5,noise:0}};
