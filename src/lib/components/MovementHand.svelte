<script lang="ts">
 import type {Speed} from '$lib/review';
 import type {Style} from '$lib/catalog';
 import {movementArt} from './card-layout';
 import ArtCard from './ArtCard.svelte';
 let {selected='Sneak',onselect,disabled=false,locked,style='moonlit',guard=false,audit=false,extra=false}=$props<{selected?:Speed;onselect?:(speed:Speed)=>void;disabled?:boolean;locked?:Speed;style?:Style;guard?:boolean;audit?:boolean;extra?:boolean}>();
 const cards:{name:Speed;distance:string;noise:string}[]=[{name:'Still',distance:'0',noise:'−3'},{name:'Sneak',distance:'1–2',noise:'−2'},{name:'Walk',distance:'3–4',noise:'−1'},{name:'Run',distance:'Up to 5',noise:'0'}];
</script>
<div class="movement-hand" class:audit role="region" aria-label="Choose your movement" data-production-component="MovementHand">
 {#each cards.filter(c=>!guard||c.name==='Walk'||c.name==='Run') as card}<button class="object-button" disabled={disabled||!!locked&&locked!==card.name} aria-label={`Choose ${card.name}`} aria-pressed={selected===card.name} onclick={()=>onselect?.(card.name)}><ArtCard {style} face="movement" illustration={movementArt[card.name]} title={card.name} selected={selected===card.name}><div class="movement-values"><strong>{guard?(card.name==='Walk'?(extra?'4–5':'3–4'):(extra?'6–7':'5–6')):extra?(card.name==='Still'?'0':card.name==='Sneak'?'2–3':card.name==='Walk'?'4–5':'Up to 6'):card.distance}</strong><span>dots</span><b>{guard?(card.name==='Walk'?'Can hear':'Cannot hear'):`Noise ${card.noise}`}</b></div></ArtCard></button>{/each}
</div>
<style>
 .movement-hand{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));width:100%;max-width:1100px;margin:auto;gap:16px;padding:12px 0;align-items:center}.movement-hand .object-button{width:100%;min-width:0}.movement-hand :global(.painted-card){width:100%;min-width:0;max-width:285px;margin:auto}.object-button:disabled{opacity:.5}.audit{display:flex;overflow:auto;scroll-snap-type:x mandatory}.audit .object-button{width:260px;flex:none}
 @media(max-width:600px) and (min-height:500px){.movement-hand{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:420px}}
 @media(max-height:500px){.movement-hand{max-width:720px;gap:10px}.movement-hand :global(.painted-title){font-size:18px}.movement-hand :global(.movement-values>strong){font-size:24px}.movement-hand :global(.movement-values>b){font-size:14px;padding-top:3px}}
</style>
