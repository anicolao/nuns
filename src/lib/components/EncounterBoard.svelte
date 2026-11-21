<script lang="ts">
 import GameSurface from './GameSurface.svelte';
 import {MotionPlayer} from '$lib/motion/player';
 import {applyEvent} from '$lib/game/engine';
 import {publicGame,type PublicGame} from '$lib/game/projection';
 import type {Intent} from '$lib/game/model';
 import {seedGameFixture,advanceFixtureHearing,type FixtureMode} from '$lib/lab/fixtures';
 let {mode,publicView=false,motion=new MotionPlayer(),incoming=null,onprojection,tabletop=false}=$props<{mode:FixtureMode;publicView?:boolean;motion?:MotionPlayer;incoming?:PublicGame|null;onprojection?:(view:PublicGame)=>void;tabletop?:boolean}>();
 const seed=()=>publicView?null:seedGameFixture(mode);
 let game=$state(seed()),error=$state('');
 const actor=$derived(mode==='novice'||mode==='false-noise'?'novice':'guard');
 function send(intent:Intent){if(!game)return;try{game=applyEvent($state.snapshot(game),{version:2,id:crypto.randomUUID(),sequence:game.revision+1,actor,intent});error='';}catch(e){error=e instanceof Error?e.message:String(e);}}
 const seedPublic=()=>publicGame(seedGameFixture(mode));
 const fallback=$derived(incoming??seedPublic());
 $effect(()=>{if(game)onprojection?.(publicGame(game));});
 export function nextHearing(){if(game&&mode==='false-noise'){try{game=advanceFixtureHearing($state.snapshot(game));}catch(e){error=e instanceof Error?e.message:String(e);}}}
 export function undoPlanning(){/* Route editing is owned by the same production GameSurface controls. */}
</script>
<GameSurface game={game} {actor} publicView={publicView||tabletop} incoming={fallback} {motion} {send} rollDie={()=>6} {error}/>
