<script lang="ts">
 import {base} from '$app/paths';
 import type {Snippet} from 'svelte';
 import {onMount,tick,untrack} from 'svelte';
 import AbbessPawn from './AbbessPawn.svelte';
 import {fitCamera,focusCamera,clampCamera,zoomCamera,worldPoint,type Camera} from '$lib/game/board-camera';
 import type {Style} from '$lib/catalog';import type {ReviewState,ReviewChoice} from '$lib/review';
 import{board,nodes,nodeById,connections,patrols,colors,endpoints,edgeId,edgeColors,polyline,offsetPoints,pathPoints,doors,neighbors,roomAt,distance,shortestPath,isVisible,isHeard,soundDirections,type Facing}from '$lib/game/board';
 let {style='moonlit',state:fixture,onchoice,inspectDot=26,oninspect,audit=false,tabletop=false,onundo,canUndo=false,interaction='guard',focusDot,boardOverlay,boardControls,heading,hint,showFacing=true,showGuard=true,legalDots,pawnName='Abbess',pawnIndex=6,canTurn=true,motionId='abbess',busy=false,sightGuards=[]}=$props<{style?:Style;state:ReviewState;onchoice?:(choice:ReviewChoice)=>void;inspectDot?:number;oninspect?:(dot:number)=>void;audit?:boolean;tabletop?:boolean;onundo?:()=>void;canUndo?:boolean;interaction?:'guard'|'view';focusDot?:number;boardOverlay?:Snippet;boardControls?:Snippet<[Camera]>;heading?:string;hint?:string;showFacing?:boolean;showGuard?:boolean;legalDots?:number[];pawnName?:string;pawnIndex?:number;canTurn?:boolean;motionId?:string;busy?:boolean;sightGuards?:{id:string;dot:number;facing:Facing}[]}>();
 let zoom=$state(1300),showSight=$state(false),showSound=$state(false),showWalls=$state(false),showLabels=$state(true),route=$state(-1),roll=$state(6),modifier=$state(0),walking=$state(true);
 let map=$state<HTMLDivElement>();
 let viewport=$state<HTMLDivElement>(),width=$state(1),height=$state(1),camera=$state<Camera>({x:0,y:0,scale:1}),overview=$state(false),turning=$state(false),dragPoint=$state<{x:number;y:number}|null>(null),notice=$state('');
 let active:{id:number;kind:'pawn'|'pan';x:number;y:number;camera:Camera;moved:boolean}|undefined;
 const legal:number[]=$derived(legalDots??neighbors(fixture.guardDot));
 const guard=$derived(nodeById.get(fixture.guardDot)!);
 const directionSymbol=$derived(fixture.facing==='North'?'↑':fixture.facing==='East'?'→':fixture.facing==='South'?'↓':'←');
 const pawnScreen=$derived({x:camera.x+guard.x*camera.scale,y:camera.y+guard.y*camera.scale});
 function measure(){if(!viewport)return;width=viewport.clientWidth;height=viewport.clientHeight;camera=tabletop||overview||(width>=700&&height>=600)?fitCamera(width,height):focusCamera(width,height,nodeById.get(focusDot??fixture.guardDot)!);}
 onMount(()=>{if(!viewport)return;const observer=new ResizeObserver(measure);observer.observe(viewport);measure();return()=>observer.disconnect();});
 function settleMeasurements(){viewport?.dispatchEvent(new CustomEvent('motion:land',{bubbles:true}));}
 $effect(()=>{const id=focusDot??fixture.guardDot;untrack(()=>{if(!viewport||audit||tabletop||overview)return;const p=nodeById.get(id)!;const x=camera.x+p.x*camera.scale,y=camera.y+p.y*camera.scale;if(x<54||x>width-54||y<100||y>height-60){camera=focusCamera(width,height,p);void tick().then(settleMeasurements);}});});
 function focus(){overview=false;camera=focusCamera(width,height,nodeById.get(focusDot??fixture.guardDot)!);turning=false;void tick().then(settleMeasurements);}
 function showAbbey(){overview=true;camera=fitCamera(width,height);turning=false;void tick().then(settleMeasurements);}
 function magnify(factor:number){overview=false;camera=zoomCamera(camera,width,height,camera.scale*factor);void tick().then(settleMeasurements);}
 function move(dot:number){turning=false;notice='';settleMeasurements();onchoice?.({type:'move',dot});}
 function pointerDown(event:PointerEvent,kind:'pawn'|'pan'){
  if(busy||audit||event.button!==0||(tabletop&&kind==='pan'))return;
  event.stopPropagation();active={id:event.pointerId,kind,x:event.clientX,y:event.clientY,camera:{...camera},moved:false};viewport?.setPointerCapture(event.pointerId);notice='';
 }
 function pointerMove(event:PointerEvent){
  if(!active||active.id!==event.pointerId||!viewport)return;
  const dx=event.clientX-active.x,dy=event.clientY-active.y;if(Math.hypot(dx,dy)>6)active.moved=true;
  if(!active.moved)return;
  if(active.kind==='pan')camera=clampCamera({...active.camera,x:active.camera.x+dx,y:active.camera.y+dy},width,height);
  else {const rect=viewport.getBoundingClientRect();dragPoint=worldPoint(camera,{x:event.clientX-rect.left,y:event.clientY-rect.top});turning=false;}
 }
 function pointerUp(event:PointerEvent){
  if(!active||event.pointerId!==active.id)return;const gesture=active;active=undefined;
  if(viewport?.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
  if(gesture.kind==='pawn'&&gesture.moved&&dragPoint){
   const drop=dragPoint;const target=legal.map(id=>nodeById.get(id)!).sort((a,b)=>Math.hypot(a.x-drop.x,a.y-drop.y)-Math.hypot(b.x-drop.x,b.y-drop.y))[0];
   settleMeasurements();dragPoint=null;
   if(target&&Math.hypot(target.x-drop.x,target.y-drop.y)*camera.scale<=36)move(target.id);
   else notice='Drop the Abbess on a lit space.';
  }else if(gesture.kind==='pawn'&&canTurn)turning=!turning;
  settleMeasurements();
 }
 function cancelDrag(){active=undefined;dragPoint=null;settleMeasurements();}
 function wheel(event:WheelEvent){if(tabletop||audit)return;event.preventDefault();const rect=viewport!.getBoundingClientRect();overview=false;camera=zoomCamera(camera,width,height,camera.scale*Math.exp(-event.deltaY*.002),{x:event.clientX-rect.left,y:event.clientY-rect.top});void tick().then(settleMeasurements);}

 const selected=$derived(nodeById.get(inspectDot)??nodeById.get(26)!);

 const path=$derived(shortestPath(fixture.guardDot,selected.id));
 const routeEdges=$derived(route<0?null:new Set(patrols[route].path.slice(1).map((n,i)=>edgeId(n,patrols[route].path[i]))));
 const seen=$derived(isVisible(fixture.guardDot,selected.id,fixture.facing as Facing));
 const heard=$derived(isHeard(fixture.guardDot,selected.id,roll,modifier,walking));
 const sightList=$derived(nodes.filter(n=>isVisible(fixture.guardDot,n.id,fixture.facing as Facing)).map(n=>n.id));
 function keyPosition(key:typeof board.keys[number]){const n=nodeById.get(key.node)!;return{x:n.x+(key.position==='left'?-29:key.position==='right'?29:0),y:n.y+(key.position==='top'?-28:key.position==='bottom'?28:0)};}
 function centerGuard(){const scale=zoom/1000;map?.scrollTo({left:guard.x*scale-map!.clientWidth/2,top:guard.y*scale-map!.clientHeight/2,behavior:'instant'});}
</script>
<div class="canonical-board-review" class:player-board={!audit} class:table-board={tabletop}>
 {#if audit}
 <div class="board-audit-controls"><label>Map size<select bind:value={zoom}><option value={900}>Overview · orientation only</option><option value={1300}>Readable · 1300 px</option><option value={1800}>Table · 1800 px</option><option value={2400}>Large table · 2400 px</option></select></label><label>Patrol<select bind:value={route}><option value={-1}>All original routes</option>{#each patrols as patrol,i}<option value={i}>{patrol.colour} · {patrol.a} → {patrol.b}</option>{/each}</select></label><button class="plain-button" onclick={centerGuard}>Find Abbess</button></div>
 <p class="map-mode-note">{zoom<1300?'Orientation overview. Choose Readable or a larger map for dot input.':'155 original spaces · scroll the map in both directions to inspect every room.'}</p>
 <div class="board-audit-toggles"><label><input type="checkbox" bind:checked={showSight}/>Sight</label><label><input type="checkbox" bind:checked={showSound}/>Hearing</label><label><input type="checkbox" bind:checked={showWalls}/>Sight barriers</label><label><input type="checkbox" bind:checked={showLabels}/>Room labels</label></div>
 {/if}
 <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables two-dimensional map scrolling.) -->
 <div bind:this={viewport} bind:clientWidth={width} bind:clientHeight={height} class="board-viewport" class:audit-viewport={audit} role="region" aria-label="Abbey board" tabindex="0" onpointermove={pointerMove} onpointerup={pointerUp} onpointercancel={cancelDrag} onpointerdown={e=>{if((e.target as HTMLElement).closest('button'))return;pointerDown(e,'pan');}} onwheel={wheel}>
 {#if !audit}<div class="board-hud" style:left="12px" style:right="12px" style:top="12px"><div class="abbess-location"><b>{heading??`Abbess · ${fixture.guardDot}`}</b>{#if showFacing}<span>{directionSymbol} {fixture.facing}</span>{/if}</div><div class="map-tools"><button aria-label="Show visibility barriers" aria-pressed={showWalls} onclick={()=>showWalls=!showWalls}>Barriers</button><button aria-label="Show guard sight" aria-pressed={showSight} onclick={()=>showSight=!showSight}>Sight</button>{#if !tabletop}<button onclick={focus} aria-label="Focus on the action">◎</button><button onclick={showAbbey}>Whole abbey</button><button onclick={()=>magnify(1.35)} aria-label="Zoom in">＋</button><button onclick={()=>magnify(1/1.35)} aria-label="Zoom out">−</button>{/if}{#if onundo}<button onclick={onundo} disabled={!canUndo} aria-label="Undo move">↶</button>{/if}</div></div>{/if}
 <div bind:this={map} class="map-tray canonical-map-tray">
 <div class="canonical-board" style:width={audit?zoom+'px':'1000px'} style:transform={audit?undefined:`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`} data-board-scale={audit?1:camera.scale} data-node-count={nodes.length} data-edge-count={connections.length}>
 <img class="canonical-painting" src={base + '/art/moonlit/board.webp'} alt="Moonlit Storybook painting preserving the original 2010 abbey floorplan" draggable="false"/>
 <svg viewBox="0 0 1000 1038" class="canonical-overlay" role="img" aria-label="Exact numbered map, colored patrol routes, locks, doors, keys and goal locations">
 <defs><filter id="map-shadow" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1038"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".7"/></filter></defs>
 <g class="ordinary-connections">{#each connections as edge}<polyline points={polyline(edge.points)}/>{/each}</g>
 <g class="colored-patrols">{#each connections as edge}{@const lanes=edgeColors(edge.a,edge.b)}{#each lanes as color,i}<polyline points={polyline(offsetPoints(edge.points,(i-(lanes.length-1)/2)*5.6))} stroke={colors[color]} stroke-width={routeEdges?.has(edge.id)?5:4} opacity={routeEdges&&!routeEdges.has(edge.id)?.14:1}/>{/each}{/each}</g>
 {#if showWalls}<g class="sight-barriers" aria-label="Visibility blocking walls">{#each board.walls as wall}<line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2}/>{/each}</g><g aria-label="Hiding places">{#each nodes.filter(n=>n.invisible) as n}<circle cx={n.x} cy={n.y} r="23" fill="#b97fe333" stroke="#e1a6ee" stroke-width="3"><title>Hiding place · {n.id}</title></circle>{/each}</g>{/if}
 <g class="original-doors">{#each doors as door}<g transform={`translate(${door.x},${door.y})`}><path d="M-5-5H5V5H-5Z" class="door-frame"/><path d="M-3 3V-3H3" class="door-leaf"/></g>{/each}</g>
 <g class="locked-doors">{#each board.locks as lock}{@const a=nodeById.get(lock.from)!}{@const b=nodeById.get(lock.to)!}<g transform={`translate(${(a.x+b.x)/2},${(a.y+b.y)/2})`}><circle r="11" fill={colors[lock.colour]} stroke="#182d38" stroke-width="1.5"/><path d="M-5-1V7H5V-1ZM-3-1V-5A3 3 0 0 1 3-5V-1" fill="none" stroke="#18212a" stroke-width="2"/><title>{lock.colour} locked door · {lock.from}–{lock.to}</title></g>{/each}</g>
 {#if showLabels}<g class="canonical-room-labels">{#each board.labels.filter(l=>!['Anne Marie','Margaret','Theresa','Celeste','Angelica','Bernadette'].includes(l.text)) as label}<text x={label.x} y={label.y} transform={label.vertical?`rotate(-90 ${label.x} ${label.y})`:undefined}>{label.text}</text>{/each}</g>{/if}
 {#each nodes as dot}{@const goal=board.keys.find(k=>k.goalnode===dot.id)}{@const nodeColor=goal?colors[goal.colour]:dot.id===26?colors.white:null}{@const seeing=showSight?(sightGuards.length?sightGuards.filter((g:{id:string;dot:number;facing:Facing})=>isVisible(g.dot,dot.id,g.facing)):isVisible(fixture.guardDot,dot.id,fixture.facing as Facing)?[{id:'abbess'}]:[]):[]}{@const visible=seeing.length>0}{@const audible=showSound&&isHeard(fixture.guardDot,dot.id,roll,modifier,walking)}
 <g class="original-node" class:selected={selected.id===dot.id} class:visible class:audible class:endpoint={endpoints.includes(dot.id)}>
 {#if visible||audible}<circle cx={dot.x} cy={dot.y} r="20" class="audit-halo" data-seen-by={seeing.map((g:{id:string})=>g.id).join(" ")}><title>{seeing.map((g:{id:string})=>g.id==='abbess'?'Abbess':'Prioress').join(" & ")} can see {dot.id}</title></circle>{#if seeing.some((g:{id:string})=>g.id==='prioress')}<circle cx={dot.x} cy={dot.y} r="24" fill="none" stroke="#fffdf4" stroke-width="3" stroke-dasharray="4 3"/>{/if}{/if}
 <circle cx={dot.x} cy={dot.y} r="13" fill={nodeColor??(endpoints.includes(dot.id)?'#132634':'#f0dfb8')} stroke={nodeColor??'#182f3c'} stroke-width={nodeColor?3:1.8}/>
 <text x={dot.x} y={dot.y+4.5} class:light={endpoints.includes(dot.id)&&!nodeColor}>{dot.id}</text>
 {#if dot.invisible}<path d={`M${dot.x-7} ${dot.y+18}h14`} stroke="#f8d976" stroke-width="2.5"/>{/if}
 </g>{/each}
 <g class="original-keys">{#each board.keys as key}{@const p=keyPosition(key)}<g transform={`translate(${p.x},${p.y})`}><rect x="-16" y="-10" width="32" height="20" rx="4" fill={colors[key.colour]} stroke="#122631" stroke-width="1.4"/><path d="M-9-3a3 3 0 1 0 0 6a3 3 0 0 0 0-6m2 3h7m-2 0v4" stroke="#172d37" stroke-width="1.9" fill="none"/><text x="7" y="4" text-anchor="middle" fill="#112331" font-size="12" font-weight="bold">{key.id}</text><title>Key {key.id} · {key.colour} · dot {key.node}</title></g>{/each}</g>
 {#if audit&&path.length>1}<polyline points={polyline(pathPoints(path))} class="audit-path"/>{/if}
 </svg>
 {#if audit}{#each nodes as dot}<button disabled={zoom<1300} class="canonical-node-hit" style:left={dot.x/10+'%'} style:top={dot.y/10.38+'%'} aria-label={`Inspect dot ${dot.id}: ${roomAt(dot.id)}`} aria-pressed={selected.id===dot.id} onclick={()=>oninspect?.(dot.id)} data-dot={dot.id}></button>{/each}{/if}
 {#if boardOverlay}{@render boardOverlay()}{/if}
 {#if showGuard}<div class="canonical-guard compact-guard" data-motion-id={motionId} data-motion-kind="travel" data-motion-state={fixture.guardDot+fixture.facing} style:left={(dragPoint?.x??guard.x)/10+'%'} style:top={(dragPoint?.y??guard.y)/10.38+'%'}><AbbessPawn facing={fixture.facing} index={pawnIndex}/></div>{/if}
 </div></div>
 {#if !audit}
 {#if interaction==='guard'}<div class="board-touch-layer">
 {#each legal as id}{@const dot=nodeById.get(id)!}<button disabled={busy} class="move-destination" style:left={camera.x+dot.x*camera.scale+'px'} style:top={camera.y+dot.y*camera.scale+'px'} onclick={()=>move(id)} aria-label={`Move ${pawnName} to ${id}, ${roomAt(id)}`} data-destination={id}><span>{id}</span></button>{/each}
 <button disabled={busy} class="pawn-grab" style:left={camera.x+(dragPoint?.x??guard.x)*camera.scale+'px'} style:top={camera.y+(dragPoint?.y??guard.y)*camera.scale+'px'} aria-label={`${pawnName} at ${fixture.guardDot}, facing ${fixture.facing}. ${canTurn?'Tap to turn or ':''}drag to a lit space.`} aria-expanded={turning} onpointerdown={e=>pointerDown(e,'pawn')} onclick={e=>{if(e.detail===0&&canTurn)turning=!turning;}}></button>
 </div>
 {#if turning}<div class="turn-compass" style:left={Math.max(94,Math.min(width-94,pawnScreen.x))+'px'} style:top={Math.max(120,Math.min(height-125,pawnScreen.y))+'px'}><span>Turn Abbess</span>{#each ['North','East','South','West'] as facing}<button class={facing.toLowerCase()} aria-label={`Face ${facing}`} aria-pressed={fixture.facing===facing} onclick={()=>{onchoice?.({type:'face',facing:facing as Facing});turning=false;}}>{({North:'↑',East:'→',South:'↓',West:'←'})[facing]}<small>{facing}</small></button>{/each}<button class="close-turn" aria-label="Close turn controls" onclick={()=>turning=false}>×</button></div>{/if}
 {/if}
 {#if boardControls}{@render boardControls(camera)}{/if}
 <p class="board-hint"  role="status">{notice||hint||(turning?'Choose where she looks.':'Tap a lit space, or drag the Abbess. Tap her to turn.')}</p>
 {/if}
 </div>
 {#if audit}
 <div class="board-audit-panel"><div class="audit-identity"><strong>{selected.id}</strong><div><h3>{roomAt(selected.id)}</h3><p>Connected dots: {neighbors(selected.id).join(', ')}</p></div><button class="plain-button" disabled={!neighbors(fixture.guardDot).includes(selected.id)} onclick={()=>onchoice?.({type:'move',dot:selected.id})}>Move Abbess here</button></div>
 <div class="audit-settings"><label>Abbess facing<select value={fixture.facing} onchange={e=>onchoice?.({type:'face',facing:e.currentTarget.value as Facing})}>{#each ['North','East','South','West'] as direction}<option>{direction}</option>{/each}</select></label><label>Hearing roll<select bind:value={roll}>{#each [1,2,3,4,5,6] as n}<option value={n}>{n}</option>{/each}</select></label><label>Novice noise<select bind:value={modifier}><option value={0}>Run · 0</option><option value={-1}>Walk · −1</option><option value={-2}>Sneak · −2</option><option value={-3}>Still · −3</option></select></label><label class="walking-toggle"><input type="checkbox" bind:checked={walking}/>Guard walking</label></div>
 <div class="audit-results"><p><b>Movement / sound distance</b><span>{distance(fixture.guardDot,selected.id)} edges from dot {fixture.guardDot}. Doors transmit sound.</span></p><p><b>Visibility</b><span>{seen?'Visible':'Not visible'} facing {fixture.facing.toLowerCase()} · six-dot limit.</span></p><p><b>Hearing</b><span>{heard?'Heard':'Not heard'} · range {walking?Math.max(0,roll+modifier):0}. {heard&&selected.id!==fixture.guardDot?`Noise points toward ${soundDirections(fixture.guardDot,selected.id).join(' or ')}.`:''}</span></p></div>
 <details><summary>Visible dots, routes and board sources</summary><p>Visible from {fixture.guardDot}: {sightList.join(', ')}.</p><p>Patrol: {route<0?'all 14 printed colored routes':patrols[route].path.join(' → ')}. Colors: blue, green, purple, red and orange.</p><p>Eight key sites; ten colored locks; seven distinct wish-item sites; five patrol endpoints. Underlined dots mark tree/confessional hiding places.</p><a href="https://www.mind-maze.uk/nuns-on-the-run/" target="_blank" rel="noreferrer">Original map reference ↗</a><a href="https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf" target="_blank" rel="noreferrer">Published visibility tables · page 8 ↗</a></details>
 </div>
 {/if}
</div>

<style>
 .board-viewport{position:relative}.compact-guard{width:64px;height:64px;transform:translate(-50%,-50%);filter:none;z-index:6;pointer-events:none}.player-board{height:100%;width:100%;min-height:0}.player-board .board-viewport{height:100%;overflow:hidden;touch-action:none;background:#091b24;isolation:isolate}.player-board .canonical-map-tray{position:absolute;inset:0;width:100%;height:100%;min-height:0;overflow:hidden;border:0;scrollbar-gutter:auto}.player-board .canonical-board{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}.board-touch-layer{position:absolute;inset:0;pointer-events:none;z-index:11}.board-touch-layer button{pointer-events:auto;position:absolute;transform:translate(-50%,-50%);padding:0;width:44px;height:44px;min-height:44px;border-radius:50%;touch-action:none}.move-destination{background:#f9e3a52b;border:2px solid #ffdd87;box-shadow:0 0 0 3px #102b38dc,0 0 15px #fbe29666;color:#132936}.move-destination span{display:grid;place-items:center;margin:auto;min-width:25px;width:fit-content;padding:0 4px;height:25px;border-radius:50%;background:#ffecb8;font:bold 17px Arial}.move-destination:hover{background:#f9e3a580;box-shadow:0 0 0 4px #fff3c5aa}.pawn-grab{background:transparent;cursor:grab}.pawn-grab:active{cursor:grabbing}.pawn-grab:focus-visible{outline:3px solid #fff1b9;outline-offset:4px}.board-hud{position:absolute;inset:12px 12px auto;display:flex;justify-content:space-between;gap:8px;align-items:start;z-index:10;pointer-events:none}.abbess-location{display:flex;flex-direction:column;gap:4px;border:1px solid #e7d39a66;border-radius:12px;padding:9px 13px;background:#102935ee;box-shadow:0 3px 10px #0005;color:#fff0c9;pointer-events:auto;font-size:16px}.abbess-location span{font-size:19px;font-weight:bold}.map-tools{display:flex;gap:6px;pointer-events:auto}.map-tools button{min-width:44px;height:44px;border-radius:10px;border:1px solid #e0ce9b88;background:#102935ee;color:#f8e9bc;padding:8px;font-size:17px}.map-tools button:disabled{opacity:.45}.board-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);margin:0;padding:8px 14px;max-width:calc(100% - 24px);width:max-content;border-radius:12px;background:#102935ee;color:#eee1bd;font-size:14px;text-align:center;z-index:10;pointer-events:none;line-height:1.4}.turn-compass{position:absolute;transform:translate(-50%,-50%);width:188px;height:220px;border-radius:90px;background:#102a38f5;border:1px solid #e2cf9780;box-shadow:0 6px 25px #000a;z-index:12}.turn-compass>span{position:absolute;top:98px;left:0;width:100%;text-align:center;color:#f6e1af;font-size:14px;pointer-events:none}.turn-compass button{position:absolute;width:56px;height:62px;border-radius:14px;border:1px solid #cbbd8e99;background:#244351;color:#fff0c1;font-size:27px;padding:1px}.turn-compass small{display:block;font-size:11px}.turn-compass button[aria-pressed=true]{background:#ead39c;color:#17323e}.turn-compass .north{top:4px;left:65px}.turn-compass .south{bottom:4px;left:65px}.turn-compass .west{left:4px;top:72px}.turn-compass .east{right:4px;top:72px}.turn-compass .close-turn{width:32px;height:32px;min-height:32px;top:-9px;right:-3px;border-radius:50%;font-size:23px}.table-board .board-hud{inset:14px 18px auto}.table-board .board-hint{bottom:12px}.audit-viewport .canonical-map-tray{position:relative}
 @media(max-width:600px){.map-tools{display:grid;grid-template-columns:repeat(3,48px)}.map-tools button{font-size:11px;min-width:0;width:48px;line-height:1.1;padding:3px}.abbess-location{max-width:140px}.board-hud{inset:8px}.abbess-location{font-size:13px;padding:7px 9px}.abbess-location span{font-size:17px}.map-tools{gap:4px}.map-tools button{font-size:14px;padding:5px}.board-hint{font-size:12px}.map-tools button:nth-child(2){max-width:65px;line-height:1.1}}
</style>
