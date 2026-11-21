<script lang="ts">
 import {onMount} from 'svelte';import {base} from '$app/paths';import {replaceState} from '$app/navigation';
 import {firebase} from '$lib/backend/firebase';import {repository,roomCode,validCode,type RoomRepository} from '$lib/backend/repository';
 import {replay} from '$lib/game/engine';import {noviceNames,type RoomState,type Intent,type GameEvent} from '$lib/game/model';
 import GameSurface from '$lib/components/GameSurface.svelte';import {MotionPlayer} from '$lib/motion/player';
 let {tabletop=false}=$props<{tabletop?:boolean}>();
 let room=$state<RoomState|null>(null),repo=$state<RoomRepository>(),uid=$state(''),code=$state(''),enteredCode=$state(''),name=$state(''),role=$state<'novice'|'guard'>('guard'),character=$state(3),capacity=$state(4),busy=$state(false),online=$state(false),error=$state(''),loading=$state(true),pending=$state(false),copied=$state(false),invite=$state(''),qr=$state('');
 const motion=new MotionPlayer();
 $effect(()=>{if(room?.phase==='lobby'&&!room.seats.some(p=>p.uid===uid)){const guards=room.seats.filter(p=>p.role==='guard').length,novices=room.seats.filter(p=>p.role==='novice');if(guards>=(room.capacity===8?2:1))role='novice';else if(novices.length>=6)role='guard';if(role==='novice'&&novices.some(p=>p.character===character))character=[0,1,2,3,4,5].find(i=>!novices.some(p=>p.character===i))??character;}});
 const me=$derived(room?.seats.find(p=>p.uid===uid));
 let live=true;
 async function openRoom(next:string){
  const normalized=next.toUpperCase().trim();if(!validCode(normalized))throw Error('Enter a six-character invitation code.');
  const services=await firebase();if(!live)return;uid=services.uid;repo?.close();code=normalized;room=null;loading=true;
  const url=new URL(location.href);url.searchParams.set('room',code);replaceState(url,{});invite=new URL(base+'/controller/?room='+code,location.origin).href;
  void import('qrcode').then(q=>q.toDataURL(invite,{width:192,margin:2})).then(value=>qr=value).catch(()=>{});
  await new Promise<void>((resolve,reject)=>{
   repo=repository(services.db,uid,code,{events:events=>{try{const result=replay(events);room=result.state;loading=false;if(result.diagnostics.length)error=`${result.diagnostics.length} invalid choices were ignored during replay.`;resolve();}catch(e){reject(e);}},connection:value=>online=value,error:e=>{error=e.message;loading=false;reject(e);}});
  });
  pending=!!repo?.pending();
 }
 async function run(operation:()=>Promise<void>){if(busy)return;busy=true;error='';try{await operation();}catch(e){error=e instanceof Error?e.message:String(e);}finally{busy=false;pending=!!repo?.pending();}}
 async function send(intent:Intent){await run(async()=>{if(!repo)throw Error('Join a room first.');await repo.append(intent);});}
 async function create(){await run(async()=>{await openRoom(roomCode());await repo!.append({type:'create',capacity,mode:tabletop?'tabletop':'personal'});if(!tabletop)await repo!.append({type:'join',name:name.trim()||'Player',role,character});});}
 async function join(){await send({type:'join',name:name.trim()||'Player',role,character});}
 onMount(()=>{
  live=true;const params=new URLSearchParams(location.search);const requested=params.get('room');
  if(requested)void run(()=>openRoom(requested));else loading=false;
  return()=>{live=false;repo?.close();motion.clear();};
 });
 async function copy(){try{await navigator.clipboard.writeText(invite);copied=true;}catch{error='Select and copy the invitation link below.';}}
