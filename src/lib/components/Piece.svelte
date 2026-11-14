<script lang="ts">
 import {base} from '$app/paths';
 import type {Style} from '$lib/catalog';
 let {style='moonlit',index=0,label=true}=$props<{style?:Style;index?:number;label?:boolean}>();
 const names=['Anne Marie','Margaret','Theresa','Celeste','Angelica','Bernadette','Abbess','Prioress'];
</script>
<figure class="painted-piece"><img src={`${base}/art/${style}/character-${index}.webp`} alt={names[index]+' die-cut standee'} draggable="false"/>{#if label}<figcaption><b>{index<6?`${index+1} · `:''}{names[index]}</b><span>{index<6?'Novice':'Guard · ↑ facing'}</span></figcaption>{/if}</figure>
