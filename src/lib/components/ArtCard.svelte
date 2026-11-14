<script lang="ts">
 import {base} from '$app/paths';
 import {onMount} from 'svelte';
 import type{Style}from'$lib/catalog';import{cardWells,regionStyle}from'./card-layout';
 let{style='moonlit',face='wish',title='A little medicine',reverse=false,selected=false,illustration,artwork,children,readableLandscape=false}=$props<{style?:Style;face?:string;title?:string;reverse?:boolean;selected?:boolean;illustration?:string;readableLandscape?:boolean;artwork?:import('svelte').Snippet;children?:import('svelte').Snippet}>();
 let landscape=$state(false);
 onMount(()=>{const media=matchMedia('(max-height:500px) and (min-width:600px)');const change=()=>landscape=media.matches;change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change);});
 const hasIllustration=$derived(!!illustration||!!artwork);
</script>
{#snippet cardBody()}
<div data-motion-id={"selection:"+face+title} data-motion-state={String(selected)} class="painted-card" class:chosen={selected} class:reverse class:has-illustration={hasIllustration} class:movement-card={!!illustration} style:aspect-ratio="320 / 484" data-card-face={face}>
 <div class="card-turner" data-motion-id={"flip:"+face+title} data-motion-kind="flip" data-motion-state={String(reverse)} style:transform={reverse?'rotateY(180deg)':'rotateY(0deg)'}>
 <div class="card-front" inert={reverse} aria-hidden={reverse}>
 <img class="card-body" src={`${base}/art/${style}/${face}.webp`} alt="" draggable="false"/>
 {#if hasIllustration}<div class="card-illustration" style={regionStyle(cardWells.illustration)}>{#if artwork}{@render artwork()}{:else}<img src={`${base}/art/${style}/${illustration}.webp`} alt={title+' movement illustration'} draggable="false"/>{/if}</div>{/if}
 <div class="painted-title" style={regionStyle(cardWells.title)}>{title}</div>
 <div class="painted-rules" style={regionStyle(cardWells.rules)}>{#if children}{@render children()}{/if}</div>
 </div><div class="card-back" inert={!reverse} aria-hidden={!reverse}><img class="card-body" src={`${base}/art/${style}/back.webp`} alt="Card back" draggable="false"/></div></div>
 {#if selected}<img class="selection-seal" src={`${base}/art/${style}/selected.webp`} alt="Selected" draggable="false"/>{/if}
</div>

{/snippet}
{#if readableLandscape}<div class="card-reading-layout" style:--parchment-image={`url('${base}/art/moonlit/parchment.webp')`}><div class="card-thumbnail" aria-hidden={landscape}>{@render cardBody()}</div><div class="card-reader" class:concealed={reverse} aria-hidden={reverse}><h3>{title}</h3>{#if children}{@render children()}{/if}</div></div>{:else}{@render cardBody()}{/if}

<style>
 .painted-card{perspective:1100px}.card-turner{position:absolute;inset:0;transform-style:preserve-3d}.card-front,.card-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}.card-back{transform:rotateY(180deg)}.card-back .card-body{clip-path:none}

 .card-reading-layout,.card-thumbnail{display:contents}.card-reader{display:none}
 @media(max-height:500px) and (min-width:600px){
 .card-reading-layout{display:flex;align-items:center;gap:22px;width:min(660px,calc(100vw - 70px));height:280px;text-align:left}.card-thumbnail{position:relative;display:block;width:185px;height:280px;flex:0 0 185px}.card-thumbnail .painted-card{position:absolute;left:0;top:0;width:320px!important;min-width:320px!important;height:484px!important;transform:scale(.5785);transform-origin:top left}.card-reader{display:flex;flex:1;min-width:0;min-height:240px;max-height:280px;justify-content:center;flex-direction:column;gap:16px;padding:25px 30px;background:var(--parchment-image) center/100% 100% no-repeat;color:#332d23}.card-reader h3{font:22px/1.2 Georgia;margin:0;text-align:center}.card-reader.concealed{visibility:hidden}
 }
</style>
