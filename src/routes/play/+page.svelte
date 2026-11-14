<script lang="ts">
 import {onMount} from 'svelte';import InteractionScene from '$lib/components/InteractionScene.svelte';
 let scenario=$state('movement'),publicView=$state(false),reduced=$state(false),review=$state(false),ready=$state(false);
 onMount(()=>{const p=new URLSearchParams(location.search);scenario=p.get('scenario')??'movement';publicView=p.get('public')==='1';reduced=p.get('reduced')==='1';review=p.get('review')==='1';ready=true;});
</script>
<svelte:head><title>Nuns on the Run · Play surface</title></svelte:head>
{#if ready}<InteractionScene {scenario} {publicView} {reduced} {review}/>{/if}
