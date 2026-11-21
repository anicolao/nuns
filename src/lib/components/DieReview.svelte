<script lang="ts">
 import Dice from './Dice.svelte';import type {MotionPlayer} from '$lib/motion/player';
 let {motion,review=false}=$props<{motion?:MotionPlayer;review?:boolean}>();let value=$state(5),roll=$state(0);
 function rollDie(){const sample=new Uint32Array(1);do{crypto.getRandomValues(sample);}while(sample[0]>=4294967292);value=sample[0]%6+1;roll++;}
</script>
<div class="die-review"><button class="object-button" onclick={rollDie} aria-label="Roll noise die"><Dice {value} {motion} revision={roll}/></button><p>Noise die · <strong>{value}</strong></p>{#if review}<div class="die-face-controls" aria-label="Preview die result">{#each [1,2,3,4,5,6]as n}<button aria-label={`Preview die face ${n}`} aria-pressed={value===n} onclick={()=>{value=n;roll++;}}>{n}</button>{/each}</div><small>Face preview · no game roll</small>{:else}<p class="roll-hint">Tap the die to roll.</p>{/if}</div>
<style>.roll-hint{font-size:16px;color:#c0d1c9}</style>
