<script lang="ts">
 import {base} from '$app/paths';
 import {present} from '$lib/motion/present';
 import {MotionPlayer} from '$lib/motion/player';
 import {initialReview,type ReviewChoice,type Speed} from '$lib/review';
 import {nodeById,neighbors,pathPoints,polyline} from '$lib/game/board';
 import {seedEncounter,seedPublicEncounter,publicEncounter,applyEncounter,routeOptions,canCommit,movement,type EncounterMode,type EncounterAction,type PublicEncounter} from '$lib/game/encounter';
 import Abbey from './Abbey.svelte';
 import ArtCard from './ArtCard.svelte';
 let {mode,publicView=false,motion=new MotionPlayer(),incoming,onprojection,tabletop=false}=$props<{mode:EncounterMode;publicView?:boolean;motion?:MotionPlayer;incoming?:PublicEncounter|null;onprojection?:(view:PublicEncounter)=>void;tabletop?:boolean}>();
 // The public display owns a public projection only, never a private route object.
 const seed=()=>publicView?null:seedEncounter(mode);
 let state=$state(seed());
 const owner=$derived(mode==='novice'||mode==='false-noise');
 const view:PublicEncounter=$derived(state?publicEncounter(state):incoming??seedPublicEncounter(mode));
 const fixture=$derived({...initialReview(),guardDot:view.guardDot,facing:view.facing});
 const options=$derived(state?(mode==='novice'?routeOptions(state):state.blessing==='targeting'?neighbors(view.guardDot):[]):[]);
 const privateDot=$derived(state&&owner?(mode==='novice'?state.route.at(-1)!:state.noviceDot):null);
 const novice=$derived(privateDot??view.novice);
 const focusDot=$derived(mode==='novice'&&!publicView?privateDot??4:mode==='false-noise'?23:view.guardDot);
 const cluePoints=$derived(view.clues.map(clue=>{const a=nodeById.get(clue.guard)!,b=nodeById.get(clue.toward)!;return {...clue,x:a.x+(b.x-a.x)*.48,y:a.y+(b.y-a.y)*.48,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};}));
 const message=$derived(state?.message??view.message);
 const guardActive=$derived(!publicView&&!owner&&!view.caught);
 function act(action:EncounterAction){if(!state)return;state=applyEncounter(state,action).state;}
 function guardChoice(choice:ReviewChoice){if(choice.type==='move')act({type:'move-guard',dot:choice.dot});if(choice.type==='face')act(choice);}
 $effect(()=>{if(state)onprojection?.(publicEncounter(state));});
 export function undoPlanning(){act({type:'undo-step'});}
 export function nextHearing(){act({type:'next-hearing'});}
