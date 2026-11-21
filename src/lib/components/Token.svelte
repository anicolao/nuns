<script lang="ts">
 import {base} from '$app/paths';
 import type {Style} from '$lib/catalog';
 let {style='moonlit',kind='noise',label='Noise',quantity=''}=$props<{style?:Style;kind?:string;label?:string;quantity?:string}>();
</script>
<figure class="painted-token"><img src={`${base}/art/${style}/${kind}.webp`} alt="" draggable="false"/>{#if label}<figcaption>{label}{#if quantity}<strong>{quantity}</strong>{/if}</figcaption>{/if}</figure>
