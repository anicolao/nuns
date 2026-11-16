<script lang="ts">
 import {base} from '$app/paths';
 import {onMount} from 'svelte';import {replaceState} from '$app/navigation';
 import {scenarios,surfaces,findScenario} from '$lib/interaction-scenarios';
 let surface=$state('phone'),scenario=$state('movement'),edge=$state('south'),reduced=$state(false),zoom=$state(100),rate=$state(1);
 let loaded=$state(false);
 let time=$state(0),duration=$state(0),running=$state(false),reload=$state(0),frame=$state<HTMLIFrameElement>(),companionFrame=$state<HTMLIFrameElement>(),viewportRegion:HTMLDivElement;
 let decisions=$state<Record<string,{verdict:string;note:string;at:string}>>({}),note=$state(''),storageError=$state('');
 const viewport=$derived(surfaces.find(s=>s.id===surface)??surfaces[0]);
 const selected=$derived(findScenario(scenario));
 const key=$derived(`${surface}/${scenario}/${surface==='tabletop'?edge:'south'}/${reduced?'reduced':'normal'}`);
 const decision=$derived(decisions[key]);
 $effect(()=>{if(!loaded)return;const url=new URL(location.href);url.searchParams.set('surface',surface);url.searchParams.set('scenario',scenario);url.searchParams.set('edge',edge);url.searchParams.set('reduced',reduced?'1':'0');replaceState(url,{});});
 const activeFrame=$derived(surface==='tabletop'&&selected.private?companionFrame:frame);
 const angle=$derived(surface==='tabletop'?({south:0,west:90,north:180,east:270})[edge as 'south'|'west'|'north'|'east']:0);
 const sideways=$derived(angle===90||angle===270);
 const viewWidth=$derived(sideways?viewport.height:viewport.width);
 const viewHeight=$derived(sideways?viewport.width:viewport.height);
 const query=$derived(`scenario=${scenario}&review=1&public=${surface==='tabletop'?1:0}&reduced=${reduced?1:0}&reset=${reload}`);
 function command(action:string,value?:number){activeFrame?.contentWindow?.postMessage({type:'nuns:transport',action,value},location.origin);}
 function fit(){if(!viewportRegion)return;zoom=Math.max(25,Math.min(100,Math.floor(Math.min((viewportRegion.clientWidth-40)/viewWidth,(viewportRegion.clientHeight-40)/viewHeight)*100)));}
 function changed(){time=0;duration=0;running=false;rate=1;note='';}
 function record(verdict:string){decisions={...decisions,[key]:{verdict,note,at:new Date().toISOString()}};try{localStorage.setItem('nuns-animation-reviews-v1',JSON.stringify(decisions));storageError='';}catch{storageError='Review could not be saved in this browser.';}}
 function exportReviews(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({version:1,scope:'Local visual review; physical table acceptance separate',reviews:decisions},null,2)],{type:'application/json'}));a.download='nuns-animation-reviews.json';a.click();URL.revokeObjectURL(a.href);}
 onMount(()=>{
  const p=new URLSearchParams(location.search);if(surfaces.some(s=>s.id===p.get('surface')))surface=p.get('surface')!;if(scenarios.some(s=>s.id===p.get('scenario')))scenario=p.get('scenario')!;if(['south','west','north','east'].includes(p.get('edge')??''))edge=p.get('edge')!;reduced=p.get('reduced')==='1';loaded=true;
  try{decisions=JSON.parse(localStorage.getItem('nuns-animation-reviews-v1')??'{}');}catch{storageError='Saved reviews could not be read.';}
  const receive=(event:MessageEvent)=>{if(event.origin!==location.origin||event.source!==activeFrame?.contentWindow||event.data?.type!=='nuns:motion')return;time=event.data.time;duration=event.data.duration;running=event.data.running;};
  window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 });
