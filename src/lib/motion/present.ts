import { tick } from 'svelte';
import { MotionPlayer } from './player';
type Options = { signature: string; player: MotionPlayer };
type Snapshot = { rect: DOMRect; state: string; transform: string };
/** Animate live production nodes after a committed state change; never clone artwork. */
export function present(root: HTMLElement, options: Options) {
 let previous = new Map<string, Snapshot>();
 let serial = 0;
 const elements = () => Array.from(root.querySelectorAll<HTMLElement>('[data-motion-id]'));
 const capture = () => new Map(elements().map(node => [node.dataset.motionId!, {rect:node.getBoundingClientRect(), state:node.dataset.motionState ?? '', transform:node.style.transform}]));
 const recapture=()=>{previous=capture();};
 root.addEventListener('motion:land',recapture);
 void tick().then(() => { previous = capture(); });
 return {
  update(next: Options) {
   options = next; const version = ++serial;
   // Remove retained playback transforms before measuring the next committed layout.
   options.player.clear();
   void tick().then(() => {
    if (version !== serial) return;
    const animations: Animation[] = [];
    const current = capture();
    const reduced = options.player.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) for (const node of elements()) {
     const before = previous.get(node.dataset.motionId!); const after = current.get(node.dataset.motionId!)!;
     if (!before || before.state === after.state) continue;
     const kind = node.dataset.motionKind;
     let frames: Keyframe[];
     if (kind === 'flip') frames = [{transform:before.transform}, {transform:after.transform}];
     else if (kind === 'travel') {const scale=Number(node.closest<HTMLElement>('[data-board-scale]')?.dataset.boardScale??1);frames = [{translate:`${(before.rect.x-after.rect.x)/scale}px ${(before.rect.y-after.rect.y)/scale}px`}, {translate:'0px 0px'}];}
     else frames = [{translate:'0px 0px',scale:1}, {translate:'0px -10px',scale:1.035,offset:.4}, {translate:'0px 0px',scale:1}];
     animations.push(node.animate(frames, {duration:640,easing:'cubic-bezier(.22,.7,.25,1)',fill:'both'}));
    }
    previous = current; options.player.play(animations, animations.length ? 640 : 0);
   });
  },
  destroy() { root.removeEventListener('motion:land',recapture);serial++; options.player.clear(); }
 };
}
