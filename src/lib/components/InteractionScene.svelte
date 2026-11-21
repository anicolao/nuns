<script lang="ts">
 import {onMount} from 'svelte';
 import Component from './Component.svelte';
 import EncounterBoard from './EncounterBoard.svelte';
 import type {FixtureMode as EncounterMode} from '$lib/lab/fixtures';
 import type {PublicGame as PublicEncounter} from '$lib/game/projection';
 import {initialReview,applyReview,applyCapture,type ReviewState,type ReviewChoice} from '$lib/review';
 import {findScenario} from '$lib/interaction-scenarios';

 import {MotionPlayer} from '$lib/motion/player';
 let {scenario='movement',publicView=false,reduced=false,review=false}=$props<{scenario?:string;publicView?:boolean;reduced?:boolean;review?:boolean}>();
 const encounterMode=$derived(['novice','hearing','sight','capture','false-noise'].includes(scenario)?scenario as EncounterMode:null);
 let encounter=$state<EncounterBoard>(),incoming=$state<PublicEncounter|null>(null);
 function project(view:PublicEncounter){if(review&&!publicView)parent.postMessage({type:'nuns:projection',view},location.origin);}
 const scene=$derived(findScenario(scenario));
 const hidden=$derived(publicView&&scene.private);
 const kind=$derived(hidden?'board':scene.kind);
 const boardScene=$derived(kind==='board');
 const titles:Record<string,string>={movement:'Your movement',wish:'Your secret wish',blessing:'Blessing',patrol:'Abbess’s patrol',collection:'Your wish items',caught:'Novice status',guard:'The abbey',die:'Noise die'};
 const motion=new MotionPlayer();
 const seeded=()=>{const fixture=initialReview();if(scenario==='caught'){fixture.key=true;fixture.medicine=true;}return fixture;};
 let fixture=$state(seeded()),history=$state<ReviewState[]>([]),message=$state('Choose an action.'),rejected=$state(false),selection=$state(26),revision=$state(0);
 let dialog:HTMLDialogElement;let inspecting=$state(false);
 function choose(choice:ReviewChoice){
  const result=applyReview(fixture,choice);message=result.message;rejected=!result.accepted;
  if(result.accepted){history=[...history,structuredClone($state.snapshot(fixture))];fixture=result.state;}
 }
 function capture(){if(scenario!=='caught'||hidden||fixture.caught)return;const result=applyCapture(fixture);fixture=result.state;message=result.message;rejected=false;}
 function undo(){if(!history.length)return;fixture=history[history.length-1];history=history.slice(0,-1);message='Previous state restored.';rejected=false;}
 function reset(){motion.clear();motion.speed(1);history=[];fixture=seeded();selection=26;message='Scene reset.';rejected=false;incoming=null;revision++;}
 $effect(()=>{motion.reduced=reduced;});
 onMount(()=>{
  const report=()=>{if(review)parent.postMessage({type:'nuns:motion',time:motion.time,duration:motion.duration,running:motion.running,scenario},location.origin);};
  motion.onupdate=report;report();
  const receive=(event:MessageEvent)=>{
   if(!review||event.source!==parent||event.origin!==location.origin)return;
   if(event.data?.type==='nuns:projection'&&publicView&&encounterMode){incoming=event.data.view;return;}
   if(event.data?.type!=='nuns:transport')return;
   const {action,value}=event.data;
   if(action==='next-hearing')encounter?.nextHearing();else if(action==='capture')capture();else if(action==='replay')motion.replay();else if(action==='pause')motion.pause();else if(action==='resume')motion.resume();else if(action==='seek')motion.seek(Number(value)||0);else if(action==='speed')motion.speed(Number(value)||1);else if(action==='reset')reset();else if(action==='undo'){if(encounterMode==='novice')encounter?.undoPlanning();else if(!encounterMode)undo();}
  };
  window.addEventListener('message',receive);
  return()=>{window.removeEventListener('message',receive);motion.onupdate=undefined;motion.clear();};
 });
 function inspect(){inspecting=true;dialog.showModal();}