</script>
<svelte:head><title>Nuns on the Run · {code||'Play'}</title><meta name="description" content="Slip through the moonlit abbey, retrieve your secret wish, and get home before the guards catch you."/></svelte:head>
<div class="game-hub" class:in-game={!!room&&room.phase!=='lobby'}>
 {#if room&&room.phase!=='lobby'}
 <nav class="room-bar" aria-label="Room controls"><a href={base+'/'}>Nuns <i>on the</i> Run</a><span>Room <b>{code}</b></span><span class:offline={!online} role="status">{online?'Connected':'Offline · showing last confirmed position'}</span><button disabled={busy} onclick={()=>run(async()=>{await repo!.refresh();})}>Refresh game</button><button onclick={copy}>{copied?'Copied':'Copy invitation'}</button>{#if pending}<button onclick={()=>run(async()=>{await repo!.retry();})}>Retry pending choice</button>{/if}</nav>
 <div class="live-game"><GameSurface game={room} actor={uid} publicView={tabletop} {motion} {send} busy={busy||!online} {error}/></div>
 {:else}
 <main class="game-entrance"><header><p class="eyebrow">A little mischief after midnight</p><h1>Nuns <i>on the</i> Run</h1><p>Slip through the abbey. Find your secret wish. Make it home.</p><a href={base+'/lab/'}>Animation lab</a> · <a href={base+'/gallery/'}>Component gallery</a>{#if !tabletop} · <a href={base+'/tabletop/'}>Shared tabletop</a>{/if}</header>
 {#if error}<p class="connection-error" role="alert">{error}</p>{/if}
 {#if pending}<button disabled={busy} onclick={()=>run(async()=>{await repo!.retry();})}>Retry pending choice</button>{/if}
 {#if loading}<p role="status">Opening the abbey…</p>
 {:else if !code}<section class="entrance-grid"><form onsubmit={e=>{e.preventDefault();void create();}}><h2>{tabletop?'Open a shared tabletop':'Create a game'}</h2>{#if !tabletop}<label>Your name<input bind:value={name} maxlength="30" placeholder="Your name" required/></label><label>Your side<select bind:value={role}><option value="guard">Guard team</option><option value="novice">Novice</option></select></label>{#if role==='novice'}<label>Character<select bind:value={character}>{#each noviceNames as text,i}<option value={i}>{text}</option>{/each}</select></label>{/if}{/if}<label>Room capacity<select bind:value={capacity}>{#each [2,3,4,5,6,7,8] as count}<option value={count}>{count} players</option>{/each}</select></label><button class="primary" disabled={busy}>Create room</button></form><form onsubmit={e=>{e.preventDefault();void run(()=>openRoom(enteredCode));}}><h2>Join friends</h2><label>Invitation code<input bind:value={enteredCode} maxlength="6" autocapitalize="characters" placeholder="ABC234" required/></label><button disabled={busy}>Open room</button></form></section>
 {:else if !room}<section><h2>Room {code} was not found</h2><p>Check the invitation code or return to create a room.</p><a href={base+'/'}>Return to the entrance</a></section>
 {:else}<section class="lobby"><h2>Room {code}</h2><p>Share this link with your friends. Two to eight players; one guard player, or two in an eight-player game.</p>{#if qr}<img class="join-qr" src={qr} alt="Scan to join this room" width="192" height="192"/>{/if}<label>Invitation link<input value={invite} readonly onclick={e=>e.currentTarget.select()}/></label><button onclick={copy}>{copied?'Copied':'Copy invitation'}</button><ul class="roster">{#each room.seats as seat}<li><b>{seat.name}</b> · {seat.role==='novice'?noviceNames[seat.character]:'Guard team'} · {seat.ready?'Ready':'Getting ready'}{seat.uid===uid?' · You':''}</li>{/each}</ul>
 {#if !me&&!tabletop}<form onsubmit={e=>{e.preventDefault();void join();}}><label>Your name<input bind:value={name} maxlength="30" required/></label><label>Your side<select bind:value={role}><option value="guard" disabled={room.seats.filter(p=>p.role==='guard').length>=(room.capacity===8?2:1)}>Guard team</option><option value="novice" disabled={room.seats.filter(p=>p.role==='novice').length>=6}>Novice</option></select></label>{#if role==='novice'}<label>Character<select bind:value={character}>{#each noviceNames as text,i}<option value={i} disabled={room.seats.some(p=>p.role==='novice'&&p.character===i)}>{text}</option>{/each}</select></label>{/if}<button disabled={busy||room.seats.length>=room.capacity}>Take a seat</button></form>
 {:else if me}<button disabled={busy} aria-pressed={me.ready} onclick={()=>send({type:'ready',ready:!me.ready})}>{me.ready?'Ready ✓':'I’m ready'}</button>{/if}
 {#if uid===room.host}<button class="primary" disabled={busy||room.seats.length<2||!room.seats.every(p=>p.ready)} onclick={()=>send({type:'start',seed:crypto.getRandomValues(new Uint32Array(1))[0]||1})}>Start game</button>{/if}
 </section>{/if}
 </main>
 {/if}
</div>
<style>
 .game-hub{height:100dvh;overflow-y:auto;overscroll-behavior:contain;min-height:0;background:radial-gradient(ellipse at top,#284959,#091b26);color:#f3e3bf;font:16px/1.5 Arial}.game-hub.in-game{height:100dvh;min-height:0;overflow:hidden;display:flex;flex-direction:column}.room-bar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:7px 14px;border-bottom:1px solid #9fae9366;flex:none;min-height:48px;font-size:13px}.room-bar a{font:20px Georgia;margin-right:auto}.room-bar button,.game-entrance button{min-height:44px;padding:9px 14px;border:1px solid #cfc08e99;background:#254553;color:#ffecc0;border-radius:9px;cursor:pointer;font:15px Arial}.room-bar button{font-size:12px;padding:7px 10px;min-height:36px}.live-game{flex:1;min-height:0}.offline,.connection-error{color:#ffbc97}.game-entrance{max-width:1000px;margin:auto;padding:45px 24px}.game-entrance header{text-align:center;margin-bottom:36px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#bfd0b8}.game-entrance h1{font:54px Georgia;margin:12px}.game-entrance h2{font:28px Georgia;margin:0 0 20px}.game-entrance a{color:#e5ca8f;text-decoration:underline}.game-entrance header>a{font-size:14px}.entrance-grid{display:grid;grid-template-columns:1fr 1fr;gap:25px}.game-entrance form,.lobby{padding:24px;border:1px solid #a4b09466;border-radius:16px;background:#102c39c9}.game-entrance label{display:flex;flex-direction:column;gap:7px;margin:0 0 16px;color:#cbd6c3}.game-entrance input,.game-entrance select{min-height:44px;border:1px solid #c3c39b88;background:#173543;color:#ffefc7;padding:10px;border-radius:7px;font:16px Arial;min-width:0}.game-entrance button.primary{background:#ead29b;color:#16313f}.game-entrance button:disabled{opacity:.45}.game-entrance button[aria-pressed=true]{background:#d9c591;color:#12313b}.roster{list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;margin:22px 0}.roster li{padding:12px;border-bottom:1px solid #d4c59455}.lobby>button{margin:0 8px 14px 0}.lobby form{margin:18px 0}.join-qr{display:block;margin:12px auto;border-radius:8px}
 @media(max-width:600px){.entrance-grid{grid-template-columns:1fr}.game-entrance{padding:28px 15px}.game-entrance h1{font-size:40px}.room-bar{gap:8px;padding:4px 8px;font-size:11px}.room-bar a{display:none}.room-bar button{font-size:11px}.room-bar>span:nth-of-type(2){max-width:140px}.room-bar button:nth-of-type(1){display:none}}
 @media(max-height:500px){.room-bar{min-height:36px;padding:3px 10px}.room-bar button{min-height:30px;padding:4px 8px}.room-bar a{font-size:16px}}
</style>