</script>
<div class="encounter" class:owner-view={owner&&!publicView} data-encounter={mode} use:present={{signature:JSON.stringify(state??view),player:motion}}>
 <div class="encounter-map">
 <Abbey state={fixture} tabletop={tabletop||publicView} interaction={guardActive?'guard':'view'} onchoice={guardChoice} {focusDot} showFacing={!owner} heading={publicView?'The abbey':owner?'Celeste · private map':`Abbess · ${view.guardDot}`} hint={publicView||view.caught?view.message:mode==='novice'?(state?.committed?'Movement committed.':'Tap lit spaces to plan your route.'):mode==='false-noise'?(state?.blessing==='targeting'?'Tap a lit direction beside the Abbess.':state?.blessing==='ready'?'Tap your blessing to choose a direction.':state?.blessing==='revealed'?'Blessing revealed and discarded.':'Noise placed beside the Abbess.'):undefined}>
 {#snippet boardOverlay()}
 <svg class="encounter-overlay" viewBox="0 0 1000 1038" aria-label="Encounter clues">
 {#if state&&mode==='novice'}<polyline class="private-route" points={polyline(pathPoints(state.route))}/>{/if}
 {#if view.novice!==null&&!owner}{@const a=nodeById.get(view.guardDot)!}{@const b=nodeById.get(view.novice)!}<line class="sight-line" x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>{/if}
 </svg>
 {#each cluePoints as clue,i}<div class="noise-clue" style:left={clue.x/10+'%'} style:top={clue.y/10.38+'%'} data-motion-enter="true" data-motion-id={'noise:'+i} data-motion-state={clue.guard+':'+clue.toward} aria-label={`Noise beside ${clue.guard} toward ${clue.toward}`}><img src={base+'/art/moonlit/noise.webp'} alt="Noise"/><span style:transform={`rotate(${clue.angle}deg)`}>➜</span></div>{/each}
 {#if novice!==null}{@const point=nodeById.get(novice)!}<div class="novice-pawn" class:caught={view.caught} style:left={point.x/10+'%'} style:top={point.y/10.38+'%'} data-motion-enter="true" data-motion-id="novice" data-motion-kind="travel" data-motion-state={novice} aria-label={privateDot!==null?`Celeste · private position ${novice}`:`Celeste spotted at ${novice}`}><img src={base+'/art/moonlit/character-3.webp'} alt="Celeste"/><span>{view.caught?'Caught':privateDot!==null?'You':'Celeste'}</span></div>{/if}
 {/snippet}
 {#snippet boardControls(camera)}
 {#if !publicView&&state}<div class="target-layer">{#each options as id}{@const point=nodeById.get(id)!}<button class:selected={state.target===id} style:left={camera.x+point.x*camera.scale+'px'} style:top={camera.y+point.y*camera.scale+'px'} aria-label={mode==='novice'?`Plan step to ${id}`:`Aim noise toward ${id}`} data-map-target={id} onclick={()=>act(mode==='novice'?{type:'step',dot:id}:{type:'target',dot:id})}>{id}</button>{/each}</div>{/if}
 {/snippet}
 </Abbey>
 </div>
 <section class="encounter-panel" aria-label={publicView?'Public encounter information':owner?'Your controls':'Guard controls'}>
 <div class="encounter-summary" data-motion-id="encounter-result" data-motion-state={view.captures+':'+view.clues.length+':'+view.novice+':'+view.blessingRevealed+':'+view.speed+':'+(state?.committed??'')}><strong>{publicView?'Night 6':mode==='novice'?'Celeste · plan movement':mode==='hearing'?'Listen for footsteps':mode==='sight'?'Watch the corridor':mode==='capture'?'Catch Celeste':'False Noise · blessing'}</strong><p role="status">{message}</p></div>
 {#if !publicView&&state&&mode==='novice'}
 <div class="speed-choices" aria-label="Movement speed">{#each ['Still','Sneak','Walk','Run'] as speed}<button disabled={state.committed} aria-pressed={state.speed===speed} onclick={()=>act({type:'speed',speed:speed as Speed})}>{speed}<small>{movement[speed as Speed].min}–{movement[speed as Speed].max} steps</small></button>{/each}</div>
 <p class="route-log" aria-label="Private route">{state.route.join(' → ')} · {state.route.length-1}/{movement[state.speed].max} steps</p>
 <div class="action-row"><button disabled={state.committed||state.route.length===1} onclick={()=>act({type:'undo-step'})}>Undo step</button><button disabled={!canCommit(state)} onclick={()=>act({type:'commit'})}>Commit movement</button></div>
 {:else if !publicView&&state&&mode==='hearing'}
 <button disabled={state.listened} onclick={()=>act({type:'listen',roll:6})}>{state.listened?'Heard · roll 6':'Listen · roll die'}</button>
 {:else if !publicView&&state&&mode==='false-noise'}
 {#if state.blessing==='ready'}<button class="blessing-hand" onclick={()=>act({type:'blessing'})}><div class="blessing-thumbnail" aria-hidden="true"><ArtCard face="blessing" title="False Noise"><p>Place a noise beside a guard.</p></ArtCard></div><span><b>False Noise</b><small>Choose a direction beside a guard</small></span></button>
 {:else if state.blessing==='targeting'}<div class="action-row"><button onclick={()=>act({type:'cancel-blessing'})}>Cancel</button><button disabled={state.target===null} onclick={()=>act({type:'place-noise'})}>Place noise</button></div>
 {:else}<p class="blessing-status">{state.blessing==='placed'?'Used · keep card hidden until next hearing phase.':'Revealed · discarded.'}</p>{/if}
 {:else if view.caught}<p class="capture-result">Captures: <b>{view.captures}</b> · Movement: <b>Walk</b> · Keys retained · Wish item returned</p>
 {:else if publicView&&view.speed}<p>Celeste revealed <b>{view.speed}</b>. Her route stays private.</p>{/if}
 {#if publicView&&view.blessingRevealed}<p>False Noise · revealed and discarded</p>{/if}
 </section>
</div>
<style>
 .encounter{width:100%;height:100%;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto;background:#0c202b;color:#f4e4c2}.encounter-map{min-height:0;position:relative}.encounter-panel{padding:12px 18px;border-top:1px solid #d6c28e66;display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:#142d39}.encounter-summary{flex:1;min-width:200px}.encounter-summary strong{font:21px Georgia}.encounter-panel p{font:14px/1.4 Arial;margin:6px 0 0}.encounter-panel button{min-height:44px;padding:8px 12px;border:1px solid #d8c28f99;border-radius:9px;background:#243f4d;color:#f8e6bf;cursor:pointer;font:14px Arial}.encounter-panel button:disabled{opacity:.45;cursor:default}.speed-choices,.action-row{display:flex;gap:6px}.speed-choices button[aria-pressed=true]{background:#ecd49e;color:#152c38}.speed-choices small{display:block;font-size:11px;margin-top:4px}.route-log{width:100%;order:2}.action-row{margin-left:auto}.encounter-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5}.private-route{fill:none;stroke:#67f2de;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 2px 2px #071921)}.sight-line{stroke:#ffdf83;stroke-width:5;stroke-dasharray:8 5}.novice-pawn{position:absolute;width:38px;height:55px;transform:translate(-50%,-70%);z-index:7;pointer-events:none;filter:drop-shadow(0 2px 3px #07141b)}.novice-pawn img{width:100%;height:44px;object-fit:contain}.novice-pawn span{position:absolute;top:44px;left:50%;transform:translateX(-50%);background:#173f4c;border:1px solid #6be1cd;border-radius:5px;white-space:nowrap;padding:1px 5px;color:#fff0c7;font:bold 12px Arial}.novice-pawn.caught{margin-left:20px}.novice-pawn.caught span{border-color:#ffaf83;background:#593b35}.noise-clue{position:absolute;width:34px;height:34px;transform:translate(-50%,-50%);z-index:7;pointer-events:none}.noise-clue img{width:100%;height:100%;object-fit:contain}.noise-clue span{position:absolute;right:-14px;top:8px;color:#ffe18b;font:bold 24px Arial;text-shadow:1px 2px #09202b}.target-layer{position:absolute;inset:0;pointer-events:none;z-index:9}.target-layer button{position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;min-height:44px;padding:0;border-radius:50%;border:2px solid #8af5de;background:#153e48dc;color:#fff3c7;box-shadow:0 0 0 3px #10232c99;font:bold 16px Arial;pointer-events:auto}.target-layer button.selected{background:#f3dc9f;border-color:#fff4ce;color:#152c37}.blessing-hand{display:flex;align-items:center;gap:12px;text-align:left}.blessing-thumbnail{width:40px;height:60px;position:relative;flex:none;overflow:hidden}.blessing-thumbnail :global(.painted-card){position:absolute;top:0;left:0;width:320px;min-width:320px;transform:scale(.125);transform-origin:top left}.blessing-hand small{display:block;margin-top:4px}.blessing-status{max-width:270px}
 @media(max-width:600px){.encounter-panel{padding:10px 12px;gap:8px}.encounter-summary{min-width:100%;flex:1}.encounter-summary strong{font-size:19px}.speed-choices{flex:1}.speed-choices button{flex:1;padding:6px 8px}.action-row{width:100%;order:3}.action-row button{flex:1}.encounter-panel p{font-size:13px}}
 @media(max-height:500px){.encounter{grid-template-columns:minmax(0,1fr) 260px;grid-template-rows:minmax(0,1fr)}.encounter-panel{border-top:0;border-left:1px solid #d6c28e66;display:flex;flex-direction:column;justify-content:center;align-items:stretch;gap:10px;padding:12px}.encounter-summary{flex:none;min-width:0}.encounter-summary strong{font-size:18px}.encounter-panel p{font-size:13px}.speed-choices{display:grid;grid-template-columns:1fr 1fr}.route-log{order:0}.action-row{margin:0;order:0}.action-row button{flex:1;padding:6px}.encounter-panel .blessing-hand{padding:8px}}
</style>
