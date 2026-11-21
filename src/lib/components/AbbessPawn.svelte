<script lang="ts">
 import {base} from '$app/paths';
 import type {Facing} from '$lib/game/board';
 let {facing='North',index=6}=$props<{facing?:Facing;index?:number}>();
 const angles:Record<string,number>={North:0,East:90,South:180,West:270};
 const angle=$derived(angles[facing]);
</script>
<div class="abbess-pawn" aria-hidden="true">
 <svg class="facing-arrow" viewBox="-32 -32 64 64"><g transform={`rotate(${angle})`}><path d="M0-30 12-10 5-13 5 1H-5V-13L-12-10Z" fill="#ffe298" stroke="#102632" stroke-width="3" stroke-linejoin="round"/></g></svg>
 <div class="pawn-body" class:light={index===7}><img src={base + `/art/moonlit/character-${index}.webp`} alt="" draggable="false"/></div>
</div>
<style>
 .abbess-pawn{position:relative;width:64px;height:64px;pointer-events:none}.facing-arrow{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 1px 1px #000)}.pawn-body{position:absolute;left:20px;top:20px;width:24px;height:24px;display:grid;place-items:center;border:2px solid #fbe6aa;border-radius:50%;background:#1c3947;box-shadow:0 1px 3px #0009}.pawn-body.light{background:#fffdf4;border-color:#fff;box-shadow:0 0 0 1px #243c51,0 1px 3px #0009}.pawn-body img{height:21px;width:17px;object-fit:contain}
</style>
