import{neighbors,nodeById,type Facing}from './game/board.ts';
/** Deterministic presentation fixtures, not published game legality. */
export type Speed = 'Still' | 'Sneak' | 'Walk' | 'Run';
export type ReviewState = { guardDot: number; previousDot: number; facing: Facing; speed: Speed; caught: boolean; key: boolean; medicine: boolean; reversed: Record<string, boolean> };
export type ReviewChoice = { type: 'move'; dot: number } | { type: 'face'; facing: Facing } | { type: 'speed'; speed: Speed } | { type: 'status' } | { type: 'collect'; item: 'key' | 'medicine' } | { type: 'reverse'; card: string };
export const initialReview = (): ReviewState => ({guardDot:26,previousDot:40,facing:'North',speed:'Sneak',caught:false,key:false,medicine:false,reversed:{}});
/** Apply a resolved capture, never a player decision or status toggle. */
export function applyCapture<T extends Pick<ReviewState,'caught'|'speed'|'medicine'>>(state: T) {
 return {state:{...state,caught:true,speed:'Walk' as const,medicine:false},message:'Caught: movement changed to Walk; medicine returned. Keys retained.',accepted:true};
}
export function applyReview(state: ReviewState, choice: ReviewChoice): {state: ReviewState; message: string; accepted: boolean} {
 const next = {...state};
 const reject = (message: string) => ({state, message, accepted:false});
 if(choice.type==='move') {
  if(!neighbors(state.guardDot).includes(choice.dot)) return reject(`Dot ${choice.dot} is not adjacent to ${state.guardDot} from here. Choose a lit space.`);
  next.previousDot=state.guardDot;next.guardDot=choice.dot;const a=nodeById.get(state.guardDot)!,b=nodeById.get(choice.dot)!;next.facing=Math.abs(b.x-a.x)>Math.abs(b.y-a.y)?(b.x>a.x?'East':'West'):(b.y>a.y?'South':'North');
  return {state:next,message:`Abbess moved from ${state.guardDot} to ${choice.dot}, facing ${next.facing.toLowerCase()}.`,accepted:true};
 }
 if(choice.type==='face'){next.facing=choice.facing;return{state:next,accepted:true,message:`Abbess now faces ${choice.facing.toLowerCase()}.`};}
 if(choice.type==='speed'){
  if(state.caught && choice.speed!=='Walk')return reject('You’ve been caught. Choose Walk to return to your cell.');
  next.speed=choice.speed;
 }else if(choice.type==='status') {if(!state.caught)return applyCapture(state);next.caught=false;}
 else if(choice.type==='collect'){
  if(choice.item==='medicine'&&!state.key)return reject('You need the key before you can collect the medicine.');
  next[choice.item]=!state[choice.item];
 }else next.reversed={...state.reversed,[choice.card]:!state.reversed[choice.card]};
 return {state:next,accepted:true,message:choice.type==='speed'?`${choice.speed} selected. Your movement stays private.`:choice.type==='status'?(next.caught?'Caught: movement changed to Walk; medicine returned. Keys retained.':'On the run again.'):choice.type==='reverse'?(next.reversed[choice.card]?'Card back shown.':'Card face shown.'):`${choice.item==='key'?'Key':'Medicine'} ${next[choice.item]?'collected':'returned'}.`};
}
