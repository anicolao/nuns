<script lang="ts">
 import {onMount} from 'svelte';import InteractionScene from '$lib/components/InteractionScene.svelte';import GameHub from '$lib/GameHub.svelte';
 let scenario=$state(''),publicView=$state(false),reduced=$state(false),review=$state(false),ready=$state(false);
 onMount(()=>{const p=new URLSearchParams(location.search);scenario=p.get('scenario')??'';publicView=p.get('public')==='1';reduced=p.get('reduced')==='1';review=p.get('review')==='1';ready=true;});
</script>
{#if ready}{#if scenario}<InteractionScene {scenario} {publicView} {reduced} {review}/>{:else}<GameHub/>{/if}{/if}
