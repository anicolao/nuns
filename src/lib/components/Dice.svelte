<script lang="ts">
 import {onMount} from 'svelte';import {MotionPlayer} from '$lib/motion/player';
 let {value=5,motion=new MotionPlayer(),revision=0}=$props<{value?:number;motion?:MotionPlayer;revision?:number}>();
 let canvas:HTMLCanvasElement;let ready=$state(false),failed=$state(false);
 let draw:((progress:number,old:number)=>void)|undefined;let previous:number|undefined;let previousRevision=0;let from=5;let animation:Animation|undefined;
 $effect(()=>{
  const target=value;const version=revision;if(!ready)return;
  if(previous===undefined||(previous===target&&previousRevision===version)){previous=target;from=target;draw?.(1,target);return;}
  from=previous;previous=target;previousRevision=version;
  if(motion.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches){motion.clear();animation=undefined;draw?.(1,target);return;}
  animation=canvas.animate([{rotate:'0deg',translate:'0px 0px'},{rotate:'-9deg',translate:'0px -8px',offset:.35},{rotate:'5deg',translate:'0px -3px',offset:.7},{rotate:'0deg',translate:'0px 0px'}],{duration:640,fill:'both'});
  motion.play([animation],640);
 });
 onMount(()=>{
  let disposed=false,observer:ResizeObserver|undefined,release:(()=>void)|undefined;
  const render=()=>draw?.(animation?Math.min(1,Number(animation.currentTime??0)/640):1,from);
  motion.frames.add(render);
  void import('./dice-renderer').then(({acquireDiceRenderer})=>{
   if(disposed)return;
   try{const renderer=acquireDiceRenderer();release=renderer.release;draw=(progress,old)=>renderer.draw(canvas,[value],progress,[old],true);observer=new ResizeObserver(render);observer.observe(canvas);draw(1,value);ready=true;}
   catch{failed=true;}
  }).catch(()=>{failed=true;});
  return()=>{disposed=true;motion.frames.delete(render);motion.clear();draw=undefined;observer?.disconnect();release?.();};
 });
</script>
<div class="noise-die-model" role="img" aria-label={`Noise die: ${value}`}><canvas bind:this={canvas} data-dice-value={value}></canvas>{#if !ready}<span class="dice-fallback">{failed?'Die result':'Loading die'}<b>{value}</b></span>{/if}</div>
<style>
 .noise-die-model{position:relative;width:200px;height:200px;max-width:100%}canvas{display:block;width:100%;height:100%}.dice-fallback{position:absolute;inset:0;display:grid;place-content:center;text-align:center;font-size:14px;color:#ddcba6}.dice-fallback b{font-size:42px;display:block;margin-top:8px}
</style>
