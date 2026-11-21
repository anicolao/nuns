<script lang="ts">
 import {base} from '$app/paths';
 let {guard}=$props<{guard:'abbess'|'prioress'}>();
</script>
<span class="guard-portrait" class:light={guard==='prioress'} aria-hidden="true"><img src={base+`/art/moonlit/character-${guard==='abbess'?6:7}.webp`} alt=""/></span>
<style>
 .guard-portrait{display:inline-grid;place-items:center;width:28px;height:28px;flex:0 0 28px;vertical-align:middle;border:2px solid #fbe6aa;border-radius:50%;background:#1c3947;margin-right:6px}.guard-portrait.light{background:#fffdf4;border-color:#fff;box-shadow:0 0 0 1px #243c51}.guard-portrait img{width:19px;height:25px;object-fit:contain}
</style>