</script>
<svelte:head><title>Nuns on the Run · Animation lab</title></svelte:head>
<div class="animation-lab">
 <header><div><a href={base + '/gallery/'}>Nuns <i>on the</i> Run</a><h1>Animation lab</h1></div><a href={base + '/gallery/'}>Component gallery ↗</a></header>
 <div class="lab-layout">
 <aside aria-label="Animation lab controls">
 <label>Scenario<select bind:value={scenario} onchange={changed}>{#each scenarios as item}<option value={item.id}>{item.name}</option>{/each}</select></label>
 <p class="scenario-hint">{selected.hint}</p>
 <label>Form factor<select bind:value={surface} onchange={changed}>{#each surfaces as item}<option value={item.id}>{item.name} · {item.width} × {item.height}</option>{/each}</select></label>
 {#if surface==='tabletop'}<label>Reviewer position<select bind:value={edge} onchange={()=>note=''}>{#each ['south','west','north','east'] as seat}<option>{seat}</option>{/each}</select></label>{/if}
 <label class="check"><input type="checkbox" bind:checked={reduced} onchange={changed}/>Reduced motion</label>
 <label>Review zoom <output>{zoom}%</output><input type="range" min="25" max="125" step="5" bind:value={zoom}/></label>
 <p class="muted">Viewport dimensions are real CSS pixels inside the play page. Zoom only changes how the lab displays it. Use 100% for legibility and touch review.</p>
 <div class="control-row"><button onclick={()=>{command('reset');changed();}}>Reset scene</button><button onclick={()=>command('undo')}>Undo action</button></div>
 {#if scenario==='caught'}<button onclick={()=>command('capture')}>Simulate capture</button><p class="muted">Reviewer control: delivers a resolved capture to the shared status display. Capture is not a player choice. Reset scene to restore the starting state.</p>{/if}
 <h2>Playback</h2>
 <div class="control-row"><button disabled={!duration} onclick={()=>command('replay')}>Replay</button><button disabled={!duration} onclick={()=>command(running?'pause':'resume')}>{running?'Pause':'Play'}</button></div>
 <label>Timeline <output>{Math.round(time)} / {duration} ms</output><input aria-label="Animation timeline" type="range" min="0" max={duration||1} step="1" value={time} disabled={!duration} oninput={e=>command('seek',Number(e.currentTarget.value))}/></label>
 <label>Playback speed<select bind:value={rate} onchange={()=>command('speed',Number(rate))}><option value={.25}>¼×</option><option value={.5}>½×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
 <p class="muted">{scenario==='caught'?'Use Simulate capture first.':'Perform an action on the piece first.'} Replay and scrubbing operate on its retained production animation. Reset restores the complete scenario state. OS reduced-motion preferences also apply.</p>
 <h2>Review this combination</h2>
 <p>{decision?`${decision.verdict} · ${new Date(decision.at).toLocaleDateString()}`:'Not reviewed'}</p>
 {#if decision?.note}<p class="muted">{decision.note}</p>{/if}
 <label>Review note<textarea bind:value={note} rows="3" placeholder="Containment, motion, touch, orientation…"></textarea></label>
 <div class="control-row"><button onclick={()=>record('Approved')}>Approve</button><button onclick={()=>record('Needs work')}>Needs work</button></div>
 <button onclick={exportReviews}>Export reviews ({Object.keys(decisions).length})</button>
 <p class="muted">Saved locally per scenario, viewport, table edge and motion preference. These are your review decisions, never automatic approvals.</p>{#if storageError}<p role="alert">{storageError}</p>{/if}
 </aside>
 <main>
 <div class="stage-caption"><strong>{viewport.name} · {viewport.width} × {viewport.height}</strong><div class="stage-tools"><button onclick={fit}>Fit viewport</button><button onclick={()=>zoom=50}>50%</button><button onclick={()=>zoom=100}>100%</button><a href={`${base}/play/?${query.replace('&review=1','')}`} target="_blank">Open play surface ↗</a></div></div>
 <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard scrolling is needed for large actual-size viewports.) -->
 <div bind:this={viewportRegion} class="viewport-scroll" aria-label="Scrollable device review area" tabindex="0" role="region"><div class="viewport-space" style:width={viewWidth*zoom/100+'px'} style:height={viewHeight*zoom/100+'px'}><iframe bind:this={frame} title={`${viewport.name} production play surface`} src={`${base}/play/?${query}`} width={viewport.width} height={viewport.height} style:position="absolute" style:left="50%" style:top="50%" style:transform-origin="center" style:transform={`translate(-50%,-50%) rotate(${angle}deg) scale(${zoom/100})`} onload={()=>command('speed',Number(rate))}></iframe></div></div>
 {#if surface==='tabletop'&&selected.private}<section class="companion"><h2>Private phone companion</h2><p>The public table conceals this scenario. Interact on the real private surface below. Each surface has independent seeded state; networking is not implemented.</p><iframe bind:this={companionFrame} title="Private phone production play surface" src={`${base}/play/?scenario=${scenario}&review=1&reduced=${reduced?1:0}` } width="390" height="844"></iframe></section>{/if}
 <section class="lab-contract"><h2>What this lab approves</h2><p>Every piece, click handler and animation comes from the shared Svelte play surface. The frame loads <a href={base + '/play/'}>/play/</a>; it contains no lab rendering branches. Scenarios seed the current presentation adapter, not a complete game or multiplayer session.</p><p>Review direct choice, scrolling, card turns, selection, rejection, dependent state, Undo and inspect/return. Check every form factor and table edge. A scaled 1920 × 1080 preview cannot establish physical 55-inch reach, viewing distance or multi-touch behavior; review the full-size surface on the target table too.</p></section>
 </main>
 </div>
</div>
<style>
 :global(html:has(.animation-lab)),:global(body:has(.animation-lab)){height:auto;overflow:auto}
 .animation-lab{min-height:100vh;background:#0d202b;color:#e9dbb9;font:15px/1.5 Arial,sans-serif}.animation-lab>header{padding:22px 28px;border-bottom:1px solid #819c9550;display:flex;justify-content:space-between;align-items:center;gap:20px}.animation-lab>header>div{display:flex;align-items:baseline;gap:28px}.animation-lab>header a{font:26px Georgia}.animation-lab>header>a{font:14px Arial;color:#b6cdc5}h1{font:30px Georgia}h2{font:21px Georgia;margin:25px 0 12px}.lab-layout{display:grid;grid-template-columns:300px minmax(0,1fr)}aside{padding:24px;border-right:1px solid #819c9550}label{display:flex;flex-direction:column;gap:7px;margin-bottom:18px;color:#c6d3c9}select,textarea{width:100%;background:#142e3b;color:#efe0c0;border:1px solid #79988f88;padding:10px;font:14px Arial;min-height:44px}textarea{resize:vertical}input[type=range]{width:100%;min-height:30px;accent-color:#dec58f}output{color:#e4c98e;font-size:13px}.check{flex-direction:row;align-items:center}.check input{width:20px;height:20px}.scenario-hint{color:#d7caa9;margin:0 0 22px}.muted{font-size:13px;color:#9fb9b3;margin:12px 0 22px}.control-row{display:flex;gap:8px;margin:10px 0 18px}.control-row>*{flex:1}button{min-height:44px;border:1px solid #839b8c88;padding:10px 12px;background:#1d3c49;color:#eedbb5;cursor:pointer;font-size:14px}button:hover{background:#2d505a}button:disabled{opacity:.35;cursor:default}main{min-width:0;padding:20px}.stage-caption{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:16px;color:#c2d1c6}.stage-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.stage-caption a{color:#e3c88f}.viewport-scroll{overflow:auto;max-height:calc(100vh - 185px);min-height:400px;background:#07151d;border:1px solid #718c7e55;padding:20px;overscroll-behavior:contain}.viewport-space{position:relative;margin:0 auto;flex:none}iframe{display:block;border:0;background:#122b38;transform-origin:top left;max-width:none;box-shadow:0 10px 35px #0008}.lab-contract{max-width:900px;color:#a9beb4}.lab-contract p{margin:12px 0}.lab-contract a{text-decoration:underline}.companion{padding:20px 0}.companion p{max-width:650px;margin:12px 0}.companion iframe{border:1px solid #8ca28f66}@media(max-width:850px){.lab-layout{grid-template-columns:1fr}aside{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 20px;border-right:0;border-bottom:1px solid #819c9550}.animation-lab>header>div{display:block}.animation-lab>header{padding:18px}main{padding:12px}.viewport-scroll{max-height:900px}}@media(max-width:480px){aside{display:block}.companion iframe{width:390px}.companion{overflow:auto}}
</style>