</script>
<div class="interaction-scene" class:public-table={publicView} class:board-scene={boardScene} data-scenario={scenario}>
 {#if !boardScene}<header class="play-header"><span class="play-title">{titles[scenario]??'The abbey'}</span><span>{publicView?'Night 6':'Celeste'}</span></header>{/if}
 <main class="play-content">
 {#key revision}<section class="play-pieces" class:board-pieces={boardScene} aria-label={boardScene?'Abbey board':titles[scenario]}>{#if encounterMode}<EncounterBoard bind:this={encounter} mode={encounterMode} publicView={publicView&&scene.private} tabletop={publicView} {motion} {incoming} onprojection={project}/>{:else}<Component {kind} state={fixture} {motion} tabletop={publicView} onchoice={choose} inspectDot={selection} oninspect={dot=>selection=dot} onundo={undo} canUndo={!!history.length}/>{/if}
 {#if !boardScene&&['wish','blessing','patrol'].includes(scenario)}<button class="enlarge-piece" onclick={inspect} aria-label="Enlarge card">⤢</button>{/if}
 </section>{/key}
 {#if scenario==='caught'&&!hidden}<p class="dependent-fixture">Movement: <b>{fixture.speed}</b> · Key: <b>{fixture.key?'kept':'none'}</b> · Medicine: <b>{fixture.medicine?'held':'returned'}</b></p>{/if}
 </main>
 {#if !boardScene}<footer class="play-footer"><p class:rejected role="status">{message==='Choose an action.'?(['wish','blessing','patrol'].includes(scenario)?'Tap the card to turn it over.':scenario==='movement'?'Choose how you move.':''):message}</p>{#if scenario!=='caught'}<button disabled={!history.length} onclick={undo}>↶ Undo</button>{/if}</footer>{:else}<span class="sr-only" role="status">{message}</span>{/if}
</div>
<dialog bind:this={dialog} onclose={()=>inspecting=false} class="component-inspector"><header><h2>{scene.name}</h2><button onclick={()=>dialog.close()}>Return to play ✕</button></header>{#if inspecting}<div class="inspector-stage"><Component kind={scene.kind} state={fixture} onchoice={choose} inspectDot={selection} oninspect={dot=>selection=dot}/></div>{/if}</dialog>
<style>
 :global(html:has(.interaction-scene)),:global(body:has(.interaction-scene)){height:100%;overflow:hidden}
 .interaction-scene{height:100dvh;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(ellipse at top,#233f4c,#0b1d28);color:#e9d9b6}.play-header{flex:none;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid #829c9650;height:56px}.play-title{font:25px Georgia}.play-header>span:last-child{font-size:14px;color:#a7c1bd}.play-content{flex:1;min-height:0;min-width:0;padding:12px 20px;display:flex;flex-direction:column;overflow:hidden}.play-pieces{flex:1;min-height:0;min-width:0;position:relative;display:flex;align-items:center;justify-content:center;container-type:inline-size}.play-pieces>:global(.shared-component){height:100%;width:100%;display:flex;align-items:center;justify-content:center}.board-scene .play-content{padding:0}.board-pieces{padding:0;display:block}.play-footer{flex:none;min-height:56px;padding:8px 20px;display:flex;gap:12px;align-items:center;justify-content:space-between;border-top:1px solid #79988c44}.play-footer p{font-size:15px;line-height:1.35;margin:0;color:#b8d0ca}.play-footer .rejected{color:#ffbf97}.play-footer button{min-height:44px;flex:none;border:1px solid #9eac8c66;border-radius:10px;background:#183644;padding:8px 14px;color:#ead7af}.play-footer button:disabled{opacity:.35}.enlarge-piece{position:absolute;right:0;bottom:0;width:44px;height:44px;border:1px solid #d4c39980;background:#142e3be8;border-radius:12px;color:#ffe8b2;font-size:26px}.dependent-fixture{font-size:16px;line-height:1.5;text-align:center;padding:6px 0;margin:0}.public-table .play-footer{position:absolute;bottom:14px;right:14px;max-width:450px;background:#102935e8;border:1px solid #d5c69566;border-radius:12px}.public-table .play-pieces{padding-bottom:60px}.public-table .board-pieces{padding:0}
 @media(max-width:600px){.play-header{height:48px;padding:8px 14px}.play-title{font-size:22px}.play-content{padding:6px 14px}.play-footer{padding:6px 14px;min-height:54px}.play-footer p{font-size:14px}}
 @media(max-height:500px){.play-header{height:40px;padding:4px 14px}.play-title{font-size:21px}.play-content{padding:2px 14px}.play-footer{min-height:40px;padding:2px 14px}.play-footer button{height:36px;min-height:36px}.play-pieces :global(.card-turn .painted-card){width:auto;min-width:0;height:min(72dvh,340px)}.enlarge-piece{bottom:2px;right:2px}}
</style>
