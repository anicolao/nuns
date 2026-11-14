<script lang="ts">
 import {base} from '$app/paths';
 import{connections,patrols,nodeById,pathPoints,polyline,colors}from'$lib/game/board';
 let{index=0}=$props<{index?:number}>();const patrol=$derived(patrols[index]);
 const start=$derived(nodeById.get(patrol.a)!);const end=$derived(nodeById.get(patrol.b)!);
</script>
<svg class="patrol-minimap" viewBox="0 0 1000 1038" role="img" aria-label={`${patrol.colour} patrol from ${patrol.aname} ${patrol.a} to ${patrol.bname} ${patrol.b}; ${patrol.path.length-1} steps`}>
 <rect width="1000" height="1038" fill="#18303b"/>
 <image href={base + '/art/moonlit/board.webp'} width="1000" height="1038" opacity=".48"/>
 <g fill="none" stroke="#c7d5c6" stroke-width="5" opacity=".38">{#each connections as edge}<polyline points={polyline(edge.points)}/>{/each}</g>
 <polyline points={polyline(pathPoints(patrol.path))} stroke="#0a1a26" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <polyline points={polyline(pathPoints(patrol.path))} stroke={colors[patrol.colour!]} stroke-width="17" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 {#each [{node:start,label:'A'},{node:end,label:'B'}]as endpoint}<circle cx={endpoint.node.x} cy={endpoint.node.y} r="66" fill="#eee0bb" stroke={colors[patrol.colour!]} stroke-width="12"/><text x={endpoint.node.x} y={endpoint.node.y+30} text-anchor="middle" fill="#15303c" font-size="90" font-family="Arial" font-weight="bold">{endpoint.label}</text>{/each}
</svg>
